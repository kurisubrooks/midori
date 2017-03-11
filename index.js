// Nano Core v5
// by @kurisubrooks

// Core
global.Promise = require("bluebird");
const { Client } = require("discord.js");
const { error, handleJoin } = require("./core/Util/Util");
const Logger = require("./core/Util/Logger");
const keychain = require("./keychain.json");
const CommandManager = require("./core/CommandManager");
const SubprocessManager = require("./core/SubprocessManager");

// Initialise
const client = new Client();

let onReady = () => {
    Logger.success("Discord", "Ready");

    const Subprocesses = new SubprocessManager(client);
    Subprocesses.loadModules("./subprocesses/");
};

const Manager = new CommandManager(client);
Manager.loadCommands("./commands/");

// Handle Discord
client.login(keychain.discord);
client.once("ready", () => onReady());
client.on("warn", warning => error("Core", warning));
client.on("error", error => error("Core", error));
client.on("guildMemberAdd", member => handleJoin(member));
client.on("message", message => Manager.handleMessage(message));

module.exports = client;
