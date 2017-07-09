const Command = require("../../core/Command");
const Database = require("../../core/Database");

class ResetBalance extends Command {
    constructor(client) {
        super(client, {
            name: "reset",
            description: "Sets a user's balance to 0",
            aliases: [],
            admin: true,
            disabled: true
        });
    }

    async run(message, channel, user) {
        if (message.pung.length === 0) {
            return message.reply("you didn't specify whom you want to pay!");
        }

        user = message.pung[0];

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
