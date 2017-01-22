"use strict"

let type
let id

module.exports = (bot, channel, user, args, id, message, extra) => {
    /*if (args.length < 1) {
        channel.sendMessage("Please provide a query")
        return
    }*/

    channel.sendFile("https://api.kurisubrooks.com/api/radar?id=sydney", "radar.png")
        .then(() => message.delete())
        .catch(error => extra.util.error(error, "radar", channel))
}
