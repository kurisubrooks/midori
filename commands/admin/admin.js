const Command = require("../../core/Command");

module.exports = class AdminCommand extends Command {
    constructor(client) {
        super(client, {
            name: "admin",
            description: "Administrative Commands",
            aliases: ["op"],
            admin: true
        });
    }

    async run(message, channel, user, args) {
        const command = args[0];

        // Stop or Restart Bot
        if (command === "stop" || command === "restart") {
            await this.error(`Restart Triggered by ${user.nickname}`, channel);
            return process.exit(0);
        }

        // Trigger this.error
        if (command === "error") {
            return this.error("Error Triggered by Admin", channel);
        }

        // Return Ping
        if (command === "ping") {
            return channel.send("Pong!");
        }

        // Reload Module
        if (command === "reload") {
            const module = args[1];
            const run = message.context.reloadCommand(module);
            if (run) {
                return channel.sendMessage(`Restarted ${module}`);
            }

            return channel.sendMessage(`Module ${module} doesn't exist!`);
        }

        return false;
    }
};
