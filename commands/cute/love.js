const Command = require("../../core/Command");

class Love extends Command {
    constructor(client) {
        super(client, {
            name: "Love",
            description: "Share the love!",
            aliases: ["kiss", "hug"]
        });
    }

    async run(message, channel, user) {
        if (message.pung.length === 0) {
            return message.reply("you didn't specify whom you want to send your love to!");
        }

        const images = [
            "https://media.giphy.com/media/h4CbRI7mBVm8M/giphy.gif",
            "https://media.giphy.com/media/lZDb2PNgLXdoA/giphy.gif",
            "https://media.giphy.com/media/KH1CTZtw1iP3W/giphy.gif",
            "https://media.giphy.com/media/f82EqBTeCEgcU/giphy.gif",
            "https://media.giphy.com/media/FqBTvSNjNzeZG/giphy.gif",
            "https://media.giphy.com/media/143v0Z4767T15e/giphy.gif",
            "https://media.giphy.com/media/wnsgren9NtITS/giphy.gif",
            "https://media.giphy.com/media/IRUb7GTCaPU8E/giphy.gif",
            "https://media.giphy.com/media/EVODaJHSXZGta/giphy.gif",
            "https://media.giphy.com/media/ZRSGWtBJG4Tza/giphy.gif",
            "https://media.giphy.com/media/3o7bu0VnLEXzEz4vxS/giphy.gif",
            "https://media.giphy.com/media/YrM8Vyi67U46c/giphy.gif",
            "https://media.giphy.com/media/CTo4IKRN4l4SA/giphy.gif",
            "https://media.giphy.com/media/bm2O3nXTcKJeU/giphy.gif"
        ];

        const target = message.pung[0];
        let result = images[Math.floor(Math.random() * images.length)];

        if ((user.id === "132368482120499201" && target.id === "108461461180801024")
         || (user.id === "108461461180801024" && target.id === "132368482120499201")) {
            result = images[0];
        }

        channel.send(`<@${user.id}> loves you, ${target.nickname ? target.nickname : target.user.username}!`, { files: [result] });
    }
}

module.exports = Love;
