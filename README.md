![Midori](http://i.imgur.com/XY3TmDR.png)

<div align="center">
    <a href="https://discord.gg/jD5V5EH">
        <img src="https://discordapp.com/api/guilds/292970618834649088/embed.png" />
    </a>
    <a href="https://david-dm.org/kurisubrooks/midori">
        <img src="https://david-dm.org/kurisubrooks/midori/dev-status.svg" />
    </a>
    <br /><br />
    Brand spanking new Nano with 100% less shit code!
    <br />
    Click <a href="https://discordapp.com/oauth2/authorize?client_id=212915056491495424&scope=bot">here</a> to add Midori to your server!</span>
</div>

## Building

### Prerequisites
**macOS**
```bash
brew install pkg-config cairo pango libpng jpeg giflib
```

**Ubuntu**
```bash
sudo apt install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++
```

### Installation
```bash
git clone https://github.com/kurisubrooks/midori.git
cd midori/
npm install
```

### Setup
Create a file called `keychain.json` in the main directory, with the following contents, filling in each line with the appropriate keys needed for each. (Make sure to remove the comments)

```js
{
    "discord": "", // Discord Bot Token
    "darksky": "", // DarkSky Weather API Key
    "sherlock": "", // Sherlock API Key
    "google": {
        "cx": "", // Google Search API CX
        "search": "", // Google Search API Key
        "geocode": "" // Google Geolocation API Key
    }
}
```

### Run
You can start Midori by simply typing the following:

```bash
npm start
```

If you wish to run Midori under Production, you can start her with pm2 by using

```bash
pm2 start index.js --name "midori" --node-args="--harmony" -- --color
```

### Run with Docker (optional)
If you want to deploy Midori with docker by using the ``Dockerfile`` provided, in the directory run

```bash
docker build -t midori .
```

To start simply execute

```bash
docker run -d midori
```

The ``-d`` flag means she will be running in the background.
If you want to automatically restart her after a crash, docker has the ``restart always`` flag which you can use like so:

```bash
docker run --restart=always -d midori
```

### Development
Thanks for taking interest in Midori!
I've included some build commands through the Gulp build tool, some of which you might find useful.

**Linting**  
Run this command to find errors in your syntax.  
(You'll need to do this if you plan on submitting any Pull Requests!)

```bash
npm run lint
```

**Run**  
Run this command to start Midori.  
You'll need to do this from the root directory

```bash
npm start
```
