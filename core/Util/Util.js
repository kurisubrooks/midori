const config = require("../../config");
const Logger = require("./Logger");
const { RichEmbed } = require("discord.js");

class Util {
    // Throw error if someone tries to create an instance
    constructor() {
        throw new Error(`${this.constructor.name} class cannot be instantiated`);
    }

    // String First Letter Upper Case
    static toUpper(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Global Error Function
    static error(name, message, channel) {
        const embed = new RichEmbed()
            .setColor(config.colours.error)
            .addField("Module", name, true)
            .addField("Time", Logger.time(), true)
            .addField("Message", message);

        channel = channel || null;
        Logger.error(name, message);

        if (channel) channel.send({ embed });
        return false;
    }
}

// Unhandled Promise Rejections
process.on("unhandledRejection", reason =>
    Logger.error("Unhandled Rejection", reason, true));

// Unhandled Errors
process.on("uncaughtException", error =>
    Logger.error("Uncaught Exception", error, true));

// Log Start
Logger.info("Process", "Started");

module.exports = Util;
