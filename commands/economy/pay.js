const Command = require("../../core/Command");
const { RichEmbed } = require("discord.js");
const Database = require("../../core/Database");

class EconomyPay extends Command {
    constructor(client) {
        super(client, {
            name: "Pay",
            description: "Give another user some money.",
            aliases: ["send", "give", "pay"],
            disabled: true
        });
    }

    async run(message, channel, user, args) {
        const mentioned = message.mentions.users;

        // No Args Supplied
        if (mentioned.size === 0) {
            return message.reply("Please provide a valid user.");
        }

        if (isNaN(args[1])) {
            return message.reply("Please provide a valid number");
        }

        const amount = parseInt(args[1]);

        const DB = await Database.Models.Users.findOne({ where: { id: user.id } });
        const data = JSON.parse(DB.data);

        if (data.balance > args[1]) {
            return message.reply("You don't have enough balance!");
        }

        if (args[1] < 1) {
            return message.reply("Amount must be greater than 1.");
        }

        const target = mentioned.first();
        const targetDB = await Database.Models.Users.findOne({ where: { id: target.id } });
        const targetData = JSON.parse(targetDB.data);

        data.balance -= amount;
        targetData.balance += amount;

        await DB.update({ data: JSON.stringify(data) });
        await targetDB.update({ data: JSON.stringify(targetData) });

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setAuthor(user.nickname, user.avatarURL)
            .addField("Paid", amount)
            .addField("Balance", data.balance);

        await message.channel.send({ embed });
        return this.delete(message);
    }
}

module.exports = EconomyPay;
