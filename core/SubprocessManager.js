import fs from "fs";
import path from "path";
import { error, log } from "./Util";
import { Collection } from "discord.js";

export default class SubprocessManager {
    constructor(client) {
        this.client = client;
        this.processes = new Collection();
    }

    loadModules(dir) {
        const subprocesses = fs.readdirSync(path.join(__dirname, "../", dir));

        for (const item of subprocesses) {
            const location = path.join(__dirname, "../", dir, item, "main.js");

            // Location doesn't exist, skip loop
            if (!fs.existsSync(location)) continue;

            // Add Subprocess to Processes Collection
            const Subprocess = require(location).default;
            this.processes.set(item, new Subprocess(this.client));
        }

        for (const subprocess of this.processes.values()) {
            this.startModule(subprocess);
        }
    }

    startModule(subprocess) {
        try {
            log("Spawning Process", `${subprocess.name}`, "info");
            return subprocess.run();
        } catch(err) {
            return error("Subprocess", err);
        }
    }
}
