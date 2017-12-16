const Command = require("../../core/Command");
const request = require("request-promise");
const { RichEmbed } = require("discord.js");

class Lick extends Command {
    constructor(client) {
        super(client, {
            name: "Lick",
            description: "Lick someone!",
            aliases: []
        });
    }

    async run(message, channel, user) {
        if (message.pung.length === 0) {
            return message.reply("you didn't specify whom you want to lick!");
        }

        const target = message.pung[0];

        if (target.id === user.id) {
            user = this.client.user;
        }

        const response = await request({
            headers: { "User-Agent": "Mozilla/5.0" },
            uri: "https://rra.ram.moe/i/r",
            qs: { type: "lick", nsfw: false },
            json: true
        }).catch(error => this.error(error.response.body.error, channel));

        if (!response) return false;

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setDescription(`**${user.tag}** licked **${target.user.tag}**`)
            .setImage(`https://cdn.ram.moe${response.path.replace("i/", "")}`);

        await channel.send({ embed });
        return this.delete(message);
    }
}

module.exports = Lick;
