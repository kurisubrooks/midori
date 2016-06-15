// nano²
"use strict"

exports.main = (core, channel, user, args, id, event, config) => {
    core.post(channel, "H-Hello?", { author: config.trigger.username })
}
