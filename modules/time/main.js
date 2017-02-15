const request = require("request");
const moment = require("moment");
const cheerio = require("cheerio");

module.exports = (bot, channel, user, args, id, message, extra) => {
    const { util, config } = extra;

    if (args.length === 0 || (args.length === 1 && args[0] === "in")) {
        return channel.send("Please specify a location or timezone");
    }

    let fetch = {
        headers: { "User-Agent": "Mozilla/5.0" },
        url: `http://time.is/${args.join(" ").replace(/^in/, "")}`
    };

    return request.get(fetch, (error, res, body) => {
        if (error) {
            return util.error(error, "time", channel);
        }

        const $ = cheerio.load(body);
        const place = $("#msgdiv > h1").text();
        const date = $("#dd").text();
        const time = $("#twd").text();

        if (!place) {
            return util.error("No Results", "time", channel);
        }

        let embed = {
            "color": config.colours.default,
            "fields": [
                {
                    "name": "Location",
                    "value": place.replace("Time in ", "").replace(" now", "")
                },
                {
                    "name": "Time",
                    "value": moment(`${time}`, "HH:mm:ssA").format("h:mm a"),
                    "inline": 1
                },
                {
                    "name": "Date",
                    "value": date,
                    "inline": 1
                }
            ]
        };

        return channel.send("", { embed })
            .then(() => message.delete())
            .catch(error => util.error(error, "time", channel));
    });
};
