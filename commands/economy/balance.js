const Command = require("../../core/Command");
const Database = require("../../core/Database");
const { RichEmbed } = require("discord.js");

class Balance extends Command {
    constructor(client) {
        super(client, {
            name: "Balance",
            description: "Get a user's balance.",
            aliases: ["balance", "bal", "coins"]
        });
    }

    async run(message, channel, user, args) {
        for (let index = 0; index < args.length; index++) {
            const userMatched = /<@!?([0-9]+)>/g.exec(args[index]);

            if (userMatched && userMatched.length > 1) {
                user = message.guild.members.get(userMatched[1]);
                args.splice(index, 1);
            }
        }

        const data = await Database.Models.Bank.findOne({ where: { id: user.user.id } });
        const balance = data === null ? 0 : data.balance;

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setAuthor(user.nickname || user.user.username, user.user.avatarURL)
            .addField("Balance", `${this.config.economy.emoji} ${balance}`);

        await channel.send({ embed });
        return this.delete(message);
    }
}

module.exports = Balance;
