"use strict"

const chalk = require("chalk")

module.exports = (bot, channel, user, args, id, message, extra) => {
    const util = extra.util

    if (extra.masters.indexOf(extra.trigger.id) >= 0) {

        // Stop or Restart Bot
        if (args[0] === "stop") {
            channel.sendMessage("Restarting").then(setTimeout(() => process.exit(0), 500))

            /*channel.sendFile("https://i.imgur.com/kiKRmYY.gif", null, "リスタート中、すぐに戻ります", (err, res) => {
                if (err) util.error(err, "admin")
                message.delete()
                setTimeout(() => process.exit(0), 1000)
            })*/

        // Join or Change Voice Channels
    } /*else if (args[0] === "voice") {
            args[1].join((err, conn) => {
                if (err) util.error(err, "admin")
                if (conn) {
                    channel.sendMessage("Connected to new Voice Channel")
                    console.log(chalk.magenta.bold("Connected to new Voice Channel"))
                }
            })
        }*/

    } else {
        channel.sendMessage("Insufficient Permissions")
    }
}
