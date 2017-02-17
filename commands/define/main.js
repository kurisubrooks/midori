import { RichEmbed } from "discord.js";
import request from "request-promise";
import markdown from "to-markdown";
import Command from "../../core/Command";

module.exports = class DefineCommand extends Command {
    constructor(client) {
        super(client, {
            name: "define",
            description: "Get the Definition of a Word",
            aliases: ["dictionary", "dict", "d"],
            expectedArgs: ["query"]
        });
    }

    async run(message, channel, user, args) {
        if (args.length < 1) {
            return message.reply("Please provide a query");
        }

        const response = await request({
            uri: `https://glosbe.com/gapi/translate?from=en&dest=en&format=json&phrase=${args.join(" ")}`,
            headers: { "User-Agent": "Mozilla/5.0" },
            json: true
        });

        let description = "";
        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setAuthor(user.nickname, user.avatar)
            .setTitle(`Define: '${args.join(" ")}'`);

        if (response.result !== "ok") {
            return this.error("API Error", channel);
        }

        if (!response.tuc || response.tuc[0].meanings.length === 0) {
            return this.error("No Results Returned", channel);
        }

        for (let index = 0; index < 5; index++) {
            description += `**${index + 1}.**\u3000${markdown(response.tuc[0].meanings[index].text)}\n`;
        }

        embed.setDescription(description);
        await channel.sendEmbed(embed);
        return message.delete();
    }
};
