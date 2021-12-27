# discord-bratebot
A simple discord bot written with Node.js and Discord API

## Description
This discord bot can play music in voice channels. Users can play songs with youtube links or can add songs through the queue interface in the browser.

It uses Discord.js, FFMPEG and ytdl to play youtube videos

## Installation
Currently only supports locally run server.

Dependencies:
```bash
npm install discord.js ffmpeg fluent-ffmpeg @discordjs/opus ytdl-core ffmpeg-static --save 
```

Add a config.json:
```json
{
    "prefix": "DESIRED-PREFIX e.g. $",
    "token": "YOUR-DISCORD-BOT-TOKEN"
}
```

run the bot
```bash
node index.js
```
