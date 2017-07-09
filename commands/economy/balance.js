const Command = require("../../core/Command");
const Database = require("../../core/Database");
const { RichEmbed } = require("discord.js");

class Balance extends Command {
    constructor(client) {
        super(client, {
            name: "Balance",
            description: "Get a user's balance.",
            aliases: ["balance", "bal", "coins", "cheese"]
        });
    }

    async run(message, channel, user) {
        if (message.pung.length > 0) {
            user = message.pung[0];
        }

        const data = await Database.Models.Bank.findOne({ where: { id: user.id } });
        const balance = data === null ? 0 : data.balance;

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setAuthor(user.nickname || user.user.username, user.avatarURL || user.user.avatarURL)
            .addField("Balance", `${this.config.economy.emoji} ${balance}`);

        await channel.send({ embed });
        return this.delete(message);
    }
}

module.exports = Balance;
