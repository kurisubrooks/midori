// nano²
"use strict";

const _ = require("lodash")
const fs = require("fs")
const path = require("path")
const core = require("./core")
const keys = require("./keys")
const config = require("./config")

console.log("Nano: Started")

// Spawn Subprocesses
core.bot.on("ready", (event) => {
    console.log("Discord: Ready")

    _.each(config.subprocesses, (command) => {
       try {
            var subprocess = require(path.join(__dirname, "subprocesses", command + ".js"));
            subprocess.main(core, config, __dirname)
       } catch(error) {
            core.error(`Failed to start subprocess \`${command}.js\`\n${error}`, "index")
            throw error
       }
   });
})

// Warnings and Errors
core.bot.on("warn", (warning) => core.error(warning, "index"))
core.bot.on("error", (error) => core.error(error, "index"))

// New Message
core.bot.on("message", (message) => {
    var server = (message.server) ? message.server.name : "DM"
    var channel = message.channel
    var attachments = message.attachments[0] || undefined
    var user = message.author
    var text = message.content
    var id = message.id

    message.image = (attachments && text.length < 1) ? true : false
    message.self = (config.user == user.id) ? true : false

    if (user.bot) return
    if (text.length < 1 && !attachments) return
    if (attachments) text += (message.image) ? "<image>" : " <image>"

    console.log(`[${server}${(channel.name) ? "#" + channel.name : ""}]<${user.name}>: ${text}`)

    if (message.content.startsWith(config.sign)) {
        var args = text.split(" ")
        var command = args.splice(0, 1)[0].toLowerCase().slice(config.sign.length)
        var exists = command in config.commands

        if (exists) {
            try {
                var location = path.join(__dirname, "commands", command + ".js")

                fs.access(location, fs.F_OK, (error) => {
                    if (error) {
                        core.error(error, "index")
                        return
                    }

                    var module = require(location);
                    module.main(core, channel, user, args, id, message, {
                        config: config,
                        command: command,
                        masters: config.masters,
                        trigger: {
                            id: user.id,
                            username: user.username,
                            status: user.status,
                            bot: user.bot
                        }
                    })
                })
            } catch (error) {
                if (error) core.error(error, "index")
            }
        }
    }
})
