import util from "../util";
import config from "../config";

import chalk from "chalk";
import moment from "moment";
import { RichEmbed } from "discord.js";

const time = () => moment().format("hh:mm:ss A");

module.exports = class Command {
    constructor(client, data) {
        this.client = client;
        this.util = util;
        this.config = config;

        this.name = data.name;
        this.description = data.description;
        this.aliases = data.aliases || [];
        this.usage = data.usage || "";
        this.guildOnly = data.guildOnly || false;

        if (!this.name) throw new Error("Command Name is required");
        if (!this.description) throw new Error("Command Description is required");
    }

    run() {
        throw new Error("Missing Run Method");
    }

    log(message, style) {
        let styles = {
            default: chalk.white,
            success: chalk.green,
            warn: chalk.yellow,
            error: chalk.red
        };

        return console.log(
            chalk.magenta.bold(`[${time()} ${this.name}]`),
            styles[style || "default"](`${message}`)
        );
    }

    error(message) {
        const embed = new RichEmbed()
            .setColor(config.colours.error)
            .addField("Module:", this.name, true)
            .addField("Time:", time(), true)
            .addField("Message:", message);

        this.log(message, "error");
        return this.channel.sendEmbed(embed);
    }

    hasAdmin(user) {
        return config.masters.includes(user.id);
    }
};
