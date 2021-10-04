import Command from '../../core/Command';
import Database from '../../core/Database';

export default class Radar extends Command {
  constructor(client) {
    super(client, {
      name: 'Radar',
      description: 'Get the latest Weather Radar',
      aliases: [],
      args: [
        { name: 'location', desc: 'Location to grab the weather for', choices: [
          { name: 'Sydney', value: 'loc_sydney' },
          { name: 'Melbourne', value: 'loc_melbourne' },
          { name: 'Canberra', value: 'loc_canberra' },
          { name: 'Adelaide', value: 'loc_adelaide' }
        ] },
        { name: 'animated', desc: 'Animated', type: 'BOOLEAN' }
      ]
    });
  }

  async run(message, channel, user, args) {
    const locations = ['sydney', 'canberra', 'adelaide', 'melbourne'];

    // Check if user was pinged, or didn't provide any args
    if (message.pingedUsers.length > 0 || (args.length === 0 && message.pingedUsers.length === 0)) {
      if (message.pingedUsers.length > 0) user = message.pingedUsers[0];

      const Users = (await Database.Models.Users).default;
      const userDB = await Users.findOne({ where: { id: user.id } });
      let error = 'this user does not have a set radar location.';

      if (message.author.id === user.id) {
        error = `please provide a query or set your location with \`${message.prefix}set radar <location>\``;
      }

      // Checks for User in DB
      if (!userDB) {
        return message.reply(error);
      }

      const data = JSON.parse(userDB.data);

      // Checks for Radar in DB
      if (!data.radar) {
        return message.reply(error);
      }

      args[0] = data.radar.toLowerCase();
    }

    if (locations.indexOf(args[0].toLowerCase()) === -1) {
      return message.reply(`Sorry! It doesn't look like that location is supported. Supported locations include: \`${locations.join(', ')}\``);
    }

    const place = args[0] ? args[0].toLowerCase() : 'sydney';
    const type = args[1] ? args[1].toLowerCase() : 'animated';
    const ext = type === 'animated' ? 'gif' : 'png';
    const url = `https://api.kurisubrooks.com/api/radar?id=${place}&type=${type}`;

    return channel.send({ files: [{ name: `radar.${ext}`, attachment: url }] });
  }
}
