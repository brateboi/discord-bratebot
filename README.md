# discord-bratebot
A simple discord bot written with Node.js and Discord API

## Description
This discord bot can play music in voice channels. Users can play songs with youtube links or search youtube using a query.
Using Google's TTS API, the bot can also read written text.

It uses Discord.js, FFMPEG and ytdl to play youtube videos


## Installation

It is assumed you have already created a discord bot on [Discord Application Portal](https://discord.com/developers/applications).
Create a bot and come back here.

### Currently only supports locally run server.

```bash
npm init
```

Dependencies:
```bash
npm install discord.js ffmpeg fluent-ffmpeg @discordjs/opus ytdl-core ffmpeg-static --save 
npm install --save ytsr dotenv
```

Add a .env file:
```env
PREFIX = <DESIRED-PREFIX> e.g. $
TOKEN = <YOUR-DISCORD-BOT-TOKEN>
```

run the bot
```bash
node index.js
```

## Usage
After you have run
```bash
node index.js
```
the bot should appear online in your server. Use play
```bash
$play https://www.youtube.com/watch?v=dQw4w9WgXcQ #plays this song from youtube
$skip #skips the current song
$stop #stops the music player and leaves the voice channel
$say good morning everyone
```

## Author
[brateboi](https://github.com/brateboi/)

