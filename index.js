require('dotenv').config();

const express = require('express');
const cron = require('node-cron');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const app = express();
app.get('/', (req, res) => res.send('Bot is running'));
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
// TEST CHANNEL (CHANGE THIS)
// =======================
const TEST_CHANNEL = '1354726452905508945';

let sleepModeEnabled = false;

// =======================
// SLEEP ON (TEST 07:30)
// =======================
async function sleepOn() {

    sleepModeEnabled = true;

    const channel = await client.channels.fetch(TEST_CHANNEL).catch(() => null);
    if (!channel) return;

    await channel.permissionOverwrites.edit(
        channel.guild.roles.everyone,
        { AttachFiles: false }
    );

    await channel.send(
`🌒 تم بدء الوضع الليلي

❌ من هذا الوقت حتى الساعة 10 لن يكون أي عضو قادرًا على إرسال الوسائط (صور، فيديو، ملفات...) و الروابط في المجموعة وسيتم حذف المشاركات تلقائيًا من قبل البوت.

⚠️ الوقت بنظام 24 ساعة وليس 12 ساعة`
    );
}

// =======================
// SLEEP OFF (TEST 07:35)
// =======================
async function sleepOff() {

    sleepModeEnabled = false;

    const channel = await client.channels.fetch(TEST_CHANNEL).catch(() => null);
    if (!channel) return;

    await channel.permissionOverwrites.edit(
        channel.guild.roles.everyone,
        { AttachFiles: true }
    );

    await channel.send(
`🌒 تم انتهاء وقت الوضع الليلي

✅ من الآن فصاعدًا يستطيع الأعضاء إرسال الوسائط (صور، فيديو، ملفات...) و الروابط في المجموعة من جديد.`
    );
}

// =======================
// TEST SCHEDULE (NETHERLANDS TIME)
// =======================

// 07:30 test ON
cron.schedule('35 7 * * *', async () => {
    console.log('TEST ON');
    await sleepOn();
}, {
    timezone: 'Europe/Amsterdam'
});

// 07:35 test OFF
cron.schedule('40 7 * * *', async () => {
    console.log('TEST OFF');
    await sleepOff();
}, {
    timezone: 'Europe/Amsterdam'
});

// =======================
// READY
// =======================
client.once('ready', () => {
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

    console.log('Test scheduler running...');
});

// =======================
// LOGIN
// =======================
client.login(process.env.TOKEN);
