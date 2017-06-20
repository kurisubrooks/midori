const Command = require("../../core/Command");
const Database = require("../../core/Database");

class Prefix extends Command {
    constructor(client) {
        super(client, {
            name: "Prefix",
            description: "Set your server's prefix",
            aliases: ["setprefix"]
        });
    }

    async run(message, channel, user, args) {
        const db = await Database.Models.Config.findOne({ where: { id: message.guild.id } });

        if (!db) {
            return message.reply("your server doesn't exist in the database! This is most likely an internal error. Run the command again, and if it fails again, please contact <@132368482120499201>.");
        }

        if (args.length === 0) {
            return message.reply(`the prefix for this server is: \`${db.prefix}\``);
        }

        if (!db.owners.includes(user.id)) {
            return message.reply("only users with the 'Administrator' permission may use this command.");
        }

        if (args.length > 1) {
            return message.reply("only 1 argument is accepted for this command.");
        }

        await db.update({ prefix: args[0] });
        return message.reply(`prefix successfully changed to \`${args[0]}\``);
    }
}

module.exports = Prefix;
