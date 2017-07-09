const Command = require("../../core/Command");
const Database = require("../../core/Database");
const { RichEmbed } = require("discord.js");

class Leaderboard extends Command {
    constructor(client) {
        super(client, {
            name: "Leaderboard",
            description: "Get the richest users.",
            aliases: ["top", "richest", "list"]
        });
    }

    async run(message, channel) {
        const db = await Database.Models.Bank.findAll({ order: "balance DESC" }).all();
        const embed = new RichEmbed()
            .setTitle("Leaderboard")
            .setColor(this.config.colours.default);

        let total = 0;

        for (let index = 0; index < db.length; index++) {
            if (total > 9) break;

            const user = message.guild.members.get(db[index].id);
            if (!user) continue;
            if (user.user.bot) continue;

            embed.addField(`${total + 1}. ${user.nickname || user.user.username}`, `${this.config.economy.emoji} ${db[index].balance}`, true);
            total++;
        }

        await channel.send({ embed });
        return this.delete(message);
    }
}

module.exports = Leaderboard;
