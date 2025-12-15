import Usuario from "../models/Usuario.js";
import Armas from "../models/Armas.js";
import ArmasVenta from "../models/ArmasVenta.js";
import Info from "../models/Info.js";

const PUNTOS_BUNKER = 300;

export default function handleBunker(client, channelBunkerRegistry) {
    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;
        if (message.channel.id !== channelBunkerRegistry) return;

        // Dividir el mensaje
        const partes = message.content.trim().split(" ");
        const command = partes[0];
        const args = partes.slice(1).join(" "); // Todo lo que sigue al comando como texto

        if (command === "!bunker") {
            if (!args) {
                return message.reply("⚠️ Debes ingresar al menos un nombre. Ejemplo: `!bunker pac,ak,chino`");
            }

            // Dividir los nombres por coma
            const nombres = args.split(",").map(n => n.trim()).filter(n => n.length > 0);

            if (nombres.length === 0) {
                return message.reply("⚠️ No se detectaron nombres válidos.");
            }

            let resultados = [];

            for (const nombre of nombres) {
                // Buscar usuario por apodo o campo similar
                let user = await Usuario.findOne({
                    apodoBanda: { $regex: new RegExp(`^${nombre}$`, "i") }
                });


                if (!user) {
                    resultados.push(`❌ No se encontró el usuario **${nombre}**`);
                    continue;
                }
                user.puntos = Math.ceil((user.puntos || 0) + (PUNTOS_BUNKER / nombres.length));
                user.puntosAct = Math.ceil((user.puntosAct || 0) + (PUNTOS_BUNKER / nombres.length));
                user.farmeosBunker = (user.farmeosBunker || 0) + 1;
                await user.save();

                resultados.push(`✅ Se sumaron **${PUNTOS_BUNKER / nombres.length} puntos** a **${nombre}**`);
            }

            // Enviar resumen
            await message.reply(resultados.join("\n"));
        }

        // 👇 Tu otro comando de venta puede seguir acá sin problema
        // if (command === "!venta" && args[0] && args[1] && args[2]) {
        //     ...
        // }
    });
}
