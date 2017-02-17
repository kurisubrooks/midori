import util from "../util";
import config from "../config";
import blacklist from "../blacklist.json";

import fs from "fs";
import path from "path";
import chalk from "chalk";
import moment from "moment";
import { Collection, RichEmbed } from "discord.js";

const time = () => moment().format("HH:mm:ss");

process.on("unhandledRejection", reason =>
    console.log(chalk.red.bold(`[${time()} Unhandled Rejection]`), chalk.red(reason)));

process.on("unhandledError", reason =>
    console.log(chalk.red.bold(`[${time()} Unhandled Error]`), chalk.red(reason)));

module.exports = class CommandManager {
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
            const Command = require(location);
            this.commands.set(item, new Command(this.client).default);

            // Set Command Aliases
            if (item.hasOwnProperty("alias")) {
                for (const alias of item.alias) this.aliases.set(alias, item.command);
            }
        }
    }

    runCommand(command, message, channel, user, args) {
        try {
            this.log("Command Parser", `Matched ${command.name}, Running...`, "warn");
            return command.run(message, channel, user, args);
        } catch(error) {
            return util.error(error, "command");
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
            const command = this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName));

            console.log(chalk.yellow.bold(`[${server}${channel.name ? `#${channel.name}` : ""}]<${user.username}#${user.discriminator}>:`), chalk.yellow(`${text}`));

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
            this.log(`Deleting ${message.id} from ${guild}`);
            await message.delete();
            return message.author.sendEmbed(embed);
        } catch(error) {
            return this.error(`Unable to delete message ${message.id} from ${guild}`, "blacklist");
        }
    }

    log(prefix, message, style) {
        let styles = {
            default: chalk.white,
            success: chalk.green,
            warn: chalk.yellow,
            error: chalk.red
        };

        return console.log(
            styles[style].bold(`[${time()} ${prefix}]`),
            styles[style || "default"](`${message}`)
        );
    }

    error(message, referrer) {
        const channel = this.client.channels.get("212917108445544449");
        const embed = new RichEmbed()
            .setColor(config.colours.error)
            .addField("Module:", referrer, true)
            .addField("Time:", time(), true)
            .addField("Message:", message);

        this.log(message, "error");
        return channel.sendEmbed(embed);
    }
};
