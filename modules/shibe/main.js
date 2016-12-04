"use strict"

const request = require("request")

module.exports = (bot, channel, user, args, id, message, extra) =>
    request(`http://shibe.online/api/shibes?count=1&httpsurls=true`, (error, response, body) => {
        if (error) {
            extra.util.error(error, "shibe", channel)
            return
        }

        channel.sendFile(JSON.parse(body)[0])
            .then(msg => message.delete())
            .catch(error => extra.util.error(error, "shibe", channel))
    })
