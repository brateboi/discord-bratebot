const Discord = require('discord.js');
const {
    prefix, token,
} = require('./config.json');
const ytdl = require('ytdl-core');
// const { queue } = require('async');

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

client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    // handle the message
    // const serverQueue = queue.get(message.guild.id);
    if (!message.member.roles.cache.some(role => role.name === 'Demi God of all')) return;

    if (message.content.startsWith(`${prefix}test`)) {
        message.channel.send("Test message successful");
    } else if (message.content.startsWith(`${prefix}play`)){
        
    } else if (message.content.startsWith(`${prefix}skip`)){

    } else if (message.content.startsWith(`${prefix}stop`)){
    
    } else {
        message.channel.send("Use valid commands!")
    }


})