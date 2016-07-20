// nano²
"use strict"

const _ = require("lodash")
const keys = require("./keys")
const config = require("./config")
const Discord = require("discord.js")
const bot = new Discord.Client({
    autoReconnect: true
})

// Define API
module.exports = {
    bot: bot,

    post: function(data, callback) {
        if (data.author) data.message = `**[${data.author}]** ${data.message}`
        if (!data.options || typeof data.options !== "object") data.options = {}

        bot.sendMessage(data.channel, data.message, data.options, (error, response) => {
            if (error) console.error("core.post: " + error)
            if (callback) callback(error, response)
        })
    },

    reply: function(message, reply) {
        bot.reply(message, reply, {}, (error, response) => {
            if (error) console.error("core.reply: " + error)
        })
    },

    edit: function(message, update) {
        bot.updateMessage(message, update, {}, (error, response) => {
            if (error) console.error("core.edit: " + error)
        })
    },

    delete: function(message, callback) {
        if (message instanceof Array) {
            bot.deleteMessages(message, (error, response) => {
                if (error) console.error("core.delete_multiple: " + error)
                if (callback) callback(error, response)
            })
        } else {
            bot.deleteMessage(message, {}, (error, response) => {
                if (error) console.error("core.delete: " + error)
                if (callback) callback(error, response)
            })
        }
    },

    upload: function(data, callback) {
        if (!data.message) data.message = ""
        if (!data.name) data.name = ""

        bot.sendFile(data.channel, data.file, data.name, data.message, (error, response) => {
            if (error) console.error("core.upload: " + error)
            if (callback) callback(error, response)
        })
    },

    error: function(message, from, callback) {
        if (typeof message === "object") message = JSON.stringify(message)

        console.log(`[ERROR] ${from}.js - ${message}`)

        _.each(config.debug, (channel) => {
            this.post({
                channel: channel,
                message: `**[ERROR]** \`${from}.js\`\n\`\`\`${message}\`\`\``
            }, (error, response) => {
                if (error) console.error("core.error: " + error)
                if (callback) callback(error, response)
            })
        })
    }
}

// Initialise Discord
bot.loginWithToken(keys.discord)

// Helper Prototypes
String.prototype.toUpperLowerCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}
