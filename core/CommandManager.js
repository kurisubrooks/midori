const fs = require("fs");
const path = require("path");
const config = require("../config");
const blacklist = require("../blacklist.json");
const { error, log, toUpper } = require("./Util");
const { Collection, RichEmbed, Client } = require("discord.js");

module.exports = class CommandManager {
    constructor(client) {
        this.client = client;
        this.commands = new Collection();
        this.aliases = new Collection();

        if (!this.client || !(this.client instanceof Client)) throw new Error("Discord Client is required");
    }

    loadCommands(dir) {
        const commands = fs.readdirSync(path.join(__dirname, "../", dir));

        for (const item of commands) {
            const location = path.join(__dirname, "../", dir, item, "main.js");

            // Location doesn't exist, skip loop
            if (!fs.existsSync(location)) continue;

            // Add Command to Commands Collection
            const Command = require(location);
            const instance = new Command(this.client);

            if (instance.disabled) continue;
            log("Loaded Command", toUpper(instance.name), "info");

            // Set command name
            if (this.commands.has(instance.name)) {
                throw new Error("Commands cannot have the same name");
            } else {
                this.commands.set(instance.name, instance);
            }

            // Set command aliases
            for (const alias of instance.aliases) {
                if (this.aliases.has(alias)) {
                    throw new Error("Commands cannot share aliases");
                } else {
                    this.aliases.set(alias, instance);
                }
            }
        }
    }

    runCommand(command, message, channel, user, args) {
        try {
            log("Command Parser", `Matched ${command.name}, Running...`, "warn");
            return command.run(message, channel, user, args);
        } catch(err) {
            return error("Command", err);
        }
    }

    async handleMessage(message) {
        let text = message.cleanContent;
        let args = message.content.split(" ");
        const type = message.channel.type;
        const channel = message.channel;
        const server = message.guild ? message.guild.name : "DM";
        const user = message.author;
        const attachments = message.attachments.size > 0;
        const pattern = new RegExp(`<@!?${this.client.user.id}>`, "i");
        const mentioned = message.isMentioned(this.client.user) && pattern.test(args[0]);
        const triggered = message.content.startsWith(config.sign);
        const matched = new RegExp(blacklist.join("|")).test(message.content);

        user.nickname = message.member ? message.member.displayName : message.author.username;

        if (type === "text" && user.bot) return false;
        if (text.length < 1 && !attachments) return false;
        if (attachments) text += attachments && text.length < 1 ? "<file>" : " <file>";
        if (server !== "DM" && matched) return this.handleBlacklist(message);
        if (!triggered && !mentioned) return false;
        if (mentioned && args.length === 1) {
            await message.reply("How may I help? Respond with the command you want to use. Expires in 30s");
            const filter = msg => msg.author.id === user.id;
            const res = await channel.awaitMessages(filter, { max: 1, time: 30000 });
            message = res.first();
            text += ` ${message.content}`;
            args = [args[0], ...message.content.split(" ")];
        }

        log("Chat Log", `<${user.username}#${user.discriminator}>: ${text}`, "warn");

        const commandName = mentioned && args.length > 0 ? args.splice(0, 2)[1].toLowerCase() : args.splice(0, 1)[0].slice(config.sign.length).toLowerCase();
        const command = this.commands.get(commandName) || this.aliases.get(commandName);

        if (!command && mentioned && args.length > 0) {
            return message.reply("Sorry, I don't recognise that command... Try `help` to see what I know!");
        }

        if (!command) return false;
        message.command = commandName;
        return this.runCommand(command, message, channel, user, args);
    }

    async handleBlacklist(message) {
        const guild = message.guild ? message.guild.name : "DM";
        const embed = new RichEmbed()
            .setDescription("Your message was removed because it contains a word that has been blacklisted.")
            .addField("Offence", "Blacklisted Word")
            .addField("Action", "Message Removed")
            .addField("Message", message.content);

        try {
            log("Blacklist", `Deleting ${message.id} from ${guild}`, "info");
            await message.delete();
            return message.author.sendEmbed(embed);
        } catch(err) {
            return error("Blacklist", `Unable to delete message ${message.id} from ${guild}`);
        }
    }
};
