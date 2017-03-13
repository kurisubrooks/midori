const moment = require("moment");
const cheerio = require("cheerio");
const request = require("request-promise");
const { RichEmbed } = require("discord.js");
const Command = require("../../core/Command");

module.exports = class TimeCommand extends Command {
    constructor(client) {
        super(client, {
            name: "time",
            description: "Get the Time for your Given Location",
            aliases: ["clock"]
        });
    }

    async run(message, channel, user, args) {
        if (args.length < 1 || (args.length === 1 && args[0] === "in")) {
            return message.reply("Please provide a query");
        }

        const response = await request({
            headers: { "User-Agent": "Mozilla/5.0" },
            uri: `http://time.is/${args.join(" ").replace(/^in/, "")}`,
            resolveWithFullResponse: true,
            json: true
        }).catch(err => {
            this.log(err, "fatal", true);
            return this.error(err, channel);
        });

        if (response.statusCode === 404) return this.error("No Results", channel);
        if (response.statusCode === 500) return this.error("API Error", channel);

        const $ = cheerio.load(response.body);
        const place = $("#msgdiv > h1").text();
        const date = $("#dd").text();
        const time = $("#twd").text();

        if (!place) {
            return this.error("No Results", channel);
        }

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setAuthor(user.nickname, user.avatarURL)
            .addField("Location", place.replace("Time in ", "").replace(" now", ""))
            .addField("Time", moment(`${time}`, "HH:mm:ssA").format("h:mm a"), true)
            .addField("Date", date, true);

        await channel.sendEmbed(embed);
        return message.delete().catch(err => err.message);
    }
};
