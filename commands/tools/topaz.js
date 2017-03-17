/* eslint-disable no-mixed-operators */
const { RichEmbed } = require("discord.js");
const Command = require("../../core/Command");

// Converters
const ctof = celsius => celsius * 9 / 5 + 32;
const ctok = celsius => celsius + 273.15;

const ftoc = fahrenheit => (fahrenheit - 32) * 5 / 9;
const ftok = fahrenheit => (fahrenheit + 459.67) * 5 / 9;

const ktoc = kelvin => 271.15 - kelvin;
const ktof = kelvin => kelvin * 9 / 5 - 459.67;

class Compute extends Command {
    constructor(client) {
        super(client, {
            name: "Compute",
            description: "Compute Various Equations with Topaz Engine",
            aliases: ["c", "comp"]
        });
    }

    async run(message, channel, user, args) {
        if (args.length < 1) {
            return message.reply("Please provide a query");
        }

        const input = args.join(" ").split("to");
        const from = input[0].trim().split("");
        const to = input[1].trim();
        const funit = from.splice(-1).join("");
        const convert = from.join("");

        let final;

        if (funit === "c") {
            if (to === "f") {
                console.log("from c to f");
                final = `${Math.round(ctof(convert))}°F`;
            }
        }

        if (funit === "f") {
            if (to === "c") {
                console.log("from f to c");
                final = `${Math.round(ftoc(convert))}°C`;
            }
        }

        if (!final) {
            return this.error("No.", channel);
        }

        console.log("From", funit);
        console.log("To", to);
        console.log("Convert", convert);
        console.log("Result", final);

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setAuthor(user.nickname, user.avatarURL)
            .addField("Compute", args.join(" "))
            .addField("Result", final);

        return channel.sendEmbed(embed);
    }
}

module.exports = Compute;
