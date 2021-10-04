import { Collection, Permissions, Client } from 'discord.js';
import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';

import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import config from '../config';
import keys from '../keychain.json';
import Logger from './Util/Logger';
import Database from './Database';
import { error, toUpper } from './Util/Util';

const rest = new REST({ version: '9' }).setToken(keys.discord);
const __dirname = dirname(fileURLToPath(import.meta.url));

export default class CommandManager {
  constructor(client) {
    this.client = client;
    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.aliases = new Collection();

    if (!this.client || !(this.client instanceof Client)) {
      throw new Error('Discord Client is required');
    }
  }

  async loadCommands(directory) {
    const folders = fs.readdirSync(path.join(__dirname, '..', directory));

    for (const folder of folders) {
      const location = path.join(__dirname, '..', directory, folder);
      if (!fs.statSync(location).isDirectory()) continue;
      const files = fs.readdirSync(location);

      for (const file of files) {
        if (path.extname(file) !== '.js') continue;

        const location = path.join(__dirname, '..', directory, folder, file);
        await this.startModule(location);
      }
    }

    this.registerCommands(this.slashCommands);
  }

  async startModule(location, reloaded) {
    const Command = (await import(`${location}?t=${new Date().getTime()}`)).default;
    const instance = new Command(this.client); // eslint-disable-line new-cap
    const commandName = instance.name.toLowerCase();
    instance.location = location;

    if (instance.disabled) return;
    if (this.commands.has(commandName)) {
      Logger.error('Start Module', `"${commandName}" already exists!`);
      throw new Error('Commands cannot have the same name');
    }

    Logger.info(`${reloaded ? 'Reloaded' : 'Loaded'} Command`, toUpper(commandName));
    this.commands.set(commandName, instance);
    this.slashCommands.set(commandName, instance.generateSlashCommand().toJSON());

    for (const alias of instance.aliases) {
      if (this.aliases.has(alias)) {
        throw new Error(`Commands cannot share aliases: ${instance.name} has ${alias}`);
      } else {
        this.aliases.set(alias, instance);
      }
    }
  }

  async registerCommands(commands) {
    const botId = this.client.user.id;
    const guildId = '824959087724068884';
    commands = Array.from(commands, ([, v]) => v);
    await rest.put(Routes.applicationGuildCommands(botId, guildId), { body: commands })
      .then(() => console.log('Successfully registered application commands.'))
      .catch(console.error);
  }

  reloadCommands() {
    Logger.warn('Reload Manager', 'Clearing Module Cache');
    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.aliases = new Collection();

    Logger.warn('Reload Manager', 'Reinitialising Modules');
    this.loadCommands(config.directory);

    Logger.success('Reload Commands', 'Success');
    return true;
  }

  reloadCommand(commandName) {
    const existingCommand = this.commands.get(commandName) || this.aliases.get(commandName);
    if (!existingCommand) return false;
    const location = existingCommand.location;
    for (const alias of existingCommand.aliases) this.aliases.delete(alias);
    this.commands.delete(commandName);
    this.startModule(location, true);
    return true;
  }

  runCommand(command, message, channel, user, args) {
    try {
      return command.run(message, channel, user, args);
    } catch(err) {
      Logger.error('Command', err);
      return error('Command', 'An error occurred while executing this command. Please try again later.', channel);
    }
  }

  findCommand(mentioned, args) {
    const commandName = mentioned && args.length > 0
      ? args.splice(0, 2)[1].toLowerCase()
      : args.splice(0, 1)[0].slice(config.sign.length).toLowerCase();
    const command = this.commands.get(commandName) || this.aliases.get(commandName);
    return { command, commandName };
  }

  async handleInteraction(interaction) {
    if (!interaction.isCommand()) return false;
    const { commandName } = interaction;

    // Find Command
    const command = this.commands.get(commandName) || this.aliases.get(commandName);
    if (!command) return false;

    // Helper Variables
    const channel = interaction.channel;
    const user = interaction.member;
    interaction.type = 'interaction';
    this.giveCoins(user);

    // Check if Command requires Admin
    if (command.admin && !config.admin.includes(user.user.id)) {
      interaction.reply({ content: 'You don\'t have access to this command.', ephemeral: true });
      return false;
    }

    // Log Message
    Logger.warn('Ran Command', `<${user.user.username}#${user.user.discriminator}>: ${interaction.commandName} ${JSON.stringify(interaction.options._hoistedOptions)}`);

    // Run Command
    return this.runCommand(command, interaction, channel, user, interaction.options);
  }

  async handleMessage(message) {
    // Don't Parse Bot Messages
    if (message.author.bot) return false;

    // Handle Server Configuration
    const { prefix } = await this.handleServer(message.guild);
    // Create Helper Variables
    let text = message.cleanContent;
    let args = message.content.split(' ');
    const channel = message.channel;
    const user = message.member || message.guild.members.cache.get(message.author.id);
    const attachments = message.attachments.size > 0;
    const pattern = new RegExp(`<@!?${this.client.user.id}>`, 'i');
    const mentioned = message.mentions.has(this.client.user) && pattern.test(args[0]);
    const triggered = message.content.startsWith(prefix);

    // Perform Various Checks
    this.giveCoins(user);
    if (text.length < 1 && !attachments) return false;
    if (attachments) text += attachments && text.length < 1 ? '<file>' : ' <file>';
    if (!triggered && !mentioned) return false;

    // Find Command
    const instance = this.findCommand(mentioned, args);
    const command = instance.command;

    // Set Variables
    message.type = 'message';
    message.context = this;
    message.command = instance.commandName;
    message.prefix = prefix;
    message.pingedUsers = [];
    if (!user.nickname) user.nickname = message.member?.displayName || message.author.username;

    // Check for Pinged user
    for (let index = 0; index < args.length; index++) {
      const userMatched = /<@!?([0-9]+)>/g.exec(args[index]);

      if (userMatched && userMatched.length > 1) {
        message.pingedUsers.push(message.guild.members.cache.get(userMatched[1]));
        args.splice(index, 1);
      }
    }

    // Mentioned but command doesn't exist
    if (!command && mentioned && args.length >= 0) {
      // Easter Egg for certain users
      if (user.id === '169842543410937856' || user.id === '268963316200767488') {
        return message.reply({ content: 'I-i\'m not sure I understand, but... p-please don\'t drink me!!!', allowedMentions: { repliedUser: false } });
      }

      // Generic response
      return message.reply({ content: 'I\'m not sure I understand... Try `help` to see what I know!', allowedMentions: { repliedUser: false } });
    }

    // Command doesn't exist
    if (!command) return false;

    // Check if Command requires Admin
    if (command.admin && !config.admin.includes(user.id)) return false;

    // Log Message
    Logger.warn('Ran Command', `<${message.author.tag}>: ${text}`);

    // Run Command
    return this.runCommand(command, message, channel, user, args);
  }

  getAdministrators(guild) {
    let owners = '';

    for (const member of guild.members.cache.values()) {
      if (member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        owners = owners === '' ? member.user.id : `${owners},${member.user.id}`;
      }
    }

    return owners;
  }

  async handleServer(guild) {
    if (!guild) return { prefix: config.sign };

    const id = guild.id;
    const owners = this.getAdministrators(guild);
    const Config = (await Database.Models.Config).default;

    let db = await Config.findOne({ where: { id } });

    if (!db) {
      db = await Config.create({ id, owners, prefix: config.sign, disabled: false, permissions: '' });
    }

    if (!db.owners || db.owners === '') {
      db = await db.update({ owners });
    }

    const prefix = db.prefix || config.sign;
    const disabled = db.disabled || false;
    return { prefix, disabled };
  }

  async giveCoins(user) {
    const Bank = (await Database.Models.Bank).default;
    const person = await Bank.findOne({ where: { id: user.id } });

    if (person) {
      return person.update({ balance: person.balance + 1 });
    } else {
      return Bank.create({ id: user.id, balance: 1 });
    }
  }
}
