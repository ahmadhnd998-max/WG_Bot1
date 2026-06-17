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

const {
    Client,
    GatewayIntentBits,
    ActivityType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});


// 📌 CHANNELS
const CHANNELS = [
    '1513464359999897721',
    '1354726620354838568',
    '1354726922470559765',
    '1354727010567589978',
    '1354727740515024927',
    '1354727842667167867'
];


// 👑 ADMINS
const ADMIN_IDS = [
    "1516018598383190109",
    "562600119447453706"
];

function isAdmin(id) {
    return ADMIN_IDS.includes(id);
}


// 🌙 SLEEP ON
async function sleepOn() {
    for (const id of CHANNELS) {
        const channel = await client.channels.fetch(id).catch(() => null);
        if (!channel) continue;

        await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
            AttachFiles: false
        });
    }
}


// ☀️ SLEEP OFF
async function sleepOff() {
    for (const id of CHANNELS) {
        const channel = await client.channels.fetch(id).catch(() => null);
        if (!channel) continue;

        await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
            AttachFiles: true
        });
    }
}


// 💬 MAIN
client.on('messageCreate', async message => {

    if (message.author.bot) return;
    if (!isAdmin(message.author.id)) return;

    const cmd = message.content.toLowerCase();

    // 🌙 ON
    if (cmd === '!sleep mode on') {
        await sleepOn();
        await message.delete().catch(() => {});
        return message.channel.send("🌙 تم تشغيل الوضع الليلي");
    }

    // ☀️ OFF
    if (cmd === '!sleep mode off') {
        await sleepOff();
        await message.delete().catch(() => {});
        return message.channel.send("☀️ تم إيقاف الوضع الليلي");
    }

    // 📤 SEND COMMAND
    if (cmd === '-send') {

        // ❌ DELETE COMMAND MESSAGE
        await message.delete().catch(() => {});

        const panel = new EmbedBuilder()
            .setTitle("🧠 لوحة التحكم")
            .setDescription("اضغط بدء الإرسال")
            .setColor(0x00AEFF);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('send_msg')
                .setLabel('بدء الإرسال')
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId('cancel_msg')
                .setLabel('إلغاء')
                .setStyle(ButtonStyle.Danger)
        );

        const panelMsg = await message.channel.send({
            embeds: [panel],
            components: [row]
        });

        const collector = panelMsg.createMessageComponentCollector({
            filter: i => isAdmin(i.user.id),
            time: 60000
        });

        collector.on('collect', async (i) => {

            // ❌ CANCEL
            if (i.customId === 'cancel_msg') {
                return i.update({
                    content: "❌ تم الإلغاء",
                    embeds: [],
                    components: []
                });
            }

            // 📤 START FLOW
            if (i.customId === 'send_msg') {

                await i.update({
                    content: "✍️ اكتب الرسالة الآن:",
                    embeds: [],
                    components: []
                });

                const msgCollector = message.channel.createMessageCollector({
                    filter: m => m.author.id === message.author.id,
                    max: 1,
                    time: 60000
                });

                msgCollector.on('collect', async (m1) => {

                    const content = m1.content;

                    // ❌ DELETE USER MESSAGE (message text)
                    await m1.delete().catch(() => {});

                    // 📍 ASK CHANNEL
                    const prompt = await message.channel.send("📍 أرسل ID القناة أو منشن القناة:");

                    const channelCollector = message.channel.createMessageCollector({
                        filter: m => m.author.id === message.author.id,
                        max: 1,
                        time: 60000
                    });

                    channelCollector.on('collect', async (m2) => {

                        const channelId = m2.content.replace(/[<#>]/g, '');
                        const channel = await client.channels.fetch(channelId).catch(() => null);

                        // ❌ DELETE USER ANSWER
                        await m2.delete().catch(() => {});

                        // ❌ DELETE BOT PROMPT
                        await prompt.delete().catch(() => {});

                        // ❌ DELETE PANEL
                        await panelMsg.delete().catch(() => {});

                        if (!channel) {
                            return message.channel.send("❌ قناة غير صالحة");
                        }

                        await channel.send(content);

                        const done = await message.channel.send("✅ تم الإرسال بنجاح");
                        setTimeout(() => done.delete().catch(() => {}), 3000);
                    });
                });
            }
        });
    }
});


// 🚀 READY
client.once('ready', () => {

    client.user.setPresence({
        status: 'idle',
        activities: [
            {
                name: 'WG_System',
                type: ActivityType.Watching
            }
        ]
    });

    console.log(`Logged in as ${client.user.tag}`);
});


// 🔑 LOGIN
client.login(process.env.TOKEN);
