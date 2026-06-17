require('dotenv').config();

const express = require('express');
const cron = require('node-cron');
const {
Client,
GatewayIntentBits,
ActivityType
} = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// WEB SERVER
// =======================
app.get('/', (req, res) => {
res.send('Bot is running');
});

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});

// =======================
// DISCORD CLIENT
// =======================
const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
});

// =======================
// CHANNEL IDS
// =======================
const CHANNELS = [
'1513464359999897721',
'1354726620354838568',
'1354726922470559765',
'1354727010567589978',
'1354727740515024927',
'1354727842667167867'
];

// =======================
// SLEEP MODE STATE
// =======================
let sleepModeEnabled = false;

// =======================
// SLEEP MODE ON
// =======================
async function sleepOn() {

```
sleepModeEnabled = true;

console.log('Starting Sleep Mode...');

for (const channelId of CHANNELS) {

    try {

        const channel = await client.channels.fetch(channelId).catch(() => null);

        if (!channel) continue;

        await channel.permissionOverwrites.edit(
            channel.guild.roles.everyone,
            {
                AttachFiles: false
            }
        );

        await channel.send(
```

`🌒 تم بدء الوضع الليلي

❌ من هذا الوقت حتى الساعة 10 لن يكون أي عضو قادرًا على إرسال الوسائط (صور، فيديو، ملفات...) و الروابط في المجموعة وسيتم حذف المشاركات تلقائيًا من قبل البوت.

⚠️ الوقت بنظام 24 ساعة وليس 12 ساعة`
);

```
    } catch (error) {

        console.error(`Sleep ON Error (${channelId})`, error);

    }
}

console.log('Sleep Mode Enabled');
```

}

// =======================
// SLEEP MODE OFF
// =======================
async function sleepOff() {

```
sleepModeEnabled = false;

console.log('Stopping Sleep Mode...');

for (const channelId of CHANNELS) {

    try {

        const channel = await client.channels.fetch(channelId).catch(() => null);

        if (!channel) continue;

        await channel.permissionOverwrites.edit(
            channel.guild.roles.everyone,
            {
                AttachFiles: true
            }
        );

        await channel.send(
```

`🌒 تم انتهاء وقت الوضع الليلي

✅ من الآن فصاعدًا يستطيع الأعضاء إرسال الوسائط (صور، فيديو، ملفات...) و الروابط في المجموعة من جديد.`
);

```
    } catch (error) {

        console.error(`Sleep OFF Error (${channelId})`, error);

    }
}

console.log('Sleep Mode Disabled');
```

}

// =======================
// DELETE LINKS & FILES
// DURING SLEEP MODE
// =======================
client.on('messageCreate', async (message) => {

```
if (message.author.bot) return;

if (!sleepModeEnabled) return;

if (!CHANNELS.includes(message.channel.id)) return;

const hasAttachment = message.attachments.size > 0;

const hasLink =
    /(https?:\/\/[^\s]+)/i.test(message.content) ||
    /(discord\.gg\/[^\s]+)/i.test(message.content);

if (hasAttachment || hasLink) {
    await message.delete().catch(() => {});
}
```

});

// =======================
// BOT READY
// =======================
client.once('ready', () => {

```
console.log(`Logged in as ${client.user.tag}`);

client.user.setPresence({
    status: 'idle',
    activities: [
        {
            name: 'WG_System',
            type: ActivityType.Watching
        }
    ]
});

// Sleep Mode ON - 22:00 Netherlands Time
cron.schedule(
    '0 22 * * *',
    async () => {
        await sleepOn();
    },
    {
        timezone: 'Europe/Amsterdam'
    }
);

// Sleep Mode OFF - 10:00 Netherlands Time
cron.schedule(
    '0 10 * * *',
    async () => {
        await sleepOff();
    },
    {
        timezone: 'Europe/Amsterdam'
    }
);

console.log('Automatic Sleep Mode Scheduler Started');
```

});

// =======================
// LOGIN
// =======================
client.login(process.env.TOKEN);
