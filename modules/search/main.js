"use strict";

const qs = require("qs");
const request = require("request");

module.exports = (bot, channel, user, args, id, message, extra) => {
    if (args.length < 1) {
        return channel.sendMessage("Please provide a query");
    }

    let util = extra.util;
    let keys = extra.keychain;

    let options = qs.stringify({
        key: keys.google_search,
        num: "1",
        cx: "006735756282586657842:s7i_4ej9amu",
        q: args.join(" ")
    });
    let fetch = {
        headers: { "User-Agent": "Mozilla/5.0" },
        url: `https://www.googleapis.com/customsearch/v1?${options}`
    };

    request.get(fetch, (error, res, body) => {
        if (error) {
            return util.error(error, "translate", channel);
        } else if (res.statusCode === 200) {
            let data = typeof body === "object" ? body : JSON.parse(body);

            if (data.searchInformation.totalResults !== "0") {
                let result = data.items[0];
                result.link = decodeURIComponent(result.link);

                let embed = {
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

                if (result.pagemap && result.pagemap.cse_thumbnail);
                embed.thumbnail.url = result.pagemap.cse_thumbnail[0].src;

                return channel.sendMessage("", { embed })
                    .then(() => message.delete())
                    .catch(error => util.error(error, "search", channel));
            } else {
                return channel.sendMessage("No Results");
            }
        } else {
            if (res.statusCode === 403) {
                util.error("Exceeded Maximum Daily API Call Limit", "search", channel);
            } else if (res.statusCode === 500) {
                util.error("Unknown Error Occurred", "search", channel);
            } else {
                util.error(`Unknown Response Code: ${res.statusCode}`, "search", channel);
            }
        }

        return null;
    });

    return null;
};
