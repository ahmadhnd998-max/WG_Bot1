if (cmd === '-send') {

    const panel = new EmbedBuilder()
        .setTitle("🧠 لوحة التحكم بالإرسال")
        .setDescription("اختر العملية التي تريد تنفيذها 👇")
        .setColor(0x00AEFF)
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
            { name: "📤 إرسال رسالة", value: "ابدأ عملية إرسال رسالة إلى أي قناة", inline: false },
            { name: "⚠️ ملاحظة", value: "هذه اللوحة مخصصة للمشرفين فقط", inline: false }
        )
        .setFooter({ text: "WG_System Control Panel" });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('send_msg')
            .setLabel('بدء الإرسال')
            .setEmoji('📤')
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId('cancel_msg')
            .setLabel('إغلاق اللوحة')
            .setEmoji('❌')
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

    collector.on('collect', async i => {

        // ❌ CANCEL
        if (i.customId === 'cancel_msg') {
            return i.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("❌ تم إغلاق اللوحة")
                        .setColor(0xFF0000)
                ],
                components: []
            });
        }

        // 📤 SEND FLOW START
        if (i.customId === 'send_msg') {

            await i.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("✍️ الخطوة 1")
                        .setDescription("اكتب الرسالة الآن في الشات 👇")
                        .setColor(0xF1C40F)
                ],
                components: []
            });

            const msgCollector = message.channel.createMessageCollector({
                filter: m => m.author.id === message.author.id,
                max: 1,
                time: 60000
            });

            msgCollector.on('collect', async m1 => {

                const content = m1.content;
                await m1.delete().catch(() => {});

                await message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("📍 الخطوة 2")
                            .setDescription("الآن اذكر القناة أو أرسل ID الخاص بها")
                            .setColor(0x9B59B6)
                    ]
                });

                const channelCollector = message.channel.createMessageCollector({
                    filter: m => m.author.id === message.author.id,
                    max: 1,
                    time: 60000
                });

                channelCollector.on('collect', async m2 => {

                    const channelId = m2.content.replace(/[<#>]/g, '');
                    const channel = await client.channels.fetch(channelId).catch(() => null);

                    await m2.delete().catch(() => {});
                    await panelMsg.delete().catch(() => {});

                    if (!channel) {
                        return message.channel.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("❌ خطأ")
                                    .setDescription("القناة غير صالحة أو غير موجودة")
                                    .setColor(0xE74C3C)
                            ]
                        });
                    }

                    await channel.send(content);

                    message.channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("✅ تم الإرسال بنجاح")
                                .setDescription(`تم إرسال الرسالة إلى ${channel}`)
                                .setColor(0x2ECC71)
                        ]
                    });
                });
            });
        }
    });
}
