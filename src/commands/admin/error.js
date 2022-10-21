import Command from '../../core/Command';

export default class Error extends Command {
  constructor(client) {
    super(client, {
      name: 'Error',
      description: 'Triggers an Error',
      aliases: ['err'],
      admin: true
    });
  }

  async run(message, channel) {
    return this.error('Error Triggered by Admin', channel);
  }
}
