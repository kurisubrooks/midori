"use strict"

const request = require("request")

module.exports = (bot, channel, user, args, id, message, extra) => {
    let util = extra.util
    let url = `http://shibe.online/api/shibes?count=1&httpsurls=true`

    request(url, (error, response, body) => {
        if (error) {
            util.error(error, "shibe", channel)
            return
        }

        channel.sendFile(JSON.parse(body)[0])
            .then(msg => message.delete())
            .catch(error => util.error(error, "shibe", channel))
    })
}
