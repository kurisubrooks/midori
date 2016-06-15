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
    post: function(channel, message, options) {
        if (options && options.author) message = `**[${options.author}]** ${message}`
        bot.sendMessage(channel, message, {}, (error, response) => {
            if (error) this.error(response, "core")
        })
    },
    reply: function(message, reply) {
        bot.reply(message, reply, {}, (error, response) => {
            if (error) this.error(response, "core")
        })
    },
    edit: function(message, update) {
        bot.updateMessage(message, update, {}, (error, response) => {
            if (error) this.error(response, "core")
        })
    },
    delete: function(message) {
        bot.deleteMessage(message, {}, (error, response) => {
            if (error) this.error(response, "core")
        })
    },
    upload: function(channel, file, text) {
        bot.sendFile(channel, file, "", text, (error, response) => {
            if (error) this.error(response, "core")
        })
    },
    error: function(message, from) {
        console.log(`[Error in ${from}.js] ${message}`)
        _.each(config.debug, (channel) => {
            this.post(channel, `**Error:** An error was thrown${(from) ? " from \`" + from + ".js\`" : ""}:\n\`\`\`${message}\`\`\``)
        })
    }
}

// Initialise Discord
bot.loginWithToken(keys.token)
