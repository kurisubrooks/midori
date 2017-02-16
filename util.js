import path from "path";
import chalk from "chalk";
import moment from "moment";
import index from "./index";
import config from "./config";
import keychain from "./keychain.json";

// Log Process Start
console.log(chalk.blue.bold("Process: Started"));

// Helper Prototypes
String.prototype.toUpperLowerCase = function toUpperLowerCase() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// Module Functions
const util = module.exports = {
    handleJoin: member => {
        if (config.adminServer.includes(member.guild.id)) {
            member.addRole(member.guild.roles.find("name", "Muggle"));
            member.send("", { embed: { "description": "Welcome to Kurisu's Server!\nTo get started, I kindly ask you take the following quizzes,\nand post the results in #general, so you can be sorted in to your appropriate roles!\n \nhttps://my.pottermore.com/user-profile/my-house/ilvermorny \nhttps://my.pottermore.com/user-profile/my-house/hogwarts\n\nWe don't have a set series of rules as we're a relatively small server,\nbut I do kindly ask that you don't spam, be mature and don't troll.\n\nSincerely, Kurisu." } });
        }
    },
    handleReady: (bot, util) => {
        console.log(chalk.blue.bold("Discord: Ready"));

        // Spawn Subprocesses
        for (const command in config.subprocesses) {
            try {
                console.log(chalk.blue.bold("Spawning Subprocess:"), chalk.green.bold(command));
                require(path.join(__dirname, "modules", command, "main.js"))(bot, util, config, keychain, __dirname);
            } catch(error) {
                util.error(`Failed to start subprocess "${command}"\n${error}`, "index");
                throw error;
            }
        }
    },
    handleBlacklist: async (message) => {
        let embed = {
            fields: [
                { name: "Offence", value: "Blacklisted Word" },
                { name: "Action", value: "Message Removed" },
                { name: "Message", value: message.content }
            ]
        };

        try {
            console.log(`Deleting ${message.id} from ${message.guild ? message.guild.name : "DM"}`);
            await message.delete();
            return message.author.sendMessage(`Your message was removed because it contains a word that has been blacklisted.`, { embed });
        } catch(error) {
            return util.error(`Unable to delete message ${message.id} from ${message.guild ? message.guild.name : "DM"}`, "blacklist");
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

        return channel.send(``, { embed })
            .catch(error => console.error(error));
    }
};
