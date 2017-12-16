const request = require("request-promise");
const { RichEmbed } = require("discord.js");
const Command = require("../../core/Command");

class Shibe extends Command {
    constructor(client) {
        super(client, {
            name: "Shibe",
            description: "Post a randomly selected image of a Shiba Inu",
            aliases: ["shib", "doge", "inu"]
        });
    }

    async run(message, channel, user) {
        const response = await request({
            headers: { "User-Agent": "Mozilla/5.0" },
            uri: "http://shibe.online/api/shibes",
            json: true,
            qs: {
                count: 1
                // httpsurls: true
            }
        }).catch(error => this.error(error.response.body.error, channel));

        if (!response) return false;

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setAuthor(user.nickname, user.avatarURL)
            .setImage(response[0]);

        await channel.send({ embed });
        return this.delete(message);
    }
}

module.exports = Shibe;
