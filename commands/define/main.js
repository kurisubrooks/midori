const { RichEmbed } = require("discord.js");
const request = require("superagent");
const markdown = require("to-markdown");
const Command = require("../../core/Command");

module.exports = class DefineCommand extends Command {
    constructor(client) {
        super(client, {
            name: "define",
            description: "Get the Definition of a Word",
            aliases: ["dictionary", "dict", "d"]
        });
    }

    async run(message, channel, user, args) {
        if (args.length < 1) {
            return message.reply("Please provide a query");
        }

        let response, description = "";

        try {
            response = await request.get("https://glosbe.com/gapi/translate")
                .query("from=en")
                .query("dest=en")
                .query("format=json")
                .query(`phrase=${args.join(" ")}`);
        } catch(err) {
            this.log(err, "fatal", true);
            return this.error(err, channel);
        }

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setAuthor(user.nickname, user.avatarURL)
            .setTitle(`Define: '${args.join(" ")}'`);

        if (response.body.result !== "ok") {
            return this.error("API Error", channel);
        }

        if (!response.body.tuc) {
            return this.error("No Results Returned", channel);
        }

        const definitions = response.body.tuc.find(obj => obj.meanings);

        if (definitions.meanings.length === 0) {
            return this.error("No Results Returned", channel);
        }

        for (let index = 0; index < 5; index++) {
            description += `**${index + 1}.**\u3000${markdown(definitions.meanings[index].text)}\n`;
        }

        embed.setDescription(description);
        await channel.sendEmbed(embed);
        return message.delete().catch(err => err.message);
    }
};
