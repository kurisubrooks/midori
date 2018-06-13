const chalk = require("chalk");
const moment = require("moment");

const toUpper = string => string.charAt(0).toUpperCase() + string.slice(1);

class Logger {
    // Throw error if someone tries to create an instance
    constructor() {
        throw new Error(`${this.constructor.name} class cannot be instantiated`);
    }

    // Logging Time Format
    static time() {
        return moment().format("HH:mm:ss");
    }

    // Logger
    static log(style, name, message, stacktrace) {
        if (typeof style !== "function") {
            style = chalk.white;
        }

        // Log Multiple
        if (Array.isArray(message)) {
            for (const item of message) console.log(style.bold(`[${Logger.time()} ${toUpper(name)}]`), style(item));
            return false;
        // Log Stacktrace
        } else if (stacktrace) {
            console.log(style.bold(`[${Logger.time()} ${toUpper(name)}]`), style(message));
            return console.trace(require("util").format(message));
        // Log Normally
        } else {
            message = typeof message === "string" ? message.replace(/\r?\n|\r/g, " ") : message;
            return console.log(style.bold(`[${Logger.time()} ${toUpper(name)}]`), style(message));
        }
    }

    static success(name, message) {
        return Logger.log(chalk.green, name, message);
    }

    static error(name, message, stacktrace) {
        return Logger.log(chalk.red, name, message, stacktrace);
    }

    static warn(name, message) {
        return Logger.log(chalk.yellow, name, message);
    }

    static info(name, message) {
        return Logger.log(chalk.blue, name, message);
    }

    static debug(name, message) {
        return Logger.log(chalk.magenta, name, message);
    }

    static fatal(name, message, stacktrace) {
        throw Logger.log(chalk.bgRed.white, name, message, stacktrace);
    }
}

module.exports = Logger;
