const Command = require("../../core/Command");

class HalfWidthConverter extends Command {
    constructor(client) {
        super(client, {
            name: "HalfWidth",
            description: "Convert Full Width Latin to Half Width",
            aliases: ["hw"],
            disabled: true
        });
    }

    async run(message, channel, user, args) {
        const fw = "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ　ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９／－＋～！＠＃＄％＾＆＊（）＿＋、。";
        const hw = "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/-+~!@#$%^&*()_+,.";
        const input = args.join(" ").split("");
        const output = input.map(letter => fw.indexOf(letter) > -1 ? hw[fw.indexOf(letter)] : letter).join("");
        channel.send(output);
    }
}

module.exports = HalfWidthConverter;
