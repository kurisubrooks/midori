// Nano Core v4.3
// by @kurisubrooks

// Requires
import fs from "fs";
import path from "path";
import chalk from "chalk";

// Discord
import { Client, Collection } from "discord.js";
const commands = new Collection();
const aliases = new Collection();
const bot = new Client();

// Imports
import util from "./util";
import config from "./config";
import keychain from "./keychain.json";
import blacklist from "./blacklist.json";

// Setup Commands
for (const item of config.commands) {
    const location = path.join(__dirname, "modules", item.command, "main.js");

    // Location doesn't exist, skip loop
    if (!fs.existsSync(location)) continue;

    // Add Command to Commands Collection
    commands.set(item.command, require(location));

    // Set Command Aliases
    if (item.hasOwnProperty("alias")) {
        for (const alias of item.alias) aliases.set(alias, item.command);
    }
}

// Handle Discord
bot.login(keychain.discord);
bot.once("ready", () => util.handleReady(bot, util));
bot.on("warn", warning => util.error(warning, "core"));
bot.on("error", error => util.error(error, "core"));
bot.on("guildMemberAdd", member => util.handleJoin(member));
bot.on("message", message => {
    const type = message.channel.type;
    const server = message.guild ? message.guild.name : "DM";
    const channel = message.channel;
    const user = message.author;
    const id = message.id;
    let text = message.cleanContent;
    let attachments = false;

    // Checks for attached file/image
    message.attachments.forEach(() => { attachments = true; });
    message.image = attachments && text.length < 1 ? 1 : 0;
    user.nickname = message.member ? message.member.displayName : message.author.username;

    // Basic Formatting Checks
    if (type === "text" && user.bot) return false;
    if (text.length < 1 && !attachments) return false;
    if (attachments) text += message.image ? "<file>" : " <file>";

    // Check Message against Blacklist
    if (server !== "DM" && new RegExp(blacklist.join("|")).test(message.content)) {
        return util.handleBlacklist(message);
    }

    // Command Handler
    if (text.startsWith(config.sign)) {
        const args = text.split(" ");
        const commandName = args.splice(0, 1)[0].toLowerCase().slice(config.sign.length);
        const command = commands.get(commandName) || commands.get(aliases.get(commandName));

        // Log User Command
        console.log(chalk.yellow.bold(`[${server}${channel.name ? `#${channel.name}` : ""}]<${user.nickname}#${user.discriminator}>:`), chalk.yellow(`${text}`));

        if (!command) return false;

        try {
            return command(bot, channel, user, args, id, message, {
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

    return false;
});

exports.bot = bot;
