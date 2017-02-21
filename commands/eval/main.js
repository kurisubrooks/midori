const Command = require("../../core/Command");

module.exports = class EvalCommand extends Command {
    constructor(client) {
        super(client, {
            name: "eval",
            description: "Evals Code",
            adminOnly: true
        });
    }

    async run(message, channel, user, args) {
        if (!this.hasAdmin(user)) return message.reply("Insufficient Permissions");

        const bot = this.client, client = this.client; // eslint-disable-line no-unused-vars

        let input = `📥\u3000**Input:**\n\`\`\`js\n${args.join(" ")}\n\`\`\``;
        let error = err => `🚫\u3000**Error:**\n\`\`\`js\n${err.toString().replace(this.client.token, "<Token>")}\n\`\`\``;

        try {
            let output = eval(args.join(" "));
            if (typeof output !== "string") output = require("util").inspect(output, { depth: 1 });
            let response = `📤\u3000**Output:**\n\`\`\`js\n${output.replace(this.client.token, "[Token]")}\n\`\`\``;
            if (input.length + response.length > 1900) throw new Error("Output too long!");
            return channel.send(`${input}\n${response}`).catch(err => channel.send(`${input}\n${error(err)}`));
        } catch(err) {
            return channel.send(`${input}\n${error(err)}`).catch(err => channel.send(`${input}\n${error(err)}`));
        }
    }
};
