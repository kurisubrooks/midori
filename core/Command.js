import { SlashCommandBuilder } from '@discordjs/builders';
import { error, toUpper } from './Util/Util';
import Logger from './Util/Logger';
import keychain from '../keychain.json';
import config from '../config';

export default class Command {
  constructor(client, data = {}) {
    if (typeof data !== 'object') throw new TypeError('Client data parameter must be an object');

    this.client = client;
    this.config = config;
    this.keychain = keychain;

    this.name = data.name;
    this.description = data.description;
    this.aliases = data.aliases || [];
    this.args = data.args || [];
    this.process = data.process || false;
    this.usage = data.usage || '';
    this.guild = data.guild || false;
    this.admin = data.admin || false;
    this.disabled = data.disabled || false;

    if (!this.name) throw new Error('Command Name is required');
    if (!this.description) throw new Error('Command Description is required');
    if (typeof this.name !== 'string') throw new TypeError('Command name must be a string');
    if (typeof this.description !== 'string') throw new TypeError('Command description must be a string');
    if (!(this.aliases instanceof Array)) throw new TypeError('Command aliases must be an array of strings');
    if (this.aliases.some(alias => typeof alias !== 'string')) throw new TypeError('Command aliases must be an array of strings');
    if (typeof this.guild !== 'boolean') throw new TypeError('Command guildOnly property must be a boolean');
    if (typeof this.admin !== 'boolean') throw new TypeError('Command adminOnly property must be a boolean');
    if (typeof this.disabled !== 'boolean') throw new TypeError('Command disabled property must be a boolean');
  }

  run() {
    throw new Error('Missing Run Method');
  }

  log(message, style = 'success', stacktrace) {
    return Logger[style](toUpper(this.name), message, stacktrace);
  }

  error(message, channel) {
    return error(this.name, message, channel);
  }

  generateSlashCommand() {
    const slashCommand = new SlashCommandBuilder()
      .setName(this.name.toLowerCase())
      .setDescription(this.description);

    if (this.args) {
      const handle = (opt, i) => {
        const option = opt.setName(i.name)
          .setDescription(i.desc)
          .setRequired(i.required || false);

        if (i.choices) {
          i.choices.forEach(v => option.addChoice(v.name, v.value));
        }

        return option;
      };

      this.args.forEach(i => {
        switch(i.takes) {
          case 'string':
            slashCommand.addStringOption(opt => handle(opt, i));
            break;
          case 'boolean':
            slashCommand.addBooleanOption(opt => handle(opt, i));
            break;
        }
      });
    }

    return slashCommand;
  }

  hasAdmin(user) {
    return config.admin.includes(user.id);
  }
}
