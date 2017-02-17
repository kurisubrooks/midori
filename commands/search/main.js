import qs from "qs";
import request from "request-promise";
import { RichEmbed } from "discord.js";
import Command from "../../core/Command";

export default class SearchCommand extends Command {
    constructor(client) {
        super(client, {
            name: "search",
            description: "Return Google Search Results",
            aliases: ["s", "google"],
            expectedArgs: ["query"]
        });
    }

    async run(message, channel, user, args) {
        if (args.length < 1) {
            return message.reply("Please provide a query");
        }

        const options = qs.stringify({
            key: this.keychain.google.search,
            num: "1", cx: "006735756282586657842:s7i_4ej9amu",
            q: args.join(" ") // eslint-disable-line id-length
        });

        const response = await request({
            uri: `https://www.googleapis.com/customsearch/v1?${options}`,
            headers: { "User-Agent": "Mozilla/5.0" },
            json: true
        });

        if (response.searchInformation.totalResults !== "0") {
            const result = response.items[0];
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
            return message.delete();
        }

        return false;
    }
}
