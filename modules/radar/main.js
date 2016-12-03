"use strict"

module.exports = (bot, channel, user, args, id, message, extra) =>
    channel.sendFile("http://kurisu.pw/api/radar", "radar.gif")
        .then(() => message.delete())
        .catch(error => extra.util.error(error, "radar", channel))
