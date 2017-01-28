"use strict";

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const Discord = require("discord.js");

const bot = new Discord.Client({ autoReconnect: true });
const util = require("./util");
const config = require("./config");
const keychain = require("./keychain.json");
const blacklist = require("./blacklist.json");

let commands = new Discord.Collection();
let aliases = new Discord.Collection();
let firstRun = true;

// Log Process Start
console.log(chalk.blue.bold("Process: Started"));

// Setup Commands
for (let item of config.commands) {
    let location = path.join(__dirname, "modules", item.command, "main.js");

    // Location doesn't exist, skip loop
    if (!fs.existsSync(location)) continue;

    // Add Command to Commands Collection
    commands.set(item.command, require(location));

    // Set Command Aliases
    if (item.hasOwnProperty("alias")) {
        for (let alias of item.alias) aliases.set(alias, item.command);
    }
}

// Connect to Discord
bot.login(keychain.discord);

// Spawn Subprocesses
bot.on("ready", () => {
    console.log(chalk.blue.bold("Discord: Ready"));

    // Spawn Subprocesses
    if (firstRun) {
        for (let command in config.subprocesses) {
            try {
                console.log(chalk.blue.bold("Spawning Subprocess:"), chalk.green.bold(command));
                require(path.join(__dirname, "modules", command, "main.js"))(bot, util, config, keychain, __dirname);
            } catch(error) {
                util.error(`Failed to start subprocess "${command}"\n${error}`, "index");
                throw error;
            }
        }

        // Prevent Double Trigger
        firstRun = false;
    }
});

// Warnings and Errors
bot.on("warn", warning => util.error(warning, "index"));
bot.on("error", error => util.error(error, "index"));

// Message Event
bot.on("message", message => {
    let type = message.channel.type;
    let server = message.guild ? message.guild.name : "DM";
    let channel = message.channel;
    let attachments = false;
    let user = message.author;
    let text = message.cleanContent;
    let id = message.id;

    // Checks for attached file/image
    message.attachments.forEach(() => { attachments = true; });
    message.image = attachments && text.length < 1 ? 1 : 0;

    // Set User's Nickname
    user.nickname = message.member ? message.member.displayName : message.author.username;

    // Basic Formatting Checks
    if (type === "text" && user.bot) return;
    if (text.length < 1 && !attachments) return;
    if (attachments) text += message.image ? "<file>" : " <file>";

    // Log Chat to Console
    console.log(
        chalk.yellow.bold(`[${server}${channel.name ? `#${channel.name}` : ""}]<${user.nickname}>:`),
        chalk.yellow(`${text}`)
    );

    // Check Message against Blacklist
    if (server !== "DM" && new RegExp(blacklist.join("|")).test(message.content)) {
        message.delete()
            .then(() => {
                user.sendMessage(`Your message was removed because it contains a word that has been blacklisted.`, {
                    embed: {
                        fields: [
                            { name: "Offence", value: "Blacklisted Word" },
                            { name: "Action", value: "Message Removed" },
                            { name: "Message", value: text }
                        ]
                    }
                });
            })
            .catch(err => console.error("Unable to delete blacklisted message", err));
        return;
    }

    // Command Handler
    if (text.startsWith(config.sign)) {
        let args = text.split(" ");
        let commandName = args.splice(0, 1)[0].toLowerCase().slice(config.sign.length);
        let command = commands.get(commandName) || commands.get(aliases.get(commandName));

        if (!command) return;

        try {
            command(bot, channel, user, args, id, message, {
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
                    username: user.username,
                    nickname: user.nickname,
                    avatar: user.avatarURL,
                    bot: user.bot
                }
            });
        } catch(error) {
            util.error(error, "index");
        }
    }
});

exports.bot = bot;
