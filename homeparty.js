const Discord = require('discord.js');
const auth = require('./auth.json');
const map = require('./my.json');
const bot = new Discord.Client();
const fs = require('fs') ;

bot.login(auth.token);

bot.on('ready', () => {
    console.log('Ready!');
});

bot.on('voiceStateUpdate', (oldMember, newMember) => {
    const oldChannel = oldMember.channel;
    const newChannel = newMember.channel;
    if (oldChannel === null && newChannel !== null) {
        addRoleToUser(newMember);
        console.log("User " + newMember.id + " joined the channel " + newChannel.name);
    } else if (oldChannel !== null && newChannel === null) {
        removeRolefromUser(oldMember);
        console.log("User " + oldMember.id + " left the channel " + oldChannel.name);
    } else if (oldChannel !== null && newChannel !== null) {
        removeRolefromUser(oldMember);
        addRoleToUser(newMember);
        console.log("User " + newMember.id + " switched channels from " + oldChannel.name + " to " + newChannel.name);
        console.log(oldMember.id);
    }
});

function addRoleToUser(newMember) {
    newMember.guild.members.fetch(newMember.id)
        .then(member => {
            member.roles.add(map[newMember.channelID].toString());
        })
        .catch(log);
}

function removeRolefromUser(oldMember) {
    oldMember.guild.members.fetch(oldMember.id)
        .then(member => {
            member.roles.remove(map[oldMember.channelID].toString());
        })
        .catch(log);
}

function log(data) {
    fs.writeFile('homeparty.log', data + "\n", { flag: 'a' }, (err) => {
        if (err) throw err;
    }) ;
}