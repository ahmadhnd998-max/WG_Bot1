require('dotenv').config();

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});


// 📌 CHANNELS YOU WANT TO CONTROL
const CHANNELS = [
    '1513464359999897721',
    '1354726620354838568',
    '1354726922470559765',
    '1354727010567589978',
    '1354727740515024927',
    '1354727842667167867'
];


// 👑 OPTIONAL: ADMIN IDS (only these can use commands)
const ADMIN_IDS = [
    "1516018598383190109",
    "562600119447453706"
];


// 🔐 CHECK ADMIN
function isAdmin(userId) {
    return ADMIN_IDS.includes(userId);
}


// 🌙 SLEEP MODE ON (disable attachments)
async function sleepOn() {
    for (const id of CHANNELS) {
        const channel = await client.channels.fetch(id);

        if (!channel) continue;

        await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
            AttachFiles: false
        });

        console.log(`🔒 Sleep ON in ${channel.name}`);
    }
}


// ☀️ SLEEP MODE OFF (enable attachments)
async function sleepOff() {
    for (const id of CHANNELS) {
        const channel = await client.channels.fetch(id);

        if (!channel) continue;

        await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
            AttachFiles: true
        });

        console.log(`🔓 Sleep OFF in ${channel.name}`);
    }
}


// 💬 MESSAGE COMMANDS
client.on('messageCreate', async message => {

    if (message.author.bot) return;

    // ❌ ADMIN CHECK
    if (!isAdmin(message.author.id)) return;

    const cmd = message.content.toLowerCase();

    // 🌙 SLEEP MODE ON
    if (cmd === '!sleep mode on') {
        await sleepOn();
        return message.reply("🌙 تم تشغيل الوضع الليلي لا يمكنك ارسال ملفات , صور , فيدوهات");
    }

    // ☀️ SLEEP MODE OFF
    if (cmd === '!sleep mode off') {
        await sleepOff();
        return message.reply("☀️ تم ايقاف الوضع الليلي و يمكنك ارسال ملفات , صور , فيدوهات");
    }
});


// 🚀 BOT START
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});


// 🔑 LOGIN
client.login(process.env.TOKEN);