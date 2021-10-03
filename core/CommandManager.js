import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Collection, Permissions, Client } from 'discord.js';

import config from '../config';
import Logger from './Util/Logger';
import Database from './Database';
import { error, toUpper } from './Util/Util';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default class CommandManager {
  constructor(client) {
    this.client = client;
    this.commands = new Collection();
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
  }

  async startModule(location, reloaded) {
    const Command = await import(location);
    const instance = new Command.default(this.client); // eslint-disable-line new-cap
    const commandName = instance.name.toLowerCase();
    instance.location = location;

    if (instance.disabled) return;
    if (this.commands.has(commandName)) {
      Logger.error('Start Module', `"${commandName}" already exists!`);
      throw new Error('Commands cannot have the same name');
    }

    Logger.info(`${reloaded ? 'Reloaded' : 'Loaded'} Command`, toUpper(commandName));
    this.commands.set(commandName, instance);

    for (const alias of instance.aliases) {
      if (this.aliases.has(alias)) {
        throw new Error(`Commands cannot share aliases: ${instance.name} has ${alias}`);
      } else {
        this.aliases.set(alias, instance);
      }
    }
  }

  reloadCommands() {
    Logger.warn('Reload Manager', 'Clearing Module Cache');
    this.commands = new Collection();
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
    delete require.cache[require.resolve(location)];
    this.startModule(location, true);
    return true;
  }

  runCommand(command, message, channel, user, args) {
    try {
      return command.run(message, channel, user, args);
    } catch(err) {
      return error('Command', err);
    }
  }

  findCommand(mentioned, args) {
    const commandName = mentioned && args.length > 0
      ? args.splice(0, 2)[1].toLowerCase()
      : args.splice(0, 1)[0].slice(config.sign.length).toLowerCase();
    const command = this.commands.get(commandName) || this.aliases.get(commandName);
    return { command, commandName };
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
    // const server = message.guild ? message.guild.name : "DM";
    const user = message.author;
    const attachments = message.attachments.size > 0;
    const pattern = new RegExp(`<@!?${this.client.user.id}>`, 'i');
    const mentioned = message.mentions.has(this.client.user) && pattern.test(args[0]);
    const triggered = message.content.startsWith(prefix);

    // Perform Various Checks
    this.giveCoins(user);
    if (text.length < 1 && !attachments) return false;
    if (attachments) text += attachments && text.length < 1 ? '<file>' : ' <file>';
    if (!triggered && !mentioned) return false;

    // Bot was mentioned but no command supplied, await command
    /*
    if (mentioned && args.length === 1) {
      await message.reply('Hi, how can I help? Respond with the command you want to use. Expires in 60s, otherwise use `cancel` to close this prompt.');
      const filter = msg => msg.author.id === user.id;
      const res = await channel.awaitMessages(filter, { max: 1, time: 60000 });
      message = res.first();

      if (message.content === 'cancel') {
        channel.send('Got it.');
        return false;
      }

      // check if they responded with a command

      text += ` ${message.content}`;
      args = [args[0], ...message.content.split(' ')];
    }
    */

    // Find Command
    const instance = this.findCommand(mentioned, args);
    const command = instance.command;

    // Set Variables
    message.context = this;
    message.command = instance.commandName;
    message.prefix = prefix;
    message.pung = [];
    user.nickname = message.member?.displayName || message.author.username;

    // Check for Pinged user
    for (let index = 0; index < args.length; index++) {
      const userMatched = /<@!?([0-9]+)>/g.exec(args[index]);

      if (userMatched && userMatched.length > 1) {
        message.pung.push(message.guild.members.cache.get(userMatched[1]));
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
    Logger.warn('Ran Command', `<${user.tag}}>: ${text}`);

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

    let db = await Database.Models.Config.findOne({ where: { id } });

    if (!db) {
      db = await Database.Models.Config.create({ id, owners, prefix: config.sign, disabled: false, permissions: '' });
    }

    if (!db.owners || db.owners === '') {
      db = await db.update({ owners });
    }

    const prefix = db.prefix || config.sign;
    const disabled = db.disabled || false;
    return { prefix, disabled };
  }

  async giveCoins(user) {
    const db = Database.Models.Bank;
    const person = await db.findOne({ where: { id: user.id } });

    if (person) {
      return person.update({ balance: person.balance + 1 });
    } else {
      return db.create({ id: user.id, balance: 1 });
    }
  }
}
