import qs from "qs";

module.exports = (bot, channel, user, args, id, message, extra) => {
    const place = args[0] ? args[0] : "sydney";
    const type = args[1] ? args[1] : "animated";
    const ext = type === "animated" ? "gif" : "png";
    const url = `https://api.kurisubrooks.com/api/radar?${qs.stringify({ id: place, type })}`;

    return channel.sendFile(url, `radar.${ext}`)
        .then(() => message.delete())
        .catch(error => extra.util.error(error, "radar", channel));
};
