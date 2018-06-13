const Command = require("../../core/Command");

class Reload extends Command {
    constructor(client) {
        super(client, {
            name: "Reload",
            description: "Reloads Commands",
            aliases: ["reset", "flush"],
            admin: true
        });
    }

    async run(message, channel, user, args) {
        const module = args[0];

        if (!module) {
            const msg = await channel.send("Reloading all modules...");
            await message.context.reloadCommands();
            await msg.edit("Reloading all modules... done!");
            return false;
        }

        const run = await message.context.reloadCommand(module);

        if (run) {
            return channel.send(`Reloaded '${module}'`);
        }

        return channel.send(`Module ${module} doesn't exist!`);
    }
}

module.exports = Reload;
