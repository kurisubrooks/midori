const fs = require("fs");
const path = require("path");
const Logger = require("./Util/Logger");
const { error, toUpper } = require("./Util/Util");
const { Collection, Client } = require("discord.js");

module.exports = class SubprocessManager {
    constructor(client) {
        this.client = client;
        this.processes = new Collection();

        if (!this.client || !(this.client instanceof Client)) throw new Error("Discord Client is required");
    }

    loadModules(dir) {
        const subprocesses = fs.readdirSync(path.join(__dirname, "..", dir));

        for (const item of subprocesses) {
            const location = path.join(__dirname, "..", dir, item, "main.js");

            // Location doesn't exist, skip loop
            if (!fs.existsSync(location)) continue;

            // Add Subprocess to Processes Collection
            const Process = require(location);
            const instance = new Process(this.client);

            if (instance.disabled) continue;
            Logger.info("Loaded Process", toUpper(instance.name));

            if (this.processes.has(instance.name)) {
                throw new Error("Subprocesses cannot have the same name");
            } else {
                this.processes.set(instance.name, instance);
            }
        }

        for (const subprocess of this.processes.values()) {
            this.startModule(subprocess);
        }
    }

    startModule(subprocess) {
        try {
            Logger.info("Spawning Process", subprocess.name);
            return subprocess.run();
        } catch(err) {
            return error("Subprocess", err);
        }
    }
};
