import { EmbedBuilder } from 'discord.js';
import Command from '../../core/Command';
import config from '../../config.js';

export default class Help extends Command {
  constructor(client) {
    super(client, {
      name: 'Help',
      description: 'Gets Help On Commands',
      aliases: ['commands']
    });
  }

  findCommand(commands, name) {
    const lower = name.toLowerCase();

    for (const command of commands.values()) {
      if (command.name.toLowerCase().startsWith(lower)) return command;
    }

    return null;
  }

  async run(message, channel, user, args) {
    let commands = message.context.commands;
    if (!config.admin.includes(user.id)) commands = commands.filter(command => !command.admin);

    if (!args[0]) {
      const text = commands.map(command => {
        const aliases = [command.name, ...command.aliases].map(name => name.toLowerCase());
        return `**${command.name}** — ${command.description}\nMatches: ${aliases.map(alias => `\`${alias}\``).join(', ')}\n`;
      });

      text.unshift(`Type \`${config.sign}<command>\`, or \`@Midori#7635 <command>\` to use a command.\n`);
      text.unshift('__**List of available commands**__\n');

      if (channel.type !== 'dm') await message.reply('Sent you a DM with information!');
      return user.send(text.join('\n'), { split: true });
    }

    const command = this.findCommand(commands, args[0]);
    if (!command) return message.reply('That command does not exist!');

    const embed = new EmbedBuilder()
      .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
      .setThumbnail(this.client.user.displayAvatarURL())
      .addFields([
        { name: 'Usage', value: `\`${config.sign}${command.name.toLowerCase()}\``, inline: true },
        { name: 'Aliases', value: [command.name, ...command.aliases].map(name => name.toLowerCase()).join(', '), inline: true },
        { name: 'Description', value: command.description }
      ]);

    return channel.send({ embeds: [embed] });
  }
}
