"use strict"

const util = require("./util")
const config = require("./config")
const keychain = require("./keychain.json")

const _ = require("lodash")
const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const Discord = require("discord.js")
const bot = new Discord.Client({ autoReconnect: true })

// Handle Shitcode
/*process.on("uncaughtException", (err) => {
    console.error(chalk.red.bold("[FATAL]"), chalk.red(err))
})*/

// Spawn Subprocesses
bot.on("ready", (event) => {
    console.log(chalk.blue.bold("Discord: Ready"))

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
    let user = type === "dm" ? channel.recipient : message.member ? message.member.user : message.author
    let msg = message.cleanContent
    let id = message.id

    //console.log(message)

    message.attachments.forEach(v => attachments = true)
    message.image = attachments && msg.length < 1 ? true : false
    message.self = config.userid === user.id ? true : false

    if (type === "text" && user.bot) return
    if (msg.length < 1 && !attachments) return
    if (attachments) msg += message.image ? "<attachment>" : " <attachment>"

    let channame = channel.name ? "#" + channel.name : ""
    let username = type === "dm" ? channel.recipient.username : message.member ? (message.member.nickname ? message.member.nickname : message.author.username) : message.author.username
    let avatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.jpg`

    console.log(
        chalk.yellow.bold(`[${server}${channame}]<${username}>:`),
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

                    require(location)(bot, channel, username, args, id, message, {
                        hook: {
                            bot: {
                                username: "みどり",
                                icon: `https://cdn.discordapp.com/avatars/212915056491495424/3476fec9f1d7d85e4fefee18dfe8c659.jpg`
                            },
                            user: {
                                username: username,
                                icon: avatar
                            }
                        },
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
                            nickname: username,
                            avatar: avatar,
                            bot: user.bot
                        }
                    })
                })
            } catch (error) {
                util.error(error, "index")
            }
        }
    }
})

// Start Process
console.log(chalk.blue.bold("Process: Started"))
bot.login(keychain.discord)
exports.bot = bot
