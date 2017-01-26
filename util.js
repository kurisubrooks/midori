"use strict";

const fs = require("fs");
const chalk = require("chalk");
const moment = require("moment");
const index = require("./index");
const config = require("./config");

// Helper Prototypes
String.prototype.toUpperLowerCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// Module Functions
module.exports = {
    error: (message, from, channel) => {
        // if (typeof message === "string") message = JSON.stringify(message, null, 4)
        // #owlery
        if (!channel) channel = index.bot.channels.get("212917108445544449");

        let time = moment().format("h:mm:ssa");
        let err_format = moment().format("D_MMMM_YYYY");

        let file_format = `./logs/${err_format}.log`;
        let data_format = `\`${time} — ${from}.js\`\n-----\n\`\`\`\n${message}\n\`\`\``;
        let embed = {
            "color": config.colours.error,
            "fields": [
                { "name": "Module:", "value": `${from}.js`, "inline": "1" },
                { "name": "Time:", "value": time, "inline": "1" },
                { "name": "Message:", "value": message }
            ]
        };

        console.log(chalk.red.bold(`[${time}, ${from}.js]`), chalk.red(message));

        try {
            channel.sendMessage("", { embed: embed })
                .catch(error => {
                    if (error.status === 502) {
                        console.error("Discord", "Bad Gateway");
                    } else if (error.status === 401) {
                        console.error("Discord", "Unauthorized");
                    } else if (error.status === 400) {
                        console.error("Discord", "Bad Request");
                    } else {
                        console.error(error);
                    }
                });
        } catch(err) {
            console.error(err);
        }

        fs.access(file_format, fs.F_OK, () => {
            fs.appendFileSync(file_format, `${data_format}\n\n`);
        });
    }
};
