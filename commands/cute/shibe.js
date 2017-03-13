const request = require("request-promise");
const { RichEmbed } = require("discord.js");
const Command = require("../../core/Command");

module.exports = class ShibeCommand extends Command {
    constructor(client) {
        super(client, {
            name: "shibe",
            description: "Post a randomly selected image of a Shiba Inu",
            aliases: ["shib", "doge"]
        });
    }

    async run(message, channel, user) {
        const response = await request({
            headers: { "User-Agent": "Mozilla/5.0" },
            uri: "http://shibe.online/api/shibes",
            json: true,
            qs: {
                count: 1,
                httpsurls: true
            }
        }).catch(err => {
            this.log(err, "fatal", true);
            return this.error(err, channel);
        });

        const embed = new RichEmbed()
            .setAuthor(user.nickname, user.avatarURL)
            .setImage(response[0]);

        await channel.sendEmbed(embed);
        return message.delete().catch(err => err.message);
    }
};
