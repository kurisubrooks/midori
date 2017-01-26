"use strict";

const qs = require("qs");

module.exports = (bot, channel, user, args, id, message, extra) => {
    let place = args[0] ? args[0] : "sydney";
    let type = args[1] ? args[1] : "static";
    let ext = type === "animated" ? "gif" : "png";
    let url = `https://api.kurisubrooks.com/api/radar?${qs.stringify({ id: place, type })}`;

    return channel.sendFile(url, `radar.${ext}`)
        .then(() => message.delete())
        .catch(error => extra.util.error(error, "radar", channel));
};
