const Command = require("../../core/Command");

class FullWidthConverter extends Command {
    constructor(client) {
        super(client, {
            name: "FullWidth",
            description: "Convert Half Width Latin to Full Width",
            aliases: ["fw"],
            disabled: true
        });
    }

    async run(message, channel, user, args) {
        const fw = "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ　ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９／－＋～！＠＃＄％＾＆＊（）＿＋、。";
        const hw = "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/-+~!@#$%^&*()_+,.";
        const input = args.join(" ").split("");
        const output = input.map(letter => hw.indexOf(letter) > -1 ? fw[hw.indexOf(letter)] : letter).join("");
        channel.send(output);
    }
}

module.exports = FullWidthConverter;
