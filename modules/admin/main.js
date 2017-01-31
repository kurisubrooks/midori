module.exports = (bot, channel, user, args, id, message, extra) => {
    const { util } = extra;

    if (extra.masters.indexOf(extra.trigger.id) >= 0) {
        // Stop or Restart Bot
        if (args[0] === "stop" || args[0] === "restart") {
            util.error(`Restart Triggered by ${extra.trigger.username}`, "admin", channel);
            setTimeout(() => process.exit(0), 650);
        }

        // Trigger util.error
        if (args[0] === "error") {
            util.error("Error Triggered by Admin", "admin", channel);
        }

        // Return Ping
        if (args[0] === "ping") {
            channel.send("Pong!");
        }
    } else {
        channel.send("Insufficient Permissions");
    }
};
