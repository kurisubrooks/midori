import Command from '../../core/Command';

export default class Purge extends Command {
  constructor(client) {
    super(client, {
      name: 'Purge',
      description: 'Purge a user from the Database',
      aliases: [],
      admin: true,
      disabled: true
    });
  }
}
