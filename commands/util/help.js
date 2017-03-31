const Command = require("../../core/Command");
const { RichEmbed } = require("discord.js");
const config = require("../../config.js");

class Help extends Command {
    constructor(client) {
        super(client, {
            name: "Help",
            description: "Gets Help On Commands",
            aliases: ["halp"]
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
                const { name, description, aliases } = command;
                aliases.unshift(command.name.toLowerCase());

                return `**${name}** — ${description}\nMatches: ${aliases.map(alias => `\`${alias}\``).join(", ")}\n`;
            });

            text.unshift(`Type \`${config.sign}<command>\`, or \`@Midori#7635 <command>\` to use a command.\n`);
            text.unshift("__**List of available commands**__\n");

            await user.sendMessage(text.join("\n"));
            await message.reply("Sent you a DM with information!");
            return message.delete().catch(err => err.message);
        }

        const command = this.findCommand(commands, args[0]);
        if (!command) return message.reply("That command does not exist!");
        const embed = new RichEmbed()
            .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL)
            .setThumbnail(this.client.user.displayAvatarURL)
            .addField("Usage", `\`${config.sign}${command.name.toLowerCase()}\``, true)
            .addField("Aliases", [command.name, ...command.aliases].map(name => name.toLowerCase()).join(", "), true)
            .addField("Description", command.description);
        await message.channel.send({ embed });
        return message.delete().catch(err => err.message);
    }
}

module.exports = Help;
