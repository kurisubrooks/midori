import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import Canvas from 'canvas';
import moment from 'moment-timezone';
import request from 'request-promise';

import Command from '../../core/Command';
import Database from '../../core/Database';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default class Weather extends Command {
  constructor(client) {
    super(client, {
      name: 'weather',
      description: 'Gets the weather for a given location',
      aliases: ['w'],
      args: [
        { name: 'location', desc: 'Location to grab the weather for', takes: 'string' },
        // { name: 'user', desc: 'Get the weather from this user\'s cached location', takes: 'user' },
        { name: 'unit', desc: 'Choose your weather unit', takes: 'string', choices: [
          { name: 'celsius', value: 'unit_celsius' }, { name: 'fahrenheit', value: 'unit_fahrenheit' }
        ] }
      ]
    });
  }

  async run(message, channel, user, args) {
    let metric, location, mentionedUser, geolocation;
    // await message.deferReply();

    // Handle args by type
    if (message.type === 'interaction') {
      location = args.getString('location');
      metric = args.getString('unit');
      mentionedUser = args.getUser('user');
    } else {
      metric = args.indexOf('-f') > -1;
      if (metric) args.splice(args.indexOf('-f'), 1); // Remove -f
      location = args;
      mentionedUser = message.pingedUsers.length > 0 ? message.pingedUsers[0] : null;
    }

    console.log(location, metric);

    // Get stored location from database
    if ((!location || location === '' || (Array.isArray(location) && location.length === 0)) && !mentionedUser) {
      geolocation = await this.getUserGeolocation(message, channel, user.user);
    }

    // Get location for mentioned user
    if (mentionedUser) {
      this.log(`Getting Weather for user ${mentionedUser.id}`, 'debug');
      geolocation = await this.getUserGeolocation(message, channel, mentionedUser);
    }

    // Get location from query
    if (!geolocation) {
      geolocation = await this.fetchGeolocation(location);
      if (typeof geolocation === 'string') return this.error(geolocation, channel);
      if (Array.isArray(geolocation)) {
        geolocation = {
          line1: geolocation[0].long_name,
          line2: geolocation[1].long_name,
          geocode: geolocation[2]
        };
      }
    }

    console.log(geolocation);

    // Get Weather
    const weather = await request({
      headers: { 'User-Agent': 'Mozilla/5.0' },
      uri: `https://api.darksky.net/forecast/${this.keychain.darksky}/${geolocation.geocode.join(',')}`,
      json: true,
      qs: {
        units: metric ? 'us' : 'si',
        excludes: 'minutely,hourly,alerts'
      }
    }).catch(error => this.error(error.response.body.error, channel));

    if (!weather) return false;

    const locale = weather.flags.units === 'us' ? 'F' : 'C';
    const condition = weather.currently.summary;
    const icon = weather.currently.icon;
    const temperature = Math.round(weather.currently.temperature);
    const dateTime = moment().tz(weather.timezone).format('h:mm A');
    const forecast = weather.daily.data;

    this.log(`${geolocation.line1}, ${geolocation.line2}: ${temperature}°${locale}, ${condition}, ${dateTime}`, 'debug');

    Canvas.registerFont(path.join(__dirname, 'fonts', 'Inter-UI-Medium.ttf'), { family: 'InterUI' });
    // Fallback Japanese font
    Canvas.registerFont(path.join(__dirname, 'fonts', 'NotoSansJP-Medium.otf'), { family: 'InterUI' });

    // Generate Response Image
    const canvas = Canvas.createCanvas(800, 430);
    const ctx = canvas.getContext('2d');
    const { Image } = Canvas;
    const base = new Image();
    const cond = new Image();
    const day1 = new Image();
    const day2 = new Image();
    const high = new Image();
    const low = new Image();

    base.src = path.join(__dirname, 'base', `${this.getBaseImage(icon)}.png`);
    cond.src = path.join(__dirname, 'icons', `${this.getConditionImage(icon)}.png`);
    day1.src = path.join(__dirname, 'icons', `${this.getConditionImage(forecast[1].icon)}.png`);
    day2.src = path.join(__dirname, 'icons', `${this.getConditionImage(forecast[2].icon)}.png`);
    high.src = path.join(__dirname, 'icons', 'high.png');
    low.src = path.join(__dirname, 'icons', 'low.png');

    // Environment Variables
    ctx.drawImage(base, 0, 0);
    ctx.scale(1, 1);
    ctx.patternQuality = 'bilinear';
    ctx.filter = 'bilinear';
    ctx.antialias = 'subpixel';

    // Town/City/District
    ctx.font = '40px InterUI';
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillText(geolocation.line1, 60, 70);

    // State/Region/Country
    ctx.font = '28px InterUI';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText(geolocation.line2, 60, 115);

    // Condition
    ctx.drawImage(cond, 643, 30);

    // Temperature
    ctx.font = '56px InterUI';
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillText(`${temperature}°${locale}`, 60, 240);

    // Daily Forecast
    const width = (200 + (temperature.toString().length - 1)) * 28;
    ctx.font = '28px InterUI';
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillText(`${Math.round(forecast[0].temperatureMax)}°`, width + 40, 210);
    ctx.drawImage(high, width, 188);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText(`${Math.round(forecast[0].temperatureMin)}°`, width + 40, 247);
    ctx.drawImage(low, width, 226);

    // Time
    ctx.textAlign = 'right';
    ctx.font = '32px InterUI';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(dateTime, 740, 231);

    // Details
    ctx.textAlign = 'left';
    ctx.font = '28px InterUI';
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillText(`${Math.round(weather.currently.humidity * 100)}%`, 112, 341);
    ctx.fillText(`${Math.round(weather.currently.precipProbability * 100)}%`, 112, 391);

    // Forecast
    ctx.textAlign = 'right';
    ctx.font = '28px InterUI';
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';

    // tomorrow
    ctx.fillText('Tomorrow', 530, 341);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText(`${Math.round(forecast[1].temperatureMin)}°`, 530, 391);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillText(`${Math.round(forecast[1].temperatureMax)}°`, 465, 391);
    ctx.drawImage(day1, 360, 364, 36, 36);

    // day after
    ctx.fillText(moment.unix(forecast[2].time).format('dddd'), 740, 341);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText(`${Math.round(forecast[2].temperatureMin)}°`, 740, 391);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillText(`${Math.round(forecast[2].temperatureMax)}°`, 675, 391);
    ctx.drawImage(day2, 570, 364, 36, 36);

    return channel.send({ files: [{ attachment: canvas.toBuffer(), url: 'weather.png' }] });
    /*
    return message.editReply({
      files: [{ attachment: canvas.toBuffer(), url: 'weather.png' }],
      ephemeral: false
    });
    */
  }

  async getUserGeolocation(message, channel, user) {
    const Users = (await Database.Models.Users).default;
    const userDB = await Users.findOne({ where: { id: user.id } });
    let error = `Please provide a query, or set your location with \`${message.prefix}set location <location>\` and run the command again.`;
    let geolocation;

    // Check if User exists in DB
    if (userDB) {
      const data = JSON.parse(userDB.data);

      // Checks if User has a set location
      if (data.weather || data.location) {
        geolocation = data.weather || data.location;

        if (typeof geolocation === 'string') {
          await this.error(geolocation, channel);
          return false;
        }

        if (Array.isArray(geolocation)) {
          geolocation = {
            line1: geolocation[0].long_name,
            line2: geolocation[1].long_name || '',
            geocode: geolocation[2]
          };
        }

        this.log(`Using Cached Geolocation (${geolocation.line1}, ${geolocation.line2})`, 'debug');
        return geolocation;
      }

      if (message.user.id !== user.id) {
        error = `This user hasn't set their location.`;
      }

      await message.reply(error);
      return false;
    }

    await message.reply(error);
    return false;
  }

  // Get Image
  getConditionImage(input) {
    const icons = {
      'clear-day': 'day',
      'clear-night': 'night',
      'cloudy': 'cloudy',
      'flurries': 'snow',
      'fog': 'particles',
      'partly-cloudy-day': 'day_partlycloudy',
      'partly-cloudy-night': 'night_partlycloudy',
      'rain': 'rain',
      'sleet': 'snow',
      'snow': 'snow',
      'thunderstorm': 'storm',
      'unknown': 'unknown',
      'wind': 'wind'
    };

    return icons[input] || 'Unknown';
  }

  // Get Background Image based on Weather Condition
  getBaseImage(input) {
    if (input === 'clear-day' || input === 'partly-cloudy-day' || input === 'cloudy') {
      return 'day';
    } else if (input === 'clear-night' || input === 'partly-cloudy-night') {
      return 'night';
    } else if (input === 'rain' || input === 'thunderstorm') {
      return 'rain';
    } else if (input === 'snow' || input === 'sleet' || input === 'flurries') {
      return 'snow';
    } else {
      return 'day';
    }
  }

  // Handle Geolocation API Errors
  handleNotOK(geolocation) {
    if (geolocation.status === 'ZERO_RESULTS') {
      return 'Query returned no results';
    } else if (geolocation.status === 'REQUEST_DENIED') {
      return 'Geocode API Request was denied';
    } else if (geolocation.status === 'INVALID_REQUEST') {
      return 'Invalid Request';
    } else if (geolocation.status === 'OVER_QUERY_LIMIT') {
      return 'Query Limit Exceeed, try again tomorrow.';
    } else {
      return 'Unknown API Error';
    }
  }

  // Handle Geolocation Data
  async fetchGeolocation(args) {
    let line1, line2, found1, geocode;

    const geolocation = await request({
      headers: { 'User-Agent': 'Mozilla/5.0' },
      uri: 'https://maps.googleapis.com/maps/api/geocode/json',
      json: true,
      qs: {
        address: args.join('+'),
        key: this.keychain.google.geocode
      }
    }).catch(error => error.response.body.error);

    // Handle Errors
    if (typeof geolocation === 'string') return geolocation;
    if (geolocation.status !== 'OK') return this.handleNotOK(geolocation);
    if (geolocation.results.length > 1) {
      const places = [];

      this.log('Too Many Results', 'debug');

      for (const val of geolocation.results) {
        places.push(`\`${val.formatted_address}\``);
      }

      return `Too many results were returned!\nHere's some of the returned results, please try to narrow it down for me...\n${places.join(', ')}`;
    }

    const place = geolocation.results[0].address_components;
    const find = locality => place.find(elem => elem.types.includes(locality));

    if (find('neighborhood')) {
      line1 = find('neighborhood').long_name;
    } else if (find('natural_feature')) {
      line1 = find('natural_feature').long_name;
    } else if (find('point_of_interest')) {
      line1 = find('point_of_interest').long_name;
    } else if (find('locality')) {
      line1 = find('locality').long_name;
    } else if (find('ward')) {
      line1 = find('ward').long_name;
    } else if (find('administrative_area_level_3')) {
      line1 = find('administrative_area_level_3').long_name;
    } else if (find('administrative_area_level_2')) {
      line1 = find('administrative_area_level_2').long_name;
    } else if (find('administrative_area_level_1')) {
      line1 = find('administrative_area_level_1').long_name;
      found1 = 1;
    } else if (find('country')) {
      line1 = find('country').long_name;
      found1 = 2;
    } else if (find('continent')) {
      line1 = find('continent').long_name;
      found1 = 3;
    } else {
      line1 = 'Unknown';
    }

    if (find('administrative_area_level_1') && line1 !== find('administrative_area_level_1').long_name && found1 !== 1) {
      line2 = find('administrative_area_level_1').long_name;
    } else if (find('country') && line1 !== find('country').long_name && found1 !== 2) {
      line2 = find('country').long_name;
    } else if (find('continent') && line1 !== find('continent').long_name && found1 !== 3) {
      line2 = find('continent').long_name;
    } else {
      line2 = '';
    }

    if (line1.length > 25) line1 = `${line1.slice(0, 25)}...`;
    if (line2.length > 40) line2 = `${line2.slice(0, 40)}...`;

    geocode = [geolocation.results[0].geometry.location.lat, geolocation.results[0].geometry.location.lng];

    this.log(`Geolocation Retrieved`, 'debug');

    return { line1, line2, geocode };
  }
}

export const geolocation = async args => {
  const inst = new Weather();
  return await inst.fetchGeolocation(args);
};
