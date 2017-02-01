const config = require("../config");

module.exports = class Command {
    constructor(options) {
        this.name = options.name || undefined;
        this.aliases = options.aliases || [];
        this.description = options.description || undefined;
        this.admin = options.admin || false;
    }

    hasPermission(message) {
        return config.masters.includes(message.author.id);
    }

    run() {
        return null;
    }
};
