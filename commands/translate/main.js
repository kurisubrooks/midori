const request = require("superagent");
const { RichEmbed } = require("discord.js");
const Command = require("../../core/Command");

module.exports = class TranslateCommand extends Command {
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
            this.log("Using Previous Message as Query", "debug");
            const res = await channel.fetchMessages({ before: message.id, limit: 1 });
            query = res.first().content;
        }
        /* else if (Number(query)) {
            this.log("Using Given Message (from ID) as Query", "debug");
            const res = await channel.fetchMessage(query);
            query = res.content;
        }*/

        let response;

        try {
            response = await request.get("https://api.kurisubrooks.com/api/translate")
                .query(`to=${to}`)
                .query(`from=${from}`)
                .query(`query=${query}`);
        } catch(err) {
            this.log(err, "fatal", true);
            return this.error(err, channel);
        }

        if (!response.body.ok) return this.error(response.body.error, channel);

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setAuthor(user.nickname, user.avatarURL)
            .addField(response.body.from.name, response.body.query)
            .addField(response.body.to.name, response.body.result);

        await channel.sendEmbed(embed);
        return message.delete().catch();
    }
};
