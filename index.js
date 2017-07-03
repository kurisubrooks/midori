// Nano Core v5
// by @kurisubrooks

// Core
global.Promise = require("bluebird");
const { Client } = require("discord.js");
const { error, handleJoin } = require("./core/Util/Util");
const Keys = require("./keychain.json");
const Logger = require("./core/Util/Logger");
const CommandManager = require("./core/CommandManager");
const SubprocessManager = require("./core/SubprocessManager");

// Initialise
const client = new Client();
const Manager = new CommandManager(client);
const Subprocesses = new SubprocessManager(client);

const onReady = () => {
    Logger.success("Discord", "Ready");
    Subprocesses.loadModules("./subprocesses/");
};

Manager.loadCommands("./commands/");

// Handle Discord
client.login(Keys.discord);
client.once("ready", onReady);
client.on("warn", warn => error("Core", warn));
client.on("error", err => error("Core", err));
client.on("guildMemberAdd", member => handleJoin(member));
client.on("message", message => Manager.handleMessage(message));
client.on("messageUpdate", (old, neue) => {
    if (old.content !== neue.content) Manager.handleMessage(neue);
});

module.exports = client;
