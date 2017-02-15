const path = require("path");
const chalk = require("chalk");
const moment = require("moment");
const index = require("./index");
const config = require("./config");
const keychain = require("./keychain.json");

let firstRun = true;

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
    handleReady: (bot, util) => {
        console.log(chalk.blue.bold("Discord: Ready"));

        // Spawn Subprocesses
        if (firstRun) {
            for (const command in config.subprocesses) {
                try {
                    console.log(chalk.blue.bold("Spawning Subprocess:"), chalk.green.bold(command));
                    require(path.join(__dirname, "modules", command, "main.js"))(bot, util, config, keychain, __dirname);
                } catch(error) {
                    util.error(`Failed to start subprocess "${command}"\n${error}`, "index");
                    throw error;
                }
            }

            // Prevent Double Trigger
            firstRun = false;
        }
    },
    error: (message, from, channel) => {
        if (!channel) channel = index.bot.channels.get("212917108445544449");

        const time = moment().format("h:mm:ssa");
        const embed = {
            "color": config.colours.error,
            "fields": [
                { "name": "Module:", "value": from, "inline": true },
                { "name": "Time:", "value": time, "inline": true },
                { "name": "Message:", "value": message }
            ]
        };

        console.log(chalk.red.bold(`[${time}, ${from}.js]`), chalk.red(message));

        return channel.send(``, { embed: embed })
            .catch(error => console.error(error));
    }
};
