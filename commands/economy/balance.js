const Command = require("../../core/Command");
const { RichEmbed } = require("discord.js");
const Database = require("../../core/Database");

class Balance extends Command {
    constructor(client) {
        super(client, {
            name: "Balance",
            description: "Get a user's balance.",
            aliases: ["balance", "bal", "coins"]
        });
    }

    async run(message) {
        const mentioned = message.mentions.users;
        let user;

        if (message.isMentioned(this.client.user)) {
            if (mentioned.size > 1) {
                user = mentioned.first(1);
            } else {
                user = message.author;
            }
        } else if (mentioned.size > 0) {
            user = mentioned.first();
        } else {
            user = message.author;
        }

        const data = await Database.Models.Bank.findOne({ where: { id: user.id } });

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setAuthor(user.nickname || user.username, user.avatarURL)
            .addField("Balance", data === null ? 0 : data.balance);

        await message.channel.send({ embed });
        return this.delete(message);
    }
}

module.exports = Balance;
