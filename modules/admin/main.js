"use strict"

const chalk = require("chalk")

module.exports = (bot, channel, user, args, id, message, extra) => {
    const util = extra.util

    if (extra.masters.indexOf(extra.trigger.id) >= 0) {

        // Stop or Restart Bot
        if (args[0] === "stop") {
            channel.sendMessage("Restarting").then(setTimeout(() => process.exit(0), 500))
        // Trigger util.error
        } else if (args[0] === "error") {
            util.error("Error Triggered by Admin", "admin", channel)
        }

    } else {
        channel.sendMessage("Insufficient Permissions")
    }
}
