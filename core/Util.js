import chalk from "chalk";
import moment from "moment";
import client from "../index";
import config from "../config";
import { RichEmbed } from "discord.js";

// Logging Time Format
const time = () => moment().format("HH:mm:ss");

// Global Error Function
export const error = async (name, message, channel) => {
    const embed = new RichEmbed()
        .setColor(config.colours.error)
        .addField("Module:", name, true)
        .addField("Time:", time(), true)
        .addField("Message:", message);

    channel = channel || client.channels.get("212917108445544449");
    log(name, message, "error");

    return channel.sendEmbed(embed);
};

// Global Logging Function
export const log = async (name, message, style) => {
    let styles = {
        default: chalk.white,
        success: chalk.green,
        warn: chalk.yellow,
        info: chalk.blue,
        error: chalk.red
    };

    style = style || "default";

    if (Array.isArray(message)) {
        for (const item of message) {
            console.log(
                styles[style].bold(`[${time()} ${name}]`),
                styles[style](item)
            );
        }

        return false;
    } else {
        return console.log(
            styles[style].bold(`[${time()} ${name}]`),
            styles[style](message.replace(/\r?\n|\r/g, " "))
        );
    }
};

// Handle Client Ready
export const handleReady = async client => {
    log("Ready", "Discord", "success");

    return client;

    /*
    // Spawn Subprocesses
    for (const command in config.subprocesses) {
        try {
            console.log(chalk.blue.bold("Spawning Subprocess:"), chalk.green.bold(command));
            require(path.join(__dirname, "modules", command, "main.js"))(client, util, config, keychain, __dirname);
        } catch(error) {
            error(`Failed to start subprocess "${command}"\n${error}`, null, "index");
            throw error;
        }
    }
    */
};

// Handle User Join
export const handleJoin = async member => {
    if (config.adminServer.includes(member.guild.id)) {
        member.addRole(member.guild.roles.find("name", "Muggle"));
        member.send("", { embed: { "description": "Welcome to Kurisu's Server!\nTo get started, I kindly ask you take the following quizzes,\nand post the results in #general, so you can be sorted in to your appropriate roles!\n \nhttps://my.pottermore.com/user-profile/my-house/ilvermorny \nhttps://my.pottermore.com/user-profile/my-house/hogwarts\n\nWe don't have a set series of rules as we're a relatively small server,\nbut I do kindly ask that you don't spam, be mature and don't troll.\n\nSincerely, Kurisu." } });
    }
};

// Log Start
log("Started", "Process", "info");
