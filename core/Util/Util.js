const client = require("../../index");
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

        channel = channel || client.channels.get("212917108445544449");
        Logger.error(name, message);

        return channel.sendEmbed(embed);
    }

    // Handle User Join
    static handleJoin(member) {
        const server = "132368736119291904";

        if (server === member.guild.id) {
            member.addRole(member.guild.roles.find("name", "Muggle"));
            const embed = new RichEmbed()
                .setDescription("Welcome to Kurisu's Server!\nTo get started, I kindly ask you take the following quizzes,\nand post the results in #general, so you can be sorted in to your appropriate roles!\n \nhttps://my.pottermore.com/user-profile/my-house/ilvermorny \nhttps://my.pottermore.com/user-profile/my-house/hogwarts\n\nWe don't have a set series of rules as we're a relatively small server,\nbut I do kindly ask that you don't spam, be mature and don't troll.\n\nSincerely, Kurisu.");
            member.sendEmbed(embed);
        }
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
