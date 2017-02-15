module.exports = (bot, channel, user, args, id, message, extra) => {
    const { util } = extra;
    const command = args[0];

    if (extra.masters.includes(extra.trigger.id)) {
        // Stop or Restart Bot
        if (command === "stop" || command === "restart") {
            util.error(`Restart Triggered by ${extra.trigger.username}`, "admin", channel);
            return setTimeout(() => process.exit(0), 650);
        }

        // Trigger util.error
        if (command === "error") {
            return util.error("Error Triggered by Admin", "admin", channel);
        }

        // Return Ping
        if (command === "ping") {
            return channel.send("Pong!");
        }
    }

    return channel.send("Insufficient Permissions");
};
