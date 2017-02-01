const fs = require("fs");
const chalk = require("chalk");
const moment = require("moment");
const index = require("./index");
const config = require("./config");

// Helper Prototypes
String.prototype.toUpperLowerCase = function toUpperLowerCase() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// Module Functions
module.exports = {
    handleJoin: member => {
        if (config.adminServer.includes(member.guild.id)) {
            member.addRole(member.guild.roles.find("name", "Muggle"));
            member.send("", { embed: { "description": "Welcome to Kurisu's Server!\nTo get started, I kindly ask you take the following quizzes,\nand post the results in #general, so you can be sorted in to your appropriate roles!\n \nhttps://my.pottermore.com/user-profile/my-house/ilvermorny \nhttps://my.pottermore.com/user-profile/my-house/hogwarts\n\nWe don't have a set series of rules as we're a relatively small server,\nbut I do kindly ask that you don't spam, be mature and don't troll.\n\nSincerely, Kurisu." } });
        }
    },
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
                { "name": "Module:", "value": from, "inline": "1" },
                { "name": "Time:", "value": time, "inline": "1" },
                { "name": "Message:", "value": message }
            ]
        };

        console.log(chalk.red.bold(`[${time}, ${from}.js]`), chalk.red(message));

        try {
            channel.send("", { embed: embed })
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

        try {
            fs.access(file_format, fs.F_OK, () => {
                fs.appendFileSync(file_format, `${data_format}\n\n`);
            });
        } catch(error) {
            console.error(chalk.red("Couldn't save error log, does /logs/ exist?"));
        }
    }
};
