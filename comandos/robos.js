import Robo from "../models/Robo.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { actualizarResumenRobos } from "../utils/robosUtils.js"; // Asegúrate de que la ruta sea correcta
import { obtenerUsuario } from "../utils/blackjackUtils.js";
import Usuario from "../models/Usuario.js";

export default async function robosComandos(client, channelRobosId, channelRobosRegistrosId) {
  client.on("messageCreate", async (message) => {

    if (message.content === "!robosReset") {
      const permitidos = [
        '291347070692884490',
        '601964081443897364',
        '768967601715019847',
        '753099059878953083',
        '414839572892221450'
      ];

      if (!permitidos.includes(message.author.id)) {
        return message.reply("🚫 No tienes permiso para usar este comando.");
      }

      // Reinicia robos globales
      await Robo.updateMany({}, { $set: { actual: 0, exitos: 0, fallos: 0 } });

      // Reinicia los robos en los usuarios
      await Usuario.updateMany({}, {
        $set: {
          robos: [],
          robosExitososPorSemana: 0,
          robosFallidosPorSemana: 0,
        }
      });

      await actualizarResumenRobos(client, channelRobosId);
      message.reply("✅ Todos los robos han sido reiniciados (incluye historial de usuarios).");
    }


    if (message.content === "!crearResumen") {
      if (message.channel.id !== channelRobosId) {
        return message.reply("❌ Este comando solo se puede usar en el canal de resumen.");
      }

      const robos = await Robo.find();

      if (robos.length === 0) {
        return message.reply("⚠️ No hay robos en la base de datos todavía.");
      }

      const categorias = {
        express: {
          titulo: "⚡ **Express**",
          lugares: ["Tiendas y Peluquerías", "Joyería", "Banco de Paleto", "Ammunation", "Jet privado", "Oficinas de Clinton"]
        },
        organizado: {
          titulo: "🧠 **Robo Organizado**",
          lugares: ["Ammunation", "Life Invader", "Casa de Michael", "Casa de Franklin", "Casa de Empeños", "Fábrica de Pollos", "Bancos Chicos", "Diamond Casino", "Banco Central"]
        },
        tiroteo: {
          titulo: "🔫 **Robo con tiroteo directo**",
          lugares: ["Yate", "Aduanas", "Laboratorios Humane"]
        }
      };

      let contenido = "📊 **Resumen de robos actualizados:**\n\n";

      for (const key in categorias) {
        const { titulo, lugares } = categorias[key];
        contenido += `${titulo}\n`;

        lugares.forEach(nombreLugar => {
          const robo = robos.find(r => r.nombre === nombreLugar);
          const actual = robo?.actual ?? 0;
          const max = robo?.max === Infinity ? "∞" : robo?.max ?? "?";

          contenido += `• **${nombreLugar}**: ${actual}/${max}\n`;
        });

        contenido += "\n";
      }

      const resumen = await message.channel.send({ content: contenido });
      message.reply(`✅ Resumen bonito creado.\n🆔 ID del mensaje: \`${resumen.id}\``);
    }

    if (message.content.startsWith("!actRobo")) {

      const args = message.content.trim().split(/\s+/);
      const operador = args[1];

      if (!["D", "F"].includes(operador)) {
        return message.reply("❌ Debes especificar `D` o `F` como segundo argumento.");
      }

      if (args.length < 3) {
        return message.reply("❌ Debes mencionar usuarios o escribir nombres separados por guiones.");
      }

      const resultados = [];

      // Procesar menciones
      for (const [id, user] of message.mentions.users) {
        const usuarioBD = await obtenerUsuario({ id: id, apodo: user.username });
        if (!usuarioBD) {
          resultados.push(`⚠️ No se encontró perfil para ${user.username}`);
          continue;
        }

        if (operador === "D") {
          usuarioBD.robosExitosos++;

        }
        if (operador === "F") usuarioBD.robosFallidos++;

        await usuarioBD.save();

        resultados.push(`✅ ${operador === "D" ? "Exito en" : "Fracaso en"} un robo a **${usuarioBD.apodo || user.username}**. Total: ❌${usuarioBD.robosFallidos} y ✅${usuarioBD.robosExitosos}`);
      }

      // Enviar log al canal de registros
      const canalRegistros = await client.channels.fetch(channelRobosRegistrosId);
      if (canalRegistros?.isTextBased()) {
        canalRegistros.send(`📋 **Actualización de robos realizada por <@${message.author.id}>**:\n` + resultados.join("\n")).catch(() => { });
      }
    }

    if (message.content === "!btnRobos") {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("robos_express")
          .setLabel("🚗 Express")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("robos_organizado")
          .setLabel("🧠 Organizado")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("robos_tiroteo")
          .setLabel("🔫 Tiroteo")
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId("robos_otros")
          .setLabel("💀 Otros")
          .setStyle(ButtonStyle.Secondary),
      );

      await message.channel.send({
        content: "**Selecciona el tipo de robo:**",
        components: [row]
      });
    }

    if (message.content === "!lstRobos") {
      const usuarios = await Usuario.find();

      if (!usuarios || usuarios.length === 0) {
        return message.reply("❌ No hay datos de robos todavía.");
      }

      const lista = usuarios
        .map(user => ({
          apodo: user.apodoBanda || "Sin nombre",
          exitosos: user.robosExitososPorSemana || 0,
          fallidos: user.robosFallidosPorSemana || 0,
          total: (user.robosFallidosPorSemana || 0) + (user.robosExitososPorSemana || 0)
        }))
        .filter(user => user.total > 0)
        .sort((a, b) => b.total - a.total);

      if (lista.length === 0) {
        return message.reply("❌ Nadie ha hecho robos aún.");
      }

      const descripcion = lista
        .map((u, i) =>
          `**${i + 1}. ${u.apodo}** — Total: ${u.total} —— | ✅ ${u.exitosos} | ❌ ${u.fallidos}`
        )
        .join("\n");

      const embed = {
        color: 0xffaa00,
        title: "📋 Lista de Robos por Usuario",
        description: descripcion,
        timestamp: new Date(),
        thumbnail: {
          url: "https://i.ibb.co/Xf4X5K9t/Captura-de-pantalla-2025-04-06-043811.png"
        },
        footer: { text: "Estadísticas de robo" }
      };

      message.channel.send({ embeds: [embed] });
    }

    if (message.content.startsWith("!updateRobo")) {

    }

    if (message.content.startsWith("!robos ")) {
      const mencionado = message.mentions.users.first();
      if (!mencionado) {
        return message.reply("❌ Debes mencionar a un usuario para ver su historial de robos.");
      }

      const usuario = await Usuario.findOne({ userId: mencionado.id });
      if (!usuario || usuario.robos.length === 0) {
        return message.reply("📭 Ese usuario no tiene robos registrados.");
      }

      const robosOrdenados = usuario.robos.sort((a, b) => b.fecha - a.fecha);

      const listaRobos = robosOrdenados
        .map(r => {
          const emoji = r.resultado === "éxito" ? "✅" : "❌";
          const fecha = new Date(r.fecha).toLocaleDateString("es-VE", { day: "2-digit", month: "short" });
          return `${emoji} **${r.robo}** (${fecha})`;
        })
        .slice(0, 20) // Muestra los últimos 20
        .join("\n");

      const embed = {
        color: 0x2f3136,
        title: `📋 Historial de robos de ${usuario.apodoBanda || mencionado.username}`,
        description: listaRobos,
        footer: {
          text: `${usuario.robos.length} robos en total | ✅ ${usuario.robosExitososPorSemana} - ❌ ${usuario.robosFallidosPorSemana}`
        },
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });
    }



  });


}


