const Command = require("../../core/Command");
const Database = require("../../core/Database");
const { RichEmbed } = require("discord.js");

class Pay extends Command {
    constructor(client) {
        super(client, {
            name: "Pay",
            description: "Give another user some money.",
            aliases: ["send"]
        });
    }

    async run(message, channel, user, args) {
        const amount = args[0];

        if (message.pung.length === 0) {
            return message.reply("you didn't specify whom you want to pay!");
        }

        user = message.pung[0];

        const payee = await Database.Models.Bank.findOne({ where: { id: message.author.id } });
        const recipient = await Database.Models.Bank.findOne({ where: { id: user.id } });

        if (amount < 1) {
            return message.reply("amount must be greater than 0!");
        } else if (payee.balance < amount) {
            return message.reply("You have insufficient funds to complete this transaction.");
        } else if (user.user.bot) {
            return message.reply("You can't send funds to Bots!");
        } else if (!recipient) {
            return message.reply("You can't send funds to players who aren't active!");
        }

        const balance = Number(recipient.balance) + Number(amount);
        await recipient.update({ balance });
        await payee.update({ balance: payee.balance - amount });

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setAuthor(user.nickname || user.user.username, user.avatarURL || user.user.avatarURL)
            .addField("Paid", `${this.config.economy.emoji} ${amount}`)
            .addField("Balance", `${this.config.economy.emoji} ${balance}`);

        await channel.send({ embed });
        return this.delete(message);
    }
}

module.exports = Pay;
