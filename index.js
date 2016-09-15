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

// Handle Shitcode
process.on("uncaughtException", (err) => {
    console.error(chalk.red.bold("[FATAL]"), chalk.red(err))
})

// Spawn Subprocesses
bot.on("ready", (event) => {
    console.log(chalk.blue.bold("Discord: Ready"))

    // Connect to Voice Channels
    /*_.each(config.audioChannels, (channel, index) => {
        console.log(config.audioChannels)
        config.audioChannels[index].join((error, conn) => {
            if (error) util.error(error, "index")
        })
    })*/

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
    let type = message.channel.type
    let server = message.guild ? message.guild.name : "DM"
    let channel = message.channel
    let attachments = false
    let user = type === "dm" ? channel.recipient : message.member
    let msg = message.cleanContent
    let id = message.id

    let display = {
        channel: channel.name ? `#${channel.name}` : "",
        user: type === "text" ? (user.nickname ? user.nickname : user.user.username) : user.username
    }

    message.attachments.forEach(v => attachments = true)
    message.image = attachments && msg.length < 1 ? true : false
    message.self = config.userid === user.id ? true : false

    if (type === "text" && user.user.bot) return
    if (msg.length < 1 && !attachments) return
    if (attachments) msg += message.image ? "<attachment>" : " <attachment>"

    console.log(
        chalk.yellow.bold(`[${server}${display.channel}]<${display.user}>:`),
        chalk.yellow(`${msg}`)
    )

    if (message.content.startsWith(config.sign)) {
        let args = msg.split(" ")
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

                    require(location)(bot, channel, display.user, args, id, message, {
                        util: util,
                        config: config,
                        keychain: keychain,
                        command: command,
                        masters: config.admin,
                        user: user.nickname,
                        trigger: {
                            id: user.id,
                            username: user.username,
                            nickname: user.nickname,
                            bot: user.bot
                        }
                    })
                })
            } catch (error) {
                util.error(error, "index")
            }
        }
    }

    /* else if (config.audio.indexOf(message.content) >= 0) {
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
    }*/
})

// Start Process
console.log(chalk.blue.bold("Process: Started"))
bot.login(keychain.discord)
exports.bot = bot
