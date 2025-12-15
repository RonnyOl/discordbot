// handleRuleta.js
import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} from "discord.js";
import { obtenerUsuario } from "../utils/blackjackUtils.js";
import Usuario from "../models/Usuario.js";

const COSTE_RULETA = 800;
function getRandomItemWithProbability(items) {
    const total = items.reduce((acc, item) => acc + item.probabilidad, 0);
    const rand = Math.random() * total;
    let sum = 0;
    for (const item of items) {
        sum += item.probabilidad;
        if (rand <= sum) return item;
    }
    return items[items.length - 1];
}

function getColorByRarity(rarity) {
    const colors = {
        basura: 0x808080,     // gris
        común: 0x00FF00,      // verde
        raro: 0x0099FF,       // azul
        épico: 0xAA00FF,      // violeta
        legendario: 0xFFD700, // dorado
    };
    return colors[rarity] || 0xFFFFFF; // blanco por defecto
}

const itemsWithImage = [
    {
        name: "Día de descanso",
        image: "https://i.imgur.com/lKO8BkJ.png",
        value: "¡Vas a poder descansar de un día de bunker y ser tageado para que te cuente el mismo! 🌞",
        probabilidad: 0.10,
        rarity: "común",
        precio: 1400
    },
    {
        name: "Pagar todas tus multas",
        image: "https://i.imgur.com/RXL8VjQ.png",
        value: "Se pagan todas tus multas que tengas en el momento (SOLO LAS MULTAS SE PAGAN) 🚓",
        probabilidad: 0.10,
        rarity: "raro",
        precio: 1600
    },
    {
        name: "Tuneo de vehículo (máx 100k)",
        image: "https://i.imgur.com/W35YD4V.png",
        value: "Obtenés un tuneo gratuito de hasta 100K 🚗✨",
        probabilidad: 0.05,
        rarity: "legendario",
        precio: 5950
    },
    {
        name: "25% de venta de bunker",
        image: "https://i.imgur.com/YCmgfKy.png",
        value: "Recibís el 25% de las ganancias de una venta de un bunker 💰",
        probabilidad: 0.05,
        rarity: "épico",
        precio: 6500
    },
    {
        name: "15K de pago",
        image: "https://i.imgur.com/VNHRTMd.png",
        value: "+15.000$ dolares pa ti 💵",
        probabilidad: 0.10,
        rarity: "raro",
        precio: 1800
    },
    {
        name: "Prioridad tiroteo",
        image: "https://i.imgur.com/GAu47in.png",
        value: "¡Prioridad para tiroteo! ✨",
        probabilidad: 0.10,
        rarity: "raro",
        precio: 2600
    },
    {
        name: "Nada",
        image: "https://i.imgur.com/Y6DXh3j.png",
        value: "Básicamente una puta mierda🤔",
        probabilidad: 0.50,
        rarity: "común",
        precio: 9999999
    },
];


export default function handleRuleta(client) {
    client.on("messageCreate", async (message) => {
        if (message.content == "!topPuntos") {
            const usuarios = await Usuario.find().sort({ puntos: -1 }).limit(15);
            let top = "**🏆 Top 15 Jugadores:**\n";
            usuarios.forEach((usuario, index) => {
                top += `**${index + 1}.** ${usuario.apodoBanda} - 💰 ${usuario.puntos} puntos\n`;
            });
            message.reply(top);
        }

        if (message.content == "!topActividad") {
            const usuarios = await Usuario.find().sort({ puntos: -1 }).limit(15);
            let top = "**🏆 Top 15 Jugadores con más actividad:**\n";
            usuarios.forEach((usuario, index) => {
                top += `**${index + 1}.** ${usuario.apodoBanda} - 💰 ${usuario.puntosAct} puntos\n`;
            });
            message.reply(top);
        }

        if (message.content === "!testProbabilidades") {
            let answer = "";
            for (let i = 0; i < 25; i++) {
                answer += getRandomItemWithProbability(itemsWithImage).value + "\n";
                console.log(answer)
            }
            await message.reply("Probabilidades calculadas:" + answer);
        }

        if (message.content === "!inventario") {
            let user = await Usuario.findOne({ userId: message.author.id }).populate('inventario');
            if (!user || user.inventario.length === 0) return message.reply("No tienes cartas en tu inventario.");

            let page = 0;
            const embed = new EmbedBuilder()
                .setTitle(`📦 Inventario de ${message.author.username}`)
                .setDescription(`**${user.inventario[page].nombre}**`)
                .setImage(user.inventario[page].image)
                .setColor(getColorByRarity(user.inventario[page].rarity))
                .setFooter({ text: `Carta ${page + 1} de ${user.inventario.length}` });

            const prevButton = new ButtonBuilder()
                .setCustomId("prev")
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true);

            const nextButton = new ButtonBuilder()
                .setCustomId("next")
                .setLabel("➡️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(user.inventario.length === 1);

            const row = new ActionRowBuilder().addComponents(prevButton, nextButton);

            const sent = await message.reply({ embeds: [embed], components: [row] });

            const collector = sent.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 2 * 60 * 1000,
            });

            collector.on("collect", async (i) => {
                if (i.user.id !== message.author.id) return i.reply({ content: "Estos botones no son para ti.", ephemeral: true });

                await i.deferUpdate();

                if (i.customId === "next") page++;
                if (i.customId === "prev") page--;

                // Actualizar botones
                prevButton.setDisabled(page === 0);
                nextButton.setDisabled(page === user.inventario.length - 1);

                // Actualizar embed
                const newEmbed = new EmbedBuilder()
                    .setTitle(`📦 Inventario de ${message.author.username}`)
                    .setDescription(`**${user.inventario[page].nombre}**`)
                    .setImage(user.inventario[page].image)
                    .setColor(getColorByRarity(user.inventario[page].rarity))
                    .setFooter({ text: `Carta ${page + 1} de ${user.inventario.length}` });

                await sent.edit({ embeds: [newEmbed], components: [new ActionRowBuilder().addComponents(prevButton, nextButton)] });
            });
        }

        // Mostrar inventario en lista de texto
        if (message.content === "!inventario list") {
            let user = await Usuario.findOne({ userId: message.author.id }).populate('inventario');
            if (!user || user.inventario.length === 0) return message.reply("No tienes cartas en tu inventario.");

            const items = user.inventario.map((carta, index) => `${index + 1}. ${carta.nombre}`);

            // Dividir en bloques de 1900 caracteres aprox
            const chunkSize = 50; // cartas por mensaje (ajustable)
            for (let i = 0; i < items.length; i += chunkSize) {
                const chunk = items.slice(i, i + chunkSize).join("\n");
                await message.channel.send(`📜 **Inventario de ${message.author.username}:**\n${chunk}`);
            }
        }

        if (message.content === "!tienda") {
            const TIEMPO_COLECCION = 2 * 60 * 1000; // 2 minutos
            let page = 0;

            // Si no hay cartas
            if (itemsWithImage.length === 0) {
                return message.reply("La tienda está vacía por ahora.");
            }

            const totalItems = itemsWithImage.length;
            const itemActual = itemsWithImage[page];
            // Crear embed inicial
            const embed = new EmbedBuilder()
                .setTitle("🛍️ Tienda de Cartas")
                .setDescription(`**${itemActual.name}**\n💰 Precio: ${itemActual.precio} monedas\n**${itemActual.value}`)
                .setImage(itemActual.image)
                .setColor(getColorByRarity ? getColorByRarity(itemActual.rarity) : 0x00AE86)
                .setFooter({ text: `Carta ${page + 1} de ${totalItems}` });

            // Botones
            const prevButton = new ButtonBuilder()
                .setCustomId("prev")
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true);

            const buyButton = new ButtonBuilder()
                .setCustomId("buy")
                .setLabel("💲Comprar")
                .setStyle(ButtonStyle.Success);

            const nextButton = new ButtonBuilder()
                .setCustomId("next")
                .setLabel("➡️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(totalItems === 1);

            const row = new ActionRowBuilder().addComponents(prevButton, buyButton, nextButton);

            // Enviar mensaje
            const sent = await message.reply({ embeds: [embed], components: [row] });

            const collector = sent.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: TIEMPO_COLECCION,
            });

            collector.on("collect", async (i) => {

                if (i.user.id !== message.author.id)
                    return i.reply({ content: "Estos botones no son para ti.", ephemeral: true });

                await i.deferUpdate();

                if (i.customId === "next") page++;
                if (i.customId === "prev") page--;

                if (i.customId === "buy") {
                    // Buscar o crear usuario
                    let user = await Usuario.findOne({ userId: i.user.id });
                    if (!user) {
                        user = await Usuario.create({ userId: i.user.id, puntos: 0, inventario: [] });
                    }

                    const item = itemsWithImage[page];
                    const precio = item.precio;

                    // Verificar fondos
                    if (user.puntos < precio) {
                        return i.followUp({
                            content: `❌ No tienes suficientes puntos. Te faltan ${precio - user.puntos} monedas.`,
                            ephemeral: true,
                        });
                    }

                    // Restar puntos y agregar al inventario
                    user.puntos -= precio;
                    user.inventario.push({
                        nombre: finalItem.name,
                        image: finalItem.image,
                        rarity: finalItem.rarity,
                        probabilidad: finalItem.probabilidad,
                        precio: finalItem.precio
                    });
                    await user.save();

                    return i.followUp({
                        content: `✅ Has comprado **${item.name}** por ${precio} monedas.`,
                        ephemeral: true,
                    });
                }

                // Actualizar botones y embed
                prevButton.setDisabled(page === 0);
                nextButton.setDisabled(page === totalItems - 1);

                const itemNuevo = itemsWithImage[page];
                const newEmbed = new EmbedBuilder()
                    .setTitle("🛍️ Tienda de Cartas")
                    .setDescription(`**${itemNuevo.name}**\n💰 Precio: ${itemNuevo.precio} monedas`)
                    .setImage(itemNuevo.image)
                    .setColor(getColorByRarity ? getColorByRarity(itemNuevo.rarity) : 0x00AE86)
                    .setFooter({ text: `Carta ${page + 1} de ${totalItems}` });

                await sent.edit({
                    embeds: [newEmbed],
                    components: [new ActionRowBuilder().addComponents(prevButton, buyButton, nextButton)],
                });
            });

            collector.on("end", () => {
                sent.edit({ components: [] }).catch(() => { });
            });
        }

        if (message.content.startsWith("!usarCarta")) {
            const [command, carta] = message.content.trim().split(" ");

            // Validar que haya puesto un número
            const index = parseInt(carta);
            if (isNaN(index)) {
                return message.reply("❌ Debes indicar el número de la carta a usar. Ejemplo: `!comprarCarta 5`");
            }

            let user = await Usuario.findOne({ userId: message.author.id });
            if (!user) return message.reply("❌ No se encontró tu usuario.");

            // Validar que el índice sea válido
            if (index < 1 || index > user.inventario.length) {
                return message.reply(`❌ No tienes una carta número ${index}.`);
            }

            // Eliminar la carta (los arrays comienzan en 0, por eso -1)
            const cartaEliminada = user.inventario.splice(index - 1, 1)[0];

            await user.save();

            const canalRegistrosCartas = await client.channels.fetch("1434233917057273917");

            if (canalRegistrosCartas?.isTextBased()) {
                canalRegistrosCartas.send(` ${user.apodoBanda} Ha usado la carta **${cartaEliminada.nombre}** por ${cartaEliminada.precio} puntos.`).catch(() => { });
            }
            message.reply(`✅ Has usado la carta **${cartaEliminada.nombre}** por ${cartaEliminada.precio} puntos.`);
        }


        if (message.author.bot || message.content !== "!rule") return;

        const spinBtn = new ButtonBuilder()
            .setCustomId("spin")
            .setLabel("🎰 Girar")
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(spinBtn);
        const baseEmbed = new EmbedBuilder()
            .setTitle("🎰 Ruleta")
            .setDescription("Pulsa **Girar** para probar tu suerte!");

        const sent = await message.reply({ embeds: [baseEmbed], components: [row] });

        const collector = sent.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 5 * 60 * 1000,
        });

        collector.on("collect", async (i) => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Estos botones no son para ti.", ephemeral: true });
            if (i.customId !== "spin") return;
            await i.deferUpdate();

            // Obtener usuario
            let user = await obtenerUsuario(message.author);

            // Check cooldown 24h
            // const now = new Date();
            // const cooldown = 24 * 60 * 60 * 1000; // 24 horas en ms
            if (user.puntos < COSTE_RULETA) {
                return message.reply("No tienes suficiente puntos. ¡ANDA A FARMEAR!");
            }

            // Deshabilitar botón mientras gira
            await sent.edit({
                components: [new ActionRowBuilder().addComponents(spinBtn.setDisabled(true))],
            });

            // Animación rápida (texto rotando)
            const steps = 5;
            for (let s = 0; s < steps; s++) {
                const randomItem = itemsWithImage[Math.floor(Math.random() * itemsWithImage.length)];
                await sent.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("🎰 Girando...")
                            .setDescription(`➡️ **${randomItem.name}**`)
                            .setImage(randomItem.image)
                            .setColor(getColorByRarity(randomItem.rarity))
                            .setFooter({ text: "Girando la ruleta..." }),
                    ],
                });
                await new Promise((r) => setTimeout(r, 1000));
            }

            // Resultado final
            const finalItem = getRandomItemWithProbability(itemsWithImage);
            if (finalItem.name !== "Nada") {
                user.inventario.push({
                    nombre: finalItem.name,
                    image: finalItem.image,
                    rarity: finalItem.rarity
                });
            }

            // Actualizar cooldown
            user.ultimoRuleta = new Date();
            user.puntos -= COSTE_RULETA;
            await user.save();
            const canalRegistrosCartas = await client.channels.fetch("1434233917057273917");

            if (canalRegistrosCartas?.isTextBased()) {
                canalRegistrosCartas.send(` ${user.apodoBanda} Ha tirado de la ruleta y ha obtenido **${finalItem.name}** .`).catch(() => { });
            }
            // Mostrar resultado
            await sent.edit({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🎉 Resultado")
                        .setDescription(`Te tocó: **${finalItem.name}**\n${finalItem.value}`)
                        .setImage(finalItem.image)
                        .setColor(getColorByRarity(finalItem.rarity))
                        .setFooter({ text: `Rareza: ${finalItem.rarity.toUpperCase()} | Pulsa Girar para intentarlo otra vez.` }),
                ],
                components: [new ActionRowBuilder().addComponents(spinBtn.setDisabled(false))],
            });

        });

    });
}