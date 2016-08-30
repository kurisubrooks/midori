"use strict"

const chalk = require("chalk")

module.exports = (bot, channel, user, args, id, event, extra) => {
    const util = extra.util

    if (extra.masters.indexOf(extra.trigger.id) >= 0) {

        // Stop or Restart Bot
        if (args[0] === "stop") {
            bot.sendFile(channel, "https://i.imgur.com/kiKRmYY.gif", null, "リスタート中、すぐに戻ります", (err, res) => {
                if (err) util.error(err, "admin")
                bot.deleteMessage(event)
                setTimeout(() => process.exit(0), 1000)
            })

        // Join or Change Voice Channels
        } else if (args[0] === "voice") {
            bot.joinVoiceChannel(args[1], (err, conn) => {
                if (err) util.error(err, "admin")
                if (conn) {
                    bot.sendMessage(channel, "Connected to new Voice Channel")
                    console.log(chalk.magenta.bold("Connected to new Voice Channel"))
                }
            })
        }

    } else {
        bot.sendMessage(channel, "Insufficient Permissions")
    }
}
