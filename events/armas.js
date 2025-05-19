import Item from "../models/Item.js";
import Armas from "../models/Armas.js";
import ArmasVenta from "../models/ArmasVenta.js";

export default function handleArmas(client, channelWeaponId) {
  client.on("messageCreate", async (message) => {
    if (
      message.channel.id !== channelWeaponId &&
      message.channel.id !== "1371352922448990209"
    )
      return;

      if (message.author.bot) return;

    const [command, ...args] = message.content.trim().split(" ");

    // === !armas ===
    if (command === "!armas") {
      try {
        const items = await Item.find({ isWeapon: true });
        let inventario = "**📦 Inventario de Armas en el Depósito**\n";

        const grados = [
          { grado: "Grado 1", emoji: "🧪" },
          { grado: "Grado 2", emoji: "⚔️" },
          { grado: "Grado 3", emoji: "🛡️" },
        ];

        for (const { grado, emoji } of grados) {
          const armas = items
            .filter((item) => item.cantidad > 0 && item.type === grado)
            .map((item) => `• ${item.nombre} x${item.cantidad}`)
            .join("\n");

          inventario += `\n**${emoji} ${grado}:**\n`;
          inventario += armas
            ? `\`\`\`markdown\n${armas}\n\`\`\``
            : `_No hay armas de ${grado}_\n`;
        }

        await message.channel.send(inventario);
      } catch (err) {
        console.error("Error al obtener el inventario:", err);
      }
    }

    // === !serial list ===
    if (command === "!serial" && args[0] === "list") {
      const armas = await Armas.find({});
      let seriales = "**📦 Seriales de Armas en el Depósito**\n**📦 Lista de Armas:**\n\n";

      let armaAnterior = "";
      for (const arma of armas) {
        if (arma.nombre !== armaAnterior) {
          seriales += `\n🔫 **${arma.nombre}**:\n`;
          armaAnterior = arma.nombre;
        }
        seriales += `> 🔢 \`${arma.serial}\` | 📌 ${arma.isLost ? "🔴 Perdida" : "🟢 Disponible"}\n`;
      }

      await message.channel.send(seriales);
    }

    // === !serial add <nombre> <serial1,serial2,...> ===
    if (command === "!serial" && args[0] === "add") {
      const nombreArma = args.slice(1, -1).join(" ");
      const seriales = args[args.length - 1].split(",");

      for (const serial of seriales) {
        const serialTrim = serial.trim();
        const existe = await Armas.findOne({ serial: serialTrim });

        if (existe) {
          await message.channel.send(`⚠️ El serial ${serialTrim} ya existe. Saltando...`);
          continue;
        }

        const nuevaArma = new Armas({ nombre: nombreArma, serial: serialTrim, isLost: false });

        try {
          await nuevaArma.save();
          await message.channel.send(`✅ Añadida: ${nombreArma} con serial ${serialTrim}`);
        } catch (err) {
          console.error("Error al guardar arma:", err);
          await message.channel.send(`❌ Error al guardar el serial ${serialTrim}`);
        }
      }
    }

    // === !serial change <serial> ===
    if (command === "!serial" && args[0] === "change") {
      const serial = args[1]?.trim();
      if (!serial) return message.channel.send("❌ Debes especificar un serial.");

      const arma = await Armas.findOne({ serial });
      if (!arma) return message.channel.send(`❌ El serial ${serial} no existe.`);

      arma.isLost = !arma.isLost;

      try {
        await arma.save();
        await message.channel.send(
          `✅ Estado de ${arma.nombre} (${serial}) cambiado a ${arma.isLost ? "Perdida" : "Disponible"}`
        );
      } catch (err) {
        console.error("Error al actualizar arma:", err);
        await message.channel.send(`❌ Error al actualizar el serial ${serial}`);
      }
    }

    // === !bk help ===
    if (command === "!bkhelp") {
      return message.channel.send(
        "!bk add <nombre_arma> <serial1,serial2,...> - Añadir seriales al bunker\n" +
        "!bk change <serial> - Cambiar el estado de un serial (vendida/disponible)\n" +
        "!bk list - Listar seriales en el bunker"
      );
    }

     if (command === "!bk" && args[0] === "list" && (args[1] === "vendidas" || args[1] === "disponibles")) {
      
      const armas = await ArmasVenta.find({ isSold: args[1] === "vendidas" ? true : false }).sort({ nombre: 1 });
      let seriales = "**📦 Armas en el bunker**\n**📦 Lista de Armas:**\n\n";
      let armaAnterior = "";
      let armasVendidas= 0;
      let armasDisponibles= 0;
      for (const arma of armas) {
        if (arma.nombre !== armaAnterior) {
          seriales += `\n🔫 **${arma.nombre}**:\n`;
          armaAnterior = arma.nombre;
        }
        if (arma.isSold) {
          armasVendidas++;
        }else{
          armasDisponibles++;
        }
        seriales += `> 🔢 \`${arma.serial}\` | 📌 ${arma.isSold ? "🔴 Vendida" : "🟢 Disponible"}\n`;
      }
      if (args[1] === "vendidas"){
        seriales += `\n > **Armas Vendidas: ${armasVendidas}**\n `;
      }else{
        seriales += `\n > **Armas Disponibles: ${armasDisponibles}**\n `;
      }
      return message.channel.send(seriales);
    }
    // === !bk list ===
    if (command === "!bk" && args[0] === "list") {
     
      const armas = await ArmasVenta.find({}).sort({ nombre: 1 });
      let seriales = "**📦 Armas en el bunker**\n**📦 Lista de Armas:**\n\n";
      let ArmasVendidas= 0;
      let ArmasDisponibles= 0;
      let armaAnterior = "";
      for (const arma of armas) {
        if (arma.nombre !== armaAnterior) {
          seriales += `\n🔫 **${arma.nombre}**:\n`;
          armaAnterior = arma.nombre;
        }
        if (arma.isSold) {
          ArmasVendidas++;
        }else{
          ArmasDisponibles++;
        }
        seriales += `> 🔢 \`${arma.serial}\` | 📌 ${arma.isSold ? "🔴 Vendida" : "🟢 Disponible"}\n`;
      }
      seriales += `\n > **Armas Vendidas: ${ArmasVendidas}**\n > **Armas Disponibles: ${ArmasDisponibles}**\n Total: ${ArmasVendidas + ArmasDisponibles}`;
      return message.channel.send(seriales);
    }

    // === !bk add <nombre_arma> <serial1,serial2,...> ===
    if (command === "!bk" && args[0] === "add") {
      const nombreArma = args.slice(1, -1).join(" ");
      const seriales = args[args.length - 1].split(",");

      for (const serial of seriales) {
        const serialTrim = serial.trim();
        const existe = await ArmasVenta.findOne({ serial: serialTrim });

        if (existe) {
          await message.channel.send(`⚠️ El serial ${serialTrim} ya existe. Saltando...`);
          continue;
        }

        const nuevaArma = new ArmasVenta({
          nombre: nombreArma,
          serial: serialTrim,
          isSold: false,
        });

        try {
          await nuevaArma.save();
          await message.channel.send(`✅ Añadida: ${nombreArma} con serial ${serialTrim}`);
        } catch (err) {
          console.error("Error al guardar arma:", err);
          await message.channel.send(`❌ Error al guardar el serial ${serialTrim}`);
        }
      }
    }

    // === !bk change <serial> ===
    if (command === "!bk" && args[0] === "change") {
      const serial = args[1]?.trim();
      if (!serial) return message.channel.send("❌ Debes especificar un serial.");

      const arma = await ArmasVenta.findOne({ serial });
      if (!arma) return message.channel.send(`❌ El serial ${serial} no existe.`);

      arma.isSold = !arma.isSold;

      try {
        await arma.save();
        await message.channel.send(
          `✅ Estado de ${arma.nombre} (${serial}) cambiado a ${arma.isSold ? "Vendida" : "Disponible"}`
        );
      } catch (err) {
        console.error("Error al actualizar el arma:", err);
        await message.channel.send(`❌ Error al actualizar el serial ${serial}`);
      }
    }
  });
}
