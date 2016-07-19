// nano²
"use strict"

exports.main = (core, channel, user, args, id, event, extra) => {
    if (extra.masters.indexOf(extra.trigger.id) >= 0) {
        core.upload({
            channel: channel,
            message: `リスタート中、すぐに戻ります`,
            file: `http://i.imgur.com/kiKRmYY.gif`
        }, (error, response) => {
            core.delete(event)
            setTimeout(() => process.exit(0), 1000)
        })
    } else {
        core.post({
            channel: channel,
            message: `Insufficient Permissions`,
            author: extra.user
        });
    }
}
