import request from "request-promise";
import { RichEmbed } from "discord.js";
import Command from "../../core/Command";

export default class TranslateCommand extends Command {
    constructor(client) {
        super(client, {
            name: "translate",
            description: "Translate a Query with Google Translate",
            aliases: ["t"]
        });
    }

    async run(message, channel, user, args) {
        if (args.length < 1) {
            return message.reply("Please provide a query");
        }

        const langs = args[0].split(",");
        const to = langs[0].toLowerCase();
        const from = langs.length > 1 ? langs[1] : null;
        let query = to === langs[0].toLowerCase() ? args.slice(1).join(" ") : args.join(" ");

        if (query === "^") {
            query = (await channel.fetchMessages({ before: message.id, limit: 1 })).first().content;
        } else if (Number(query)) {
            query = (await channel.fetchMessage(query)).content;
        }

        const response = await request({
            method: "POST",
            uri: "https://api.kurisubrooks.com/api/translate",
            headers: { "User-Agent": "Mozilla/5.0" },
            json: true,
            body: {
                to: to,
                from: from || "",
                query: query
            }
        });

        if (!response.ok) return this.error(response.error, channel);

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setAuthor(user.nickname, user.avatarURL)
            .addField(response.from.name, response.query)
            .addField(response.to.name, response.result);

        await channel.sendEmbed(embed);
        return message.delete();
    }
}
