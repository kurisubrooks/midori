"use strict";

const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const Discord = require("discord.js");

const bot = new Discord.Client({ autoReconnect: true });
const util = require("./util");
const config = require("./config");
const keychain = require("./keychain.json");
const blacklist = require("./blacklist.json");

let firstRun = true;
console.log(chalk.blue.bold("Process: Started"));

// Connect to Discord
bot.login(keychain.discord);

// Spawn Subprocesses
bot.on("ready", () => {
    console.log(chalk.blue.bold("Discord: Ready"));

    // Spawn Subprocesses
    if (firstRun) {
        _.each(config.subprocesses, (val, command) => {
            try {
                console.log(chalk.blue.bold("Spawning Subprocess:"), chalk.green.bold(command));
                require(path.join(__dirname, "modules", command, "main.js"))(bot, util, config, keychain, __dirname);
            } catch(error) {
                util.error(`Failed to start subprocess "${command}"\n${error}`, "index");
                throw error;
            }
        });

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
    let user = type === "dm" ? channel.recipient : message.member ? message.member.user : message.author;
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
        let command = args.splice(0, 1)[0].toLowerCase().slice(config.sign.length);
        let alias = _.map(_.filter(config.commands, { alias: [command] }), "command");
        let matched = _.filter(config.commands, { command: alias.length > 0 ? alias[0] : command });
        let found = matched.length > 0;

        // Command Found
        if (found) {
            let location = path.join(__dirname, "modules", matched[0].command, "main.js");

            try {
                // Check if Module Exists before executing
                fs.access(location, fs.F_OK, (error) => {
                    if (error) {
                        return util.error(error, "index");
                    }

                    // Execute Module
                    return require(location)(bot, channel, user, args, id, message, {
                        util: util,
                        config: config,
                        keychain: keychain,
                        command: alias.length > 0 ? alias[0] : command,
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
                });
            } catch(error) {
                util.error(error, "index");
            }
        }
    }
});

exports.bot = bot;
