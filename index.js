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
    PermissionsBitField,
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


// 📌 CHANNELS YOU WANT TO CONTROL
const CHANNELS = [
    '1513464359999897721',
    '1354726620354838568',
    '1354726922470559765',
    '1354727010567589978',
    '1354727740515024927',
    '1354727842667167867'
];


// 👑 ADMIN IDS
const ADMIN_IDS = [
    "1516018598383190109",
    "562600119447453706"
];

function isAdmin(userId) {
    return ADMIN_IDS.includes(userId);
}


// 🌙 SLEEP MODE ON
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


// ☀️ SLEEP MODE OFF
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

    // 📤 SEND PANEL
    if (cmd === '-send') {

        const embed = new EmbedBuilder()
            .setTitle("📤 لوحة إرسال الرسائل")
            .setDescription("اضغط على الزر لبدء الإرسال")
            .setColor(0x2b2d31);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('send_msg')
                .setLabel('إرسال رسالة')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('cancel_msg')
                .setLabel('إلغاء')
                .setStyle(ButtonStyle.Danger)
        );

        const panelMsg = await message.channel.send({
            embeds: [embed],
            components: [row]
        });

        const filter = i => isAdmin(i.user.id);

        const collector = panelMsg.createMessageComponentCollector({
            filter,
            time: 60000
        });

        collector.on('collect', async i => {

            // ❌ CANCEL
            if (i.customId === 'cancel_msg') {
                await i.update({
                    content: "❌ تم الإلغاء",
                    embeds: [],
                    components: []
                });
                return;
            }

            // 📤 SEND FLOW
            if (i.customId === 'send_msg') {

                await i.update({
                    content: "✍️ اكتب الرسالة التي تريد إرسالها:",
                    embeds: [],
                    components: []
                });

                const msgFilter = m => m.author.id === message.author.id;

                const msgCollector = message.channel.createMessageCollector({
                    filter: msgFilter,
                    max: 1,
                    time: 60000
                });

                msgCollector.on('collect', async m1 => {

                    const content = m1.content;
                    await m1.delete().catch(() => {});

                    await message.channel.send("📍 قم بذكر القناة أو أرسل ID الخاص بها:");

                    const channelCollector = message.channel.createMessageCollector({
                        filter: msgFilter,
                        max: 1,
                        time: 60000
                    });

                    channelCollector.on('collect', async m2 => {

                        const channelId = m2.content.replace(/[<#>]/g, '');
                        const channel = await client.channels.fetch(channelId).catch(() => null);

                        await m2.delete().catch(() => {});
                        await panelMsg.delete().catch(() => {});

                        if (!channel) {
                            return message.channel.send("❌ قناة غير صالحة");
                        }

                        await channel.send(content);

                        const done = await message.channel.send("✅ تم إرسال الرسالة بنجاح");
                        setTimeout(() => done.delete().catch(() => {}), 3000);
                    });
                });
            }
        });
    }
});


// 🚀 BOT READY
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
