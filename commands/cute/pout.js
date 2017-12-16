const Command = require("../../core/Command");
const request = require("request-promise");
const { RichEmbed } = require("discord.js");

class Pout extends Command {
    constructor(client) {
        super(client, {
            name: "Pout",
            description: "Pout!",
            aliases: []
        });
    }

    async run(message, channel, user) {
        const response = await request({
            headers: { "User-Agent": "Mozilla/5.0" },
            uri: "https://rra.ram.moe/i/r",
            qs: { type: "pout", nsfw: false },
            json: true
        }).catch(error => this.error(error.response.body.error, channel));

        if (!response) return false;

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setDescription(`**${user.tag}** pouted`)
            .setImage(`https://cdn.ram.moe${response.path.replace("i/", "")}`);

        await channel.send({ embed });
        return this.delete(message);
    }
}

module.exports = Pout;
