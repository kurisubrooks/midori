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
    let msg = message.cleanContent
    let id = message.id

    //console.log(message)

    message.avatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.jpg`
    message.displayname = type === "dm" ? channel.recipient.username : message.member ? (message.member.nickname ? message.member.nickname : message.author.username) : message.author.username
    message.channelname = channel.name ? "#" + channel.name : ""
    message.attachments.forEach(v => attachments = true)
    message.image = attachments && msg.length < 1 ? true : false
    message.self = config.userid === user.id ? true : false

    if (type === "text" && user.bot) return
    if (msg.length < 1 && !attachments) return
    if (attachments) msg += message.image ? "<attachment>" : " <attachment>"

    console.log(
        chalk.yellow.bold(`[${server}${message.channelname}]<${message.displayname}>:`),
        chalk.yellow(`${msg}`)
    )

    if (server !== "DM" && new RegExp(blacklist.join("|")).test(message.content)) {
        message.delete()
            .then(() => user.sendMessage(`Your message was removed because it contains a word that has been blacklisted.`, { embed: { fields: [
                { name: "Offence", value: "Blacklisted Word" },
                { name: "Action",  value: "Message Removed" },
                { name: "Message", value: message.content }
            ]}}))
            .catch(e => console.error("Unable to delete blacklisted message", e))
        return
    }

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

                    require(location)(bot, channel, message.displayname, args, id, message, {
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
                            nickname: message.displayname,
                            avatar: message.avatar,
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

exports.bot = bot
