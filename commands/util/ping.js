import Command from '../../core/Command';

export default class Ping extends Command {
  constructor(client) {
    super(client, {
      name: 'Ping',
      description: 'Test Connection to Midori',
      aliases: []
    });
  }

  async run(message, channel) {
    return channel.send('Ping...')
      .then(msg => msg.edit(`Pong! \`${msg.createdTimestamp - message.createdTimestamp}ms\``));
  }
}
