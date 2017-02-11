const request = require("superagent");
const moment = require("moment");

module.exports = (bot, channel, user, args, id, message, extra) => {
    const { util, config } = extra;

    if (args.length === 0 || (args.length === 1 && args[0] === "in")) {
        return channel.send("Please specify a location or timezone");
    }

    return request
        .get(`http://time.is/${args.join(" ").replace(/^in/, "")}`)
        .then(({ text }) => {
            const [, location] = text.match(/<div id="msgdiv"><h1>(.+)<\/h1>/);
            const [, date] = text.match(/<div id="dd" class="w90 tr" onclick="location='\/calendar'" title=".+">(.+)<\/div><div id="daydiv/);
            const [, time] = text.match(/<div id="twd">(\d+:\d+:\d+)/);

            let embed = {
                "color": config.colours.default,
                "fields": [
                    {
                        "name": "Location",
                        "value": location.replace("Time in ", "").replace(" now", "")
                    },
                    {
                        "name": "Time",
                        "value": moment(time, "HH:mm:ss").format("h:mm a"),
                        "inline": 1
                    },
                    {
                        "name": "Date",
                        "value": moment(date, "dddd, MMMM D, YYYY").format("ddd, MMM Do"),
                        "inline": 1
                    }
                ]
            };

            channel.send("", { embed })
                .then(() => message.delete())
                .catch(error => util.error(error, "time", channel));
        })
        .catch(error => util.error(error.message, "time", channel));
};
