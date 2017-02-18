import fs from "fs";
import path from "path";
import config from "../config";
import blacklist from "../blacklist.json";
import { error, log, toUpper } from "./Util";
import { Collection, RichEmbed } from "discord.js";

export default class CommandManager {
    constructor(client) {
        this.client = client;
        this.commands = new Collection();
        this.aliases = new Collection();
    }

    loadCommands(dir) {
        const commands = fs.readdirSync(path.join(__dirname, "../", dir));

        for (const item of commands) {
            const location = path.join(__dirname, "../", dir, item, "main.js");

            // Location doesn't exist, skip loop
            if (!fs.existsSync(location)) continue;

            // Add Command to Commands Collection
            const Command = require(location).default;
            const instance = new Command(this.client);

            if (instance.disabled) continue;
            log("Loaded Command", toUpper(instance.name), "info");

            this.commands.set(item, instance);

            // Set Command Aliases
            if (instance.hasOwnProperty("aliases")) {
                for (const alias of instance.aliases) this.aliases.set(alias, instance);
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

    handleMessage(message) {
        const type = message.channel.type;
        const channel = message.channel;
        const server = message.guild ? message.guild.name : "DM";
        const user = message.author;
        const attachments = message.attachments.size > 0;
        let text = message.cleanContent;

        user.nickname = message.member ? message.member.displayName : message.author.username;

        if (type === "text" && user.bot) return false;
        if (text.length < 1 && !attachments) return false;
        if (attachments) text += attachments && text.length < 1 ? "<file>" : " <file>";
        if (server !== "DM" && new RegExp(blacklist.join("|")).test(message.content)) {
            return this.handleBlacklist(message);
        }

        if (text.startsWith(config.sign)) {
            const args = text.split(" ");
            const commandName = args.splice(0, 1)[0].toLowerCase().slice(config.sign.length);
            const command = this.commands.get(commandName) || this.aliases.get(commandName);

            log("Log", `<${user.username}#${user.discriminator}>: ${text}`, "warn");

            if (command) return this.runCommand(command, message, channel, user, args);
        }

        return false;
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
}
