# Midori
Brand spanking new Nano with 100% less shit code!

[Click here](https://discordapp.com/oauth2/authorize?client_id=212915056491495424&scope=bot) to add Midori to your Discord Server!

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
    "shake": "http://shake.kurisubrooks.com:3390",
    "discord": "", // Discord Bot Token
    "darksky": "", // DarkSky Weather API Key
    "google": {
        "search": "", // Google Search API Key
        "geocode": "" // Google Geolocation API Key
    }
}
```

### Run
To start Midori, you can start her with

```bash
npm run build
npm start
```

If you wish to run Midori under Production, you can start her with pm2 by using

```bash
npm run build
pm2 start bin/index.js --name "midori" --node-args="--harmony"
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

**Build**  
Run this command to compile Midori in `/bin`

```bash
npm run build
```

**Run**  
Run this command to start Midori.  
You'll need to do this from the root directory

```bash
npm start
```
