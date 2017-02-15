import qs from "qs";
import request from "request";

module.exports = (bot, channel, user, args, id, message, extra) => {
    if (args.length < 1) {
        return channel.sendMessage("Please provide a query");
    }

    const { util, keychain } = extra;
    const options = qs.stringify({
        key: keychain.google.search,
        num: "1",
        cx: "006735756282586657842:s7i_4ej9amu",
        q: args.join(" ") // eslint-disable-line id-length
    });

    const fetch = {
        headers: { "User-Agent": "Mozilla/5.0" },
        url: `https://www.googleapis.com/customsearch/v1?${options}`
    };

    return request.get(fetch, (error, res, body) => {
        if (error) {
            return util.error(error, "translate", channel);
        }

        if (res.statusCode === 200) {
            const data = typeof body === "object" ? body : JSON.parse(body);

            if (data.searchInformation.totalResults !== "0") {
                const result = data.items[0];
                result.link = decodeURIComponent(result.link);

                const embed = {
                    color: extra.colours.default,
                    author: {
                        name: extra.trigger.nickname,
                        icon_url: extra.trigger.avatar
                    },
                    url: result.link,
                    title: result.title,
                    description: result.snippet,
                    thumbnail: { },
                    footer: { text: result.link }
                };

                if (result.pagemap && result.pagemap.cse_thumbnail) embed.thumbnail.url = result.pagemap.cse_thumbnail[0].src;

                return channel.sendMessage("", { embed })
                    .then(() => message.delete())
                    .catch(error => util.error(error, "search", channel));
            }

            return channel.sendMessage("No Results");
        } else {
            if (res.statusCode === 403) {
                return util.error("Exceeded Maximum Daily API Call Limit", "search", channel);
            }

            if (res.statusCode === 500) {
                return util.error("Unknown Error Occurred", "search", channel);
            }

            return util.error(`Unknown Response Code: ${res.statusCode}`, "search", channel);
        }
    });
};
