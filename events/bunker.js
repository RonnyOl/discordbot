import Armas from "../models/Armas.js";
import ArmasVenta from "../models/ArmasVenta.js";
import Info from "../models/Info.js";

export default function handleBunker(client, channelRegistroVentasId) {
    client.on("messageCreate", async (message) => {
        if (message.channel.id !== channelRegistroVentasId) return;
        if (message.author.bot) return;

        const [command, ...args] = message.content.trim().split(" ");

        if (command === "!venta" && args[0] && args[1] && args[2]) {
            const seriales = args[0].split(",");
            const banda = args[1].trim();
            const total = parseInt(args[args.length - 1]);
            console.log(`Seriales: ${seriales}, Banda: ${banda}, Total: ${total}`);
            if (isNaN(total)) {
                return message.reply("❌ El valor total ingresado no es un número válido.");
            }

            let vendidos = [];
            let noEncontrados = [];

            for (const serial of seriales) {
                const serialTrimmed = serial.trim();
                const armaVenta = await ArmasVenta.findOne({ serial: serialTrimmed });

                if (!armaVenta) {
                    noEncontrados.push(serialTrimmed);
                    continue;
                }

                armaVenta.isSold = true;
                await armaVenta.save();
                vendidos.push(serialTrimmed);
            }

            await Info.findOneAndUpdate({}, { $inc: { totalDineroVendido: total } });

            let replyMessage = `\`\`\`\n`;
            replyMessage += `########### VENTA REGISTRADA ###########\n\n`;
            replyMessage += `🔫 Banda: ${banda}\n`;
            replyMessage += `💰 Total: $${total.toLocaleString()}\n`;
            replyMessage += `📦 Seriales vendidos (${vendidos.length}):\n`;
            replyMessage += `- ${vendidos.join("\n- ")}\n`;

            if (noEncontrados.length > 0) {
                replyMessage += `\n❌ Seriales no encontrados (${noEncontrados.length}):\n`;
                replyMessage += `- ${noEncontrados.join("\n- ")}\n`;
            }

            replyMessage += `\n########################################\n`;
            replyMessage += `\`\`\``;

            await message.channel.send(replyMessage);

        } else {
            message.reply("❌ No se ha proporcionado suficiente información. Usa:\n`!venta <serial1,serial2,...> <banda> <total>`");
        }
    });
}
