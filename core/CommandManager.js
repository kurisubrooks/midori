import util from "../util";
import config from "../config";
import keychain from "../keychain.json";
import blacklist from "../blacklist.json";

import fs from "fs";
import path from "path";
import chalk from "chalk";
import { Collection } from "discord.js";

module.exports = class CommandManager {
    constructor(client) {
        this.client = client;
        this.commands = new Collection();
        this.alises = new Collection();
    }

    loadCommands(dir) {
        const commands = fs.readdirSync(path.join(__dirname, path.normalize(dir)));

        for (const item of commands) {
            const location = path.join(__dirname, "modules", item.command, "main.js");

            // Location doesn't exist, skip loop
            if (!fs.existsSync(location)) continue;

            // Add Command to Commands Collection
            const Command = require(location);
            this.commands.set(item.command, new Command(this.client));

            // Set Command Aliases
            if (item.hasOwnProperty("alias")) {
                for (const alias of item.alias) this.aliases.set(alias, item.command);
            }
        }
    }

    runCommand(command, message, channel, user, args) {
        try {
            return command.run(this.client, channel, user, args, message.id, message, {
                util, config, keychain, command,
                server: message.guild,
                masters: config.admin,
                user: user.nickname,
                colours: config.colours,
                trigger: {
                    id: user.id,
                    username: user.username,
                    nickname: user.nickname,
                    avatar: user.avatarURL,
                    bot: user.bot
                }
            });
        } catch(error) {
            return util.error(error, "command");
        }
    }

    handleMessage(message) {
        const type = message.channel.type;
        const channel = message.channel;
        const server = message.guild ? message.guild.name : "DM";
        const user = message.author;
        const attachments = message.attachments.length > 0;
        const text = message.cleanContent += attachments && text.length < 1 ? "<file>" : " <file>";

        user.nickname = message.member ? message.member.displayName : message.author.username;

        if (type === "text" && user.bot) return false;
        if (text.length < 1 && !attachments) return false;
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
        let embed = {
            fields: [
                { name: "Offence", value: "Blacklisted Word" },
                { name: "Action", value: "Message Removed" },
                { name: "Message", value: message.content }
            ]
        };

        try {
            console.log(`Deleting ${message.id} from ${message.guild ? message.guild.name : "DM"}`);
            await message.delete();
            return message.author.sendMessage(`Your message was removed because it contains a word that has been blacklisted.`, { embed });
        } catch(error) {
            return util.error(`Unable to delete message ${message.id} from ${message.guild ? message.guild.name : "DM"}`, "blacklist");
        }
    }
};
