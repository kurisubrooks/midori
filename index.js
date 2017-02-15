// Nano Core v4
// by @kurisubrooks

// Requires
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

// Discord
const { Client, Collection } = require("discord.js");
const bot = new Client({ autoReconnect: true });
const commands = new Collection();
const aliases = new Collection();

// Imports
const util = require("./util");
const config = require("./config");
const keychain = require("./keychain.json");
const blacklist = require("./blacklist.json");

// Log Process Start
console.log(chalk.blue.bold("Process: Started"));

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

// Connect to Discord
bot.login(keychain.discord);
bot.on("ready", () => util.handleReady(bot, util));
bot.on("warn", warning => util.error(warning, "index"));
bot.on("error", error => util.error(error, "index"));
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

    // Log Chat to Console
    console.log(
        chalk.yellow.bold(`[${server}${channel.name ? `#${channel.name}` : ""}]<${user.nickname}>:`),
        chalk.yellow(`${text}`)
    );

    // Check Message against Blacklist
    if (server !== "DM" && new RegExp(blacklist.join("|")).test(message.content)) {
        let embed = {
            fields: [
                { name: "Offence", value: "Blacklisted Word" },
                { name: "Action", value: "Message Removed" },
                { name: "Message", value: text }
            ]
        };

        return message.delete()
            .then(() => user.sendMessage(`Your message was removed because it contains a word that has been blacklisted.`, { embed }))
            .catch(err => console.error("Unable to delete blacklisted message", err));
    }

    // Command Handler
    if (text.startsWith(config.sign)) {
        const args = text.split(" ");
        const commandName = args.splice(0, 1)[0].toLowerCase().slice(config.sign.length);
        const command = commands.get(commandName) || commands.get(aliases.get(commandName));

        if (!command) return false;

        try {
            return command(bot, channel, user, args, id, message, {
                util: util,
                config: config,
                keychain: keychain,
                command: command,
                server: message.guild,
                masters: config.admin,
                user: user.nickname,
                colours: config.colours,
                trigger: {
                    id: user.id,
                    type: type,
                    username: user.username,
                    nickname: user.nickname,
                    avatar: user.avatarURL,
                    bot: user.bot
                }
            });
        } catch(error) {
            return util.error(error, "index");
        }
    }

    return false;
});

exports.bot = bot;
