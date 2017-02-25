const chalk = require("chalk");
const moment = require("moment");
const client = require("../index");
const config = require("../config");
const { RichEmbed } = require("discord.js");

class Util {

    // Throw error if someone tries to create an instance
    constructor() {
        throw new Error(`${this.constructor.name} class cannot be instantiated`);
    }
    // Logging Time Format
    static time() {
        return moment().format("HH:mm:ss");
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
            .addField("Time", Util.time(), true)
            .addField("Message", message);

        channel = channel || client.channels.get("212917108445544449");
        Util.log(name, message, "error");

        return channel.sendEmbed(embed);
    }

    // Global Logging Function
    static log(name, message, style, stacktrace) {
        let styles = {
            default: chalk.white,
            success: chalk.green,
            warn: chalk.yellow,
            error: chalk.red,
            fatal: chalk.bgRed.white,
            info: chalk.blue,
            debug: chalk.magenta
        };

        style = style || "default";

        if (Array.isArray(message)) {
            for (const item of message) {
                console.log(
                    styles[style].bold(`[${Util.time()} ${Util.toUpper(name)}]`),
                    styles[style](item)
                );
            }

            return false;
        } else if (stacktrace) {
            console.log(
                styles[style].bold(`[${Util.time()} ${Util.toUpper(name)}]`),
                styles[style](message)
            );

            return console.trace(styles[style](message));
        } else {
            message = typeof message === "string" ? message.replace(/\r?\n|\r/g, " ") : message;
            return console.log(
                styles[style].bold(`[${Util.time()} ${Util.toUpper(name)}]`),
                styles[style](message)
            );
        }
    }

    // Handle User Join
    static handleJoin(member) {
        if (config.adminServer.includes(member.guild.id)) {
            member.addRole(member.guild.roles.find("name", "Muggle"));
            const embed = new RichEmbed()
                .setDescription("Welcome to Kurisu's Server!\nTo get started, I kindly ask you take the following quizzes,\nand post the results in #general, so you can be sorted in to your appropriate roles!\n \nhttps://my.pottermore.com/user-profile/my-house/ilvermorny \nhttps://my.pottermore.com/user-profile/my-house/hogwarts\n\nWe don't have a set series of rules as we're a relatively small server,\nbut I do kindly ask that you don't spam, be mature and don't troll.\n\nSincerely, Kurisu.");
            member.sendEmbed(embed);
        }
    }
}

// Unhandled Promise Rejections
process.on("unhandledRejection", reason =>
    Util.log("Unhandled Rejection", reason, "error", true));

// Unhandled Errors
process.on("uncaughtException", error =>
    Util.log("Uncaught Exception", error, "error", true));

// Log Start
Util.log("Process", "Started", "info");

module.exports = Util;
