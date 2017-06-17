const Command = require("../../core/Command");
const { RichEmbed } = require("discord.js");
const Database = require("../../core/Database");

class EconomyBalance extends Command {
    constructor(client) {
        super(client, {
            name: "Balance",
            description: "Get a user's balance.",
            aliases: ["balance", "bal", "coins"]
        });
    }

    async run(message) {
        const mentioned = message.mentions.users;
        const user = message.isMentioned(this.client.user)
                        ? mentioned.size > 1
                            ? mentioned.first(2)
                            : message.author
                        : mentioned.size > 0
                            ? mentioned.first()
                            : message.author;
        const data = await Database.Models.Bank.findOne({ where: { id: user.id } });

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setAuthor(user.nickname || user.username, user.avatarURL)
            .addField("Balance", data === null ? 0 : data.balance);

        await message.channel.send({ embed });
        return this.delete(message);
    }
}

module.exports = EconomyBalance;
