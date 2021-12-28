require('dotenv').config();
const {
    prefix, token
} = {"prefix": process.env.PREFIX, "token": process.env.TOKEN};

const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const Discord = require('discord.js');

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
    if (!message.member.roles.cache.some(role => role.name === 'Demi God of all'  || role.name ==='AlexaLover')) return;

    const serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${prefix}test`)) {
        message.channel.send("Test message successful");
    } else if (message.content.startsWith(`${prefix}play`)){
        handleSearch(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}skip`)){
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}stop`)){
        stop(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}cleanup`)){
            clean(message);
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
        .play(ytdl(song.url, {filter: 'audioonly'})) // stream only audio
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

async function handleSearch(message, serverQueue) {
    if (message.content.startsWith(`${prefix}play https://www.youtube.com/watch?v=`)){
        execute(message, serverQueue);
    } else { // handle query parameter
        const query = message.content.substr(message.content.indexOf(' ')+1);
        console.log(query);

        const filterQuery = await ytsr.getFilters(query);
        const filterVideo = filterQuery.get('Type').get('Video');

        const results = await ytsr( filterVideo.url, {limit: 5});

        //display found results
        let reply = "Choose the song you want to play"
        reply = reply.concat("\`\`\`");
        let i = 0;
        results.items.forEach(element => {
            i++;
            reply = reply.concat(i + ": " + element.title + "\n");
        });
        reply = reply.concat("\`\`\`")

        filter = (reaction, user) => {
            return ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].includes(reaction.emoji.name) && user.id == message.author;
        };

        message.channel.send(reply)
            .then( msg => {
                msg.react("1️⃣").then(()=> msg.react("2️⃣")).then(()=> msg.react("3️⃣"))
                .then(()=> msg.react("4️⃣")).then(()=> msg.react("5️⃣"));
                
                msg.awaitReactions(filter, { max: 1, time: 10000, errors: ['time']})
                    .then(collected => {
                        const reaction = collected.first();
                        let url = ""
                        if (reaction.emoji.name === "1️⃣") {
                            url = results.items[0].url;
                        } else if (reaction.emoji.name === "2️⃣") {
                            url = results.items[1].url;
                        } else if (reaction.emoji.name === "3️⃣") {
                            url = results.items[2].url;
                        } else if (reaction.emoji.name === "4️⃣") {
                            url = results.items[3].url;
                        } else {
                            url = results.items[4].url;
                        }
                        message.content = `${prefix}play ${url}`;
                        execute(message, serverQueue);
                        // msg.delete();
                    }).catch(collected => {
                        console.log('no reaction');
                        // msg.delete();
                    })
            });
    }
}

async function clean(message) {
    const messages = await message.channel.messages.fetch({limit: 100});
    let i = 0;
    messages.forEach(msg => {
        if (msg.content.startsWith(`${prefix}`) || msg.author.bot) {
            i++;
            msg.delete();
        }
    });
    message.channel.send(`**Cleared** ${i} messages from bratebot`);
}