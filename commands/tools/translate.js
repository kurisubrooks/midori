const request = require("request-promise");
const { RichEmbed } = require("discord.js");
const Command = require("../../core/Command");

class Translate extends Command {
    constructor(client) {
        super(client, {
            name: "Translate",
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
        } else if (Number(query)) {
            this.log("Using Given Message (from ID) as Query", "debug");
            const res = await channel.fetchMessage(query);
            query = res.content;
        }

        const response = await request({
            method: "POST",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Authorization": this.keychain.sherlock
            },
            uri: "https://api.kurisubrooks.com/api/translate",
            body: { to, from, query },
            json: true
        }).catch(error => this.error(error.response.body.error, channel));

        if (!response) return false;

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setAuthor(user.nickname, user.avatarURL)
            .addField(response.from.name, response.query)
            .addField(response.to.name, response.result);

        await channel.send({ embed });
        return this.delete(message);
    }
}

module.exports = Translate;
