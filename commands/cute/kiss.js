const Command = require("../../core/Command");
const request = require("request-promise");
const { RichEmbed } = require("discord.js");

class Kiss extends Command {
    constructor(client) {
        super(client, {
            name: "Kiss",
            description: "Kiss someone!",
            aliases: []
        });
    }

    async run(message, channel, user) {
        if (message.pung.length === 0) {
            return message.reply("you didn't specify whom you want to kiss!");
        }

        const target = message.pung[0];
        const response = await request({
            headers: { "User-Agent": "Mozilla/5.0" },
            uri: "https://rra.ram.moe/i/r",
            qs: { type: "kiss", nsfw: false },
            json: true
        }).catch(error => this.error(error.response.body.error, channel));

        if (!response) return false;

        const embed = new RichEmbed()
            .setImage(`https://rra.ram.moe${response.path}`);

        await channel.send(`*<@${user.id}> kisses ${target.nickname || target.username || target.user.username}*`, { embed });
        return this.delete(message);
    }
}

module.exports = Kiss;
