const Command = require("../../core/Command");
const config = require("../../config");

class Help extends Command {
    constructor(client) {
        super(client, {
            name: "Help",
            description: "Get a list of usable commands.",
            aliases: []
        });
    }

    async run(message, channel, user) {
        let commands = message.context.commands;
        if (!config.admin.includes(user.id)) commands = commands.filter(command => !command.admin);

        const text = commands.map(command => {
            const { name, description, aliases } = command;
            aliases.unshift(command.name.toLowerCase());

            return `**${name}** — ${description}\nMatches: ${aliases.map(alias => `\`${alias}\``).join(", ")}\n`;
        });

        text.unshift(`Type \`${config.sign}<command>\` to use a command.\n`);
        text.unshift("__**List of available commands**__\n");

        if (channel.type !== "dm") message.reply("DM'd you the info");
        return user.sendMessage(text.join("\n"));
    }
}

module.exports = Help;
