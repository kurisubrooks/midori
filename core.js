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
        if (data.author) data.message = `**${data.author}**, ${data.message}`
        bot.sendMessage(data.channel, data.message, {}, (error, response) => {
            if (error) this.error(response, "core")
            if (callback) callback()
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
        if (typeof message === "object") message = JSON.stringify(message)

        console.log(`[Error in ${from}.js] ${message}`)
        _.each(config.debug, (channel) => {
            this.post({
                channel: channel,
                message: `**Error:** An error was thrown${(from) ? " from \`" + from + ".js\`" : ""}:\n\`\`\`${message}\`\`\``
            })
        })
    }
}

// Initialise Discord
bot.loginWithToken(keys.token)

// Helper Prototypes
String.prototype.toUpperLowerCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
