import Command from "../core/Command";

module.exports = class AdminCommand extends Command {
    constructor(client) {
        super(client, {
            name: "admin",
            description: "Administrative Commands",
            aliases: ["op"],
            expectedArgs: ["command"]
        });
    }

    async run(message, channel, user, args) {
        const command = args[0];

        if (this.hasAdmin(user)) {
            // Stop or Restart Bot
            if (command === "stop" || command === "restart") {
                await this.error(`Restart Triggered by ${user.nickname}`);
                return process.exit(0);
            }

            // Trigger this.error
            if (command === "error") {
                return this.error("Error Triggered by Admin");
            }

            // Return Ping
            if (command === "ping") {
                return channel.send("Pong!");
            }
        }

        return channel.send("Insufficient Permissions");
    }
};
