const Command = require("../../core/Command");

class Reload extends Command {
    constructor(client) {
        super(client, {
            name: "Reload",
            description: "Reloads Commands",
            aliases: [],
            admin: true
        });
    }

    async run(message, channel, user, args) {
        const module = args[0];
        const run = message.context.reloadCommand(module);

        if (run) {
            return channel.sendMessage(`Reloaded '${module}'`);
        }

        return channel.sendMessage(`Module ${module} doesn't exist!`);
    }
}

module.exports = Reload;
