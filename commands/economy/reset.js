const Command = require("../../core/Command");
const Database = require("../../core/Database");

class ResetBalance extends Command {
    constructor(client) {
        super(client, {
            name: "reset",
            description: "Sets a user's balance to 0",
            aliases: [],
            admin: true
        });
    }

    async run(message, channel, user, args) {
        if (args.length === 0) return message.reply("Who's balance did you mean to reset? Try again...");

        for (let index = 0; index < args.length; index++) {
            const userMatched = /<@!?([0-9]+)>/g.exec(args[index]);

            if (userMatched && userMatched.length > 1) {
                user = message.guild.members.get(userMatched[1]);
                args.splice(index, 1);
            }
        }

        const recipient = await Database.Models.Bank.findOne({ where: { id: user.id } });

        if (user.bot || user.user.bot) {
            return message.reply("Bots are not enabled for use with Economy.");
        } else if (!recipient) {
            return message.reply("You cannot reset the balance of a user who has no balance.");
        }

        await recipient.update({ balance: 0 });
        return message.reply("Balance Reset.");
    }
}

module.exports = ResetBalance;
