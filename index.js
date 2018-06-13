// Nano Core v5
// by @kurisubrooks

// Core
global.Promise = require("bluebird");
const { Client } = require("discord.js");
const { error } = require("./core/Util/Util");
const keys = require("./keychain.json");
const config = require("./config.js");
const Logger = require("./core/Util/Logger");
const CommandManager = require("./core/CommandManager");
const SubprocessManager = require("./core/SubprocessManager");

// Initialise
const client = new Client();
const Manager = new CommandManager(client);
const Subprocesses = new SubprocessManager(client);

const onReady = () => {
    Logger.success("Discord", `Ready, Logged in as ${client.user.username}`);
    Subprocesses.loadModules("./subprocesses/");

    if (config.selfbot) {
        delete client.user.email;
        delete client.user.verified;
        config.admin = [client.user.id];
    }
};

Manager.loadCommands(config.directory);

// Handle Discord
client.login(keys.discord);
client.once("ready", onReady);
client.on("warn", warn => error("Core", warn));
client.on("error", err => error("Core", err));
client.on("message", message => Manager.handleMessage(message));
client.on("messageUpdate", (old, _new) => {
    if (old.content !== _new.content) Manager.handleMessage(_new);
});

module.exports = client;
