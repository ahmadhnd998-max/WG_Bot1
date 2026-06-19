require('dotenv').config();

const express = require('express');
const cron = require('node-cron');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

// =======================
// EXPRESS
// =======================
const app = express();

app.get('/', (req, res) => {
    res.send('Bot is running');
});

app.listen(process.env.PORT || 3000);

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
// CHANNEL
// =======================
const TEST_CHANNEL = '1354726452905508945';

let sleepModeEnabled = false;

// =======================
// SLEEP ON
// =======================
async function sleepOn() {

    sleepModeEnabled = true;

    const channel = await client.channels.fetch(TEST_CHANNEL).catch(() => null);

    if (!channel) {
        console.error('Channel not found');
        return;
    }

    await channel.permissionOverwrites.edit(
        channel.guild.roles.everyone,
        {
            AttachFiles: false
        }
    );

    await channel.send(
`\u200F🌒 تم بدء الوضع الليلي

❌ من هذا الوقت حتى الساعة 10 لن يكون أي عضو قادرًا على إرسال الوسائط (صور، فيديو، ملفات...) والروابط في المجموعة وسيتم حذف المشاركات تلقائيًا من قبل البوت

⚠️ الوقت بنظام 24 ساعة وليس 12 ساعة`
    );

    console.log('Sleep mode enabled');
}

// =======================
// SLEEP OFF
// =======================
async function sleepOff() {

    sleepModeEnabled = false;

    const channel = await client.channels.fetch(TEST_CHANNEL).catch(() => null);

    if (!channel) {
        console.error('Channel not found');
        return;
    }

    await channel.permissionOverwrites.edit(
        channel.guild.roles.everyone,
        {
            AttachFiles: true
        }
    );

    await channel.send(
`\u200F🌒 تم انتهاء وقت الوضع الليلي

✅ من الآن فصاعدًا يستطيع الأعضاء إرسال الوسائط (صور، فيديو، ملفات...) والروابط في المجموعة من جديد`
    );

    console.log('Sleep mode disabled');
}

// =======================
// SCHEDULE (NETHERLANDS TIME)
// =======================

// ON AT 21:00
cron.schedule(
    '0 22 * * *',
    async () => {
        console.log('🌒 تم بدء الوضع الليلي');
        await sleepOn();
    },
    {
        timezone: 'Europe/Amsterdam'
    }
);

// OFF AT 09:00
cron.schedule(
    '0 10 * * *',
    async () => {
        console.log('🌒 تم انتهاء وقت الوضع الليلي');
        await sleepOff();
    },
    {
        timezone: 'Europe/Amsterdam'
    }
);

// =======================
// READY
// =======================
client.once('clientReady', () => {

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

    console.log('Bot is running');
});

// =======================
// LOGIN
// =======================
client.login(process.env.TOKEN);
