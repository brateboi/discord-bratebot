const Discord = require('discord.js');
const {
    prefix, token,
} = require('./config.json');
const ytdl = require('ytdl-core');


const client = new Discord.Client();
client.login(token);

client.once('ready', () => {
    console.log('Ready!');
});
client.once('reconnecting', () => {
    console.log('Reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnect!');
});

const queue = new Map();

client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    // only accept messages of people with appropriate permissions
    if (!message.member.roles.cache.some(role => role.name === 'Demi God of all')) return;

    const serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${prefix}test`)) {
        message.channel.send("Test message successful");
    } else if (message.content.startsWith(`${prefix}play`)){
        execute(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}skip`)){
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}stop`)){
        stop(message, serverQueue);
        return;
    } else {
        message.channel.send("Use valid commands!")
    }
})

async function execute(message, serverQueue) {
    const args = message.content.split(" ");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send("Join a voice channel to play music");

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
            "I need permissions to join and speak in your voice channel!"
        );
    }

    // get song info
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    };

    if (!serverQueue) {
        // Create contract for our queue
        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
        };
        // Setting the queue using our contract
        queue.set(message.guild.id, queueConstruct);
        // Pushing the song to our songs array
        queueConstruct.songs.push(song);

        try {
            // Try to join the voicechat and save connection
            var connection = await voiceChannel.join();
            queueConstruct.connection = connection;
            // Calling the play function to start a song
            play(message.guild, queueConstruct.songs[0]);
        } catch (err) {
            // Printing the error message if the bot fails to join the voicechat
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        // console.log(serverQueue.songs);
        return message.channel.send(`${song.title} has been added to the queue!`);
    }
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]) // recursive function call
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Playing: **${song.title}**`);
}

function skip(message, serverQueue) {
    if (!message.member.voice.channel) return message.channel.send("You must be in a voice channel to skip music");

    if (!serverQueue) return message.channel.send("No song to skip");
    
    serverQueue.connection.dispatcher.end();    
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel) return message.channel.send("You must be in a voice channel to stop music");
    if (!serverQueue) return message.channel.send("No song to stop");

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    const voiceChannel = message.member.voice.channel;
}


