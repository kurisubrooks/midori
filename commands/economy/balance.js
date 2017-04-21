const Command = require("../../core/Command");
const { RichEmbed } = require("discord.js");
const Database = require("../../core/Database");

class EconomyBalance extends Command {
    constructor(client) {
        super(client, {
            name: "Balance",
            description: "Get a user's balance.",
            aliases: ["balance", "bal"]
        });
    }

    async run(message) {
        const mentioned = message.mentions.users;
        const user = mentioned.size > 0 ? mentioned.first() : message.author;
        const data = JSON.parse((await Database.Models.Users.findOne({ where: { id: user.id } })).data);

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setAuthor(user.nickname, user.avatarURL)
            .addField("Balance", data.balance === null ? 0 : data.balance);

        await message.channel.send({ embed });
        return this.delete(message);
    }
}

module.exports = EconomyBalance;
