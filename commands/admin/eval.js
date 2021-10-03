import util from 'util';
import Command from '../../core/Command';

export default class Evaluator extends Command {
  constructor(client) {
    super(client, {
      name: 'Eval',
      description: 'Evals Code',
      aliases: [],
      admin: true
    });
  }

  async run(message, channel, user, args) {
    if (user.id !== '132368482120499201') return false;

    const regex = new RegExp(this.client.token.replace(/\./g, '\\.').split('').join('.?'), 'g');

    const input = `📥\u3000**Input:**\n\`\`\`js\n${args.join(' ')}\n\`\`\``;
    const error = err => `🚫\u3000**Error:**\n\`\`\`js\n${err.toString().replace(regex, '[Token]')}\n\`\`\``;

    try {
      let output = eval(args.join(' '));
      if (typeof output !== 'string') output = util.inspect(output, { depth: 1 });
      const response = `📤\u3000**Output:**\n\`\`\`js\n${output.replace(regex, '[Token]')}\n\`\`\``;
      if (input.length + response.length > 1900) throw new Error('Output too long!');
      await channel.send(`${input}\n${response}`).catch(err => channel.send(`${input}\n${error(err)}`));
      return this.delete(message);
    } catch(err) {
      await channel.send(`${input}\n${error(err)}`).catch(err => channel.send(`${input}\n${error(err)}`));
      return this.delete(message);
    }
  }
}
