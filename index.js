"use strict"

const _ = require("lodash")
const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const Discord = require("discord.js")
const bot = new Discord.Client({ autoReconnect: true })

const util = require("./util.js")
const config = require("./config.json")
const keychain = require("./keychain.json")

// Spawn Subprocesses
bot.on("ready", (event) => {
    console.log(chalk.blue.bold("Discord: Ready"))

    // Connect to Voice Channels
    _.each(config.audioChannels, (channel, idk) => {
        console.log(channel, idk)
        bot.joinVoiceChannel(channel, (error, conn) => {
            if (error) util.error(error, "index")
        })
    })

    // Spawn Subprocesses
    _.each(config.subprocesses, (v, command) => {
        try {
            require(path.join(__dirname, "modules", command, "main.js"))(bot, util, config, keychain, __dirname)
        } catch(error) {
            util.error(`Failed to start subprocess "${command}"\n${error}`, "index")
            throw error
        }
    })
})

// Warnings and Errors
bot.on("warn", (warning) => util.error(warning, "index"))
bot.on("error", (error) => util.error(error, "index"))

// Message Event
bot.on("message", (message) => {
    let server = message.server ? message.server.name : "DM"
    let channel = message.channel
    let attachments = message.attachments[0] || undefined
    let user = message.author
    let text = message.cleanContent
    let id = message.id

    message.image = attachments && text.length < 1 ? true : false
    message.self = config.userid == user.id ? true : false

    if (user.bot) return
    if (text.length < 1 && !attachments) return
    if (attachments) text += message.image ? "<image>" : " <image>"

    console.log(chalk.yellow.bold(`[${server}${(channel.name) ? "#" + channel.name : ""}]<${user.name}>:`), chalk.yellow(`${text}`))

    if (message.content.startsWith(config.sign)) {
        let args = text.split(" ")
        let command = args.splice(0, 1)[0].toLowerCase().slice(config.sign.length)
        let exists = command in config.commands

        if (exists) {
            try {
                let location = path.join(__dirname, "modules", command, "main.js")

                fs.access(location, fs.F_OK, (error) => {
                    if (error) {
                        util.error(error, "index")
                        return
                    }

                    require(location)(bot, channel, user, args, id, message, {
                        util: util,
                        config: config,
                        keychain: keychain,
                        command: command,
                        masters: config.admin,
                        user: user.username,
                        trigger: {
                            id: user.id,
                            username: user.username,
                            status: user.status,
                            bot: user.bot
                        }
                    })
                })
            } catch (error) {
                util.error(error, "index")
            }
        }
    } else if (config.audio.indexOf(message.content) >= 0) {
        config.audio.forEach((v) => {
            if (v === message.content) {
                bot.voiceConnections.forEach((connection) => {
                    connection.playFile(`./sounds/${v}.mp3`, (error) => {
                        if (error) util.error(error, "index")
                    })
                })

                return
            }
        })
    }
})

// Start Process
console.log(chalk.blue.bold("Process: Started"))
bot.loginWithToken(keychain.discord)
exports.bot = bot
