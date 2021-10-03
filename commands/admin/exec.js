import child from 'child_process';
import util from 'util';
import Command from '../../core/Command';

export default class Executor extends Command {
  constructor(client) {
    super(client, {
      name: 'Exec',
      description: 'Executes shell commands',
      aliases: [],
      admin: true,
      disabled: true
    });
  }

  async run(message, channel, user, args) {
    const regex = new RegExp(this.client.token.replace(/\./g, '\\.').split('').join('.?'), 'g');

    const input = `📥\u3000**Input:**\n\`\`\`sh\n${args.join(' ')}\n\`\`\``;
    const error = err => `🚫\u3000**Error:**\n\`\`\`sh\n${err.toString().replace(regex, '[Token]')}\n\`\`\``;

    child.exec(args.join(' '), (stderr, stdout) => {
      if (stderr) {
        channel.send(`${input}\n${error(stderr)}`).catch(err => channel.send(`${input}\n${error(err)}`));
      } else {
        if (typeof output !== 'string') stdout = util.inspect(stdout, { depth: 1 });
        const response = `📤\u3000**Output:**\n\`\`\`sh\n${stdout.replace(regex, '[Token]')}\n\`\`\``;
        if (input.length + response.length > 1900) throw new Error('Output too long!');
        channel.send(`${input}\n${response}`).catch(err => channel.send(`${input}\n${error(err)}`));
      }
    });
  }
}
