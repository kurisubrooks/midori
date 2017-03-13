const request = require("request-promise");
const { RichEmbed } = require("discord.js");
const Command = require("../../core/Command");

module.exports = class CatCommand extends Command {
    constructor(client) {
        super(client, {
            name: "cat",
            description: "Post a randomly selected image of a cat",
            aliases: ["kat", "kitty"]
        });
    }

    async run(message, channel, user) {
        const response = await request({
            headers: { "User-Agent": "Mozilla/5.0" },
            uri: "http://shibe.online/api/cats",
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
