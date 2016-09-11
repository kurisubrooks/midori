const fs = require("fs")
const chalk = require("chalk")
const moment = require("moment")
const index = require("./index")

// Helper Prototypes
String.prototype.toUpperLowerCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}

// Module Functions
module.exports = {
    error: function(message, from, channel) {
        if (typeof message === "object") message = JSON.stringify(message, null, 4)
        if (!channel) channel = index.bot.channels.get("222762743038476298") //#midori

        let time = moment().format("h:mm:ssa")
        let err_format = moment().format("D_MMMM_YYYY")

        let file_format = `./logs/${err_format}.log`
        let data_format = `\`${time} — ${from}.js\`\n-----\n\`\`\`\n${message}\n\`\`\``

        console.log(chalk.red.bold(`[${time}, ${from}.js]`), chalk.red(message))

        try {
            channel.sendMessage(data_format)
                .catch(error => {
                    if (error.status === 502) console.error("Discord", "Bad Gateway")
                    else if (error.status === 401) console.error("Discord", "Unauthorized")
                    else console.error(error)
                })
        } catch(e) {
            console.error(e)
        }

        fs.access(file_format, fs.F_OK, (err) => {
            fs.appendFileSync(file_format, data_format + "\n\n")
        })
    }
}
