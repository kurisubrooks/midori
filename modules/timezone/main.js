const request = require("superagent");

module.exports = (bot, channel, user, args, id, message, extra) => {
    const { util } = extra;

    if (args.length === 0 || (args.length === 1 && args[0] === "in")) {
        channel.send("Please specify a place you'd like to get the time of.");
        return;
    }

    request
        .get(`http://time.is/${args.join(" ").replace(/^in/, "")}`)
        .then(({ text }) => {
            const [, location] = text.match(/<div id="msgdiv"><h1>(.+)<\/h1>/);
            const [, date] = text.match(/<div id="dd" class="w90 tr" onclick="location='\/calendar'" title=".+">(.+)<\/div><div id="daydiv/);
            const [, time] = text.match(/<div id="twd">(\d+:\d+:\d+)/);

            channel.send(`${location} is now ${time}, ${date}`);
        })
        .catch(error => util.error(error.message, "timezone/main", channel));
};
