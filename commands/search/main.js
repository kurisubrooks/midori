const request = require("superagent");
const { RichEmbed } = require("discord.js");
const Command = require("../../core/Command");

module.exports = class SearchCommand extends Command {
    constructor(client) {
        super(client, {
            name: "search",
            description: "Return Google Search Results",
            aliases: ["s", "google"]
        });
    }

    async run(message, channel, user, args) {
        if (args.length < 1) {
            return message.reply("Please provide a query");
        }

        let response;

        try {
            response = await request.get("https://www.googleapis.com/customsearch/v1")
                .query(`key=${this.keychain.google.search}`)
                .query("num=1")
                .query("cx=006735756282586657842:s7i_4ej9amu")
                .query(`q=${args.join(" ")}`);
        } catch(err) {
            this.log(err, "fatal", true);
            return this.error(err, channel);
        }

        if (response.body.searchInformation.totalResults !== "0") {
            const result = response.body.items[0];
            const link = decodeURIComponent(result.link);

            const embed = new RichEmbed()
                .setColor(this.config.colours.default)
                .setAuthor(user.nickname, user.avatarURL)
                .setURL(link)
                .setTitle(result.title)
                .setDescription(result.snippet)
                .setFooter(result.link, result.link);

            if (result.pagemap && result.pagemap.cse_thumbnail) embed.setThumbnail(result.pagemap.cse_thumbnail[0].src);

            await channel.sendEmbed(embed);
            return message.delete().catch(err => err.message);
        }

        return false;
    }
};
