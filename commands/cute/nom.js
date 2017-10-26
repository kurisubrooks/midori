const Command = require("../../core/Command");
const request = require("request-promise");
const { RichEmbed } = require("discord.js");

class Nom extends Command {
    constructor(client) {
        super(client, {
            name: "Nom",
            description: "Nom on some tasty nummys!",
            aliases: ["food"]
        });
    }

    async run(message, channel) {
        const response = await request({
            headers: { "User-Agent": "Mozilla/5.0" },
            uri: "https://rra.ram.moe/i/r",
            qs: { type: "nom", nsfw: false },
            json: true
        }).catch(error => this.error(error.response.body.error, channel));

        if (!response) return false;

        const embed = new RichEmbed()
            .setImage(`https://rra.ram.moe${response.path}`);

        await channel.send({ embed });
        return this.delete(message);
    }
}

module.exports = Nom;
