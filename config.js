module.exports = {
    // Default Prefix for Commands
    sign: "!",

    // Directory where modules are located
    directory: "./commands/",

    // Users (user id) with bot admin controls
    admin: ["132368482120499201"],

    // Mac Address of Server for reference to server status
    server: "82:dc:73:5d:a9:f1",

    // Economy Settings
    economy: {
        range: [1, 3],
        range_media: [2, 4],
        currency: "cheese",
        currency_plural: "cheese",
        symbol: null,
        emoji: "🧀"
    },

    // Predefined Colours for Embeds
    colours: {
        default: 0xB699FF,
        success: 0x52C652,
        error: 0xE93F3C,
        warn: 0xF5AD1E,
        info: 0x52B7D6
    },

    // Earthquake Early Warnings (deprecated, disabled)
    shake: {
        socket: "http://shake.kurisubrooks.com:3390",
        channels: {
            post: "276249021579001857",
            debug: "212917108445544449"
        }
    }
};
