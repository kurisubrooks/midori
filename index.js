"use strict"

const _ = require("lodash")
const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const Discord = require("discord.js")

const bot = new Discord.Client({ autoReconnect: true })
const util = require("./util")
const config = require("./config")
const keychain = require("./keychain.json")
const blacklist = require("./blacklist.json")

let first_run = true
console.log(chalk.blue.bold("Process: Started"))

// Connect to Discord
bot.login(keychain.discord)

// Spawn Subprocesses
bot.on("ready", () => {
    console.log(chalk.blue.bold("Discord: Ready"))

    // Spawn Subprocesses
    if (first_run) {
        _.each(config.subprocesses, (v, command) => {
            try {
                console.log(chalk.blue.bold("Spawning Subprocess:"), chalk.green.bold(command))
                require(path.join(__dirname, "modules", command, "main.js"))(bot, util, config, keychain, __dirname)
            } catch(error) {
                util.error(`Failed to start subprocess "${command}"\n${error}`, "index")
                throw error
            }
        })

        // Prevent Double Trigger
        first_run = false
    }
})

// Warnings and Errors
bot.on("warn", warning => util.error(warning, "index"))
bot.on("error", error => util.error(error, "index"))

// Message Event
bot.on("message", message => {
    let type = message.channel.type
    let server = message.guild ? message.guild.name : "DM"
    let channel = message.channel
    let attachments = false
    let user = type === "dm" ? channel.recipient : message.member ? message.member.user : message.author
    let text = message.cleanContent
    let id = message.id

    // Checks for attached file/image
    message.attachments.forEach(v => attachments = true)
    message.image = attachments && text.length < 1 ? true : false

    // Basic Formatting Checks
    if (type === "text" && user.bot) return
    if (text.length < 1 && !attachments) return
    if (attachments) text += message.image ? "<attachment>" : " <attachment>"

    // Set user.nickname
    if (type === "dm") {
        user.nickname = channel.recipient.username
    } else {
        if (message.member) {
            if (message.member.nickname) {
                user.nickname = message.member.nickname
            } else {
                user.nickname = message.author.username
            }
        } else {
            user.nickname = message.author.username
        }
    }

    // Log Chat to Console
    console.log(
        chalk.yellow.bold(`[${server}${channel.name ? "#" + channel.name : ""}]<${user.nickname}>:`),
        chalk.yellow(`${text}`)
    )

    // Check Message against Blacklist
    if (server !== "DM" && new RegExp(blacklist.join("|")).test(message.content)) {
        message.delete()
            .then(() => {
                user.sendMessage(`Your message was removed because it contains a word that has been blacklisted.`,
                { embed: { fields: [
                    { name: "Offence", value: "Blacklisted Word" },
                    { name: "Action",  value: "Message Removed" },
                    { name: "Message", value: text }
                ]}})
            })
            .catch(e => console.error("Unable to delete blacklisted message", e))
        return
    }

    // Command Handler
    if (text.startsWith(config.sign)) {
        let args = text.split(" ")
        let command = args.splice(0, 1)[0].toLowerCase().slice(config.sign.length)
        let alias = _.map(_.filter(config.commands, { alias: [ command ] }), "command")
        if (alias.length > 0) command = alias[0]
        let matched = _.filter(config.commands, { command: command })

        if (matched.length > 0) {
            try {
                let location = path.join(__dirname, "modules", matched[0].command, "main.js")

                // Check if File Exists before executing
                fs.access(location, fs.F_OK, (error) => {
                    if (error) {
                        util.error(error, "index")
                        return
                    }

                    // Execute Module
                    require(location)(bot, channel, user, args, id, message, {
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
                    })
                })
            } catch(error) {
                util.error(error, "index")
            }
        }
    }
})

exports.bot = bot
