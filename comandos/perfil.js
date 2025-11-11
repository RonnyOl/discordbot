
import Armas from "../models/Armas.js";
import Usuario from "../models/Usuario.js";
import { obtenerUsuario } from "../utils/blackjackUtils.js";
async function obtenerUsuarioBanda(user) {

  let usuario = await Usuario.findOne({
    apodoBanda: new RegExp(`^${user}$`, 'i')
  }).populate('armaAsignada');


  if (!usuario) {

    usuario = new Usuario({
      userId: user.id,
      apodo: user.username,
      balance: 1000,
    });
    await usuario.save();
  }
  return usuario;
}

const permitidos = [
  '291347070692884490',
  '601964081443897364',
  '768967601715019847',
  '753099059878953083',
  '414839572892221450'
];

export default function perfilComandos(client, channelRobosId, channelRobosRegistrosId) {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith("!perfil")) {
      let userId = message.author.id;
      let user = null;

      if (message.mentions.users.size > 0) {
        const mencion = message.mentions.users.first();
        userId = mencion.id;
        user = (await obtenerUsuario({ id: userId }));

        if (!user) {
          return message.reply(`❌ No se encontró el perfil de ${mencion.username}.`);
        }
      } else {
        user = await obtenerUsuario({ id: userId, apodo: message.author.username });

        if (!user) {
          return message.reply("❌ No se encontró tu perfil.");
        }
      }

      const embed = {
        color: 0x2f3136,
        title: `📄 Perfil de ${user.apodoBanda || message.author.username}`,
        thumbnail: {
          url: (message.mentions.users.first() || message.author).displayAvatarURL({ dynamic: true, size: 1024 })
        },
        fields: [
          { name: "🪪 ID", value: userId, inline: false },
          { name: "💰 Dinero", value: `**${user.balance.toLocaleString()}** monedas`, inline: true },
          { name: "🟢 Robos exitosos", value: `**${user.robosExitosos}** ✅`, inline: true },
          { name: "🔴 Robos fallidos", value: `**${user.robosFallidos}** ❌`, inline: true },
          { name: "💼 Apodo de banda", value: `**${user.apodoBanda || "N/A"}**`, inline: true },
          { name: "Robos realizados", value: `**${user.RobosHechos}**`, inline: true },
          { name: "🎯 Puntos", value: `**${user.puntos}**`, inline: true },
          { name: "Farmeos de bunkers ☠", value: `**${user.farmeosBunker}**`, inline: true },
        ],
        footer: {
          text: "💼 Información del perfil"
        },
        timestamp: new Date()
      };

      return message.channel.send({ embeds: [embed] });
    }

    if (message.content.startsWith("!setApodo")) {
      const args = message.content.split(" ");

      // Sin mención: se cambia su propio apodo
      if (args.length >= 2 && message.mentions.users.size === 0) {
        const nuevoApodo = args.slice(1).join(" ");
        const user = await obtenerUsuario({ id: message.author.id });

        if (!user) return message.reply("❌ No se encontró tu perfil.");

        user.apodoBanda = nuevoApodo;
        await user.save();

        return message.channel.send(`✅ Tu apodo de banda ahora es: **${nuevoApodo}**`);
      }

      // Con mención: cambiarle el apodo a otro (solo si está permitido)
      if (args.length >= 3 && message.mentions.users.size > 0) {
        if (!permitidos.includes(message.author.id)) {
          return message.reply("⛔ No tenés permiso para usar este comando con menciones.");
        }

        const mencionado = message.mentions.users.first();
        const indexMencion = args.findIndex((arg) => arg.includes("<@"));
        const nuevoApodo = args.slice(1, indexMencion).join(" ");

        if (!nuevoApodo || !mencionado) {
          return message.reply("❌ Uso correcto: `!setApodo Beretta @usuario`");
        }

        const user = await obtenerUsuario({ id: mencionado.id });

        if (!user) return message.reply("❌ No se encontró el perfil del usuario mencionado.");

        user.apodoBanda = nuevoApodo;
        await user.save();

        return message.channel.send(`✅ Apodo de banda de **${mencionado.username}** actualizado a: **${nuevoApodo}**`);
      }

      // Si no encaja con ningún formato
      return message.reply("❌ Uso incorrecto. Ejemplos:\n- `!setApodo Beretta`\n- `!setApodo Beretta @usuario`");
    }

    if (message.content.startsWith("!setArma")) {
      const args = message.content.split(" ");

      if (args.length < 3) {
        return message.reply("❌ Uso correcto: `!setArma ApodoBanda SERIAL1234`");
      }

      const apodo = args[1];
      const serial = args[2];
      // Buscar usuario por apodoBanda
      const user = await obtenerUsuarioBanda(apodo);

      if (!user) {
        return message.reply("❌ No se encontró un usuario con ese apodo.");
      }

      // Buscar arma por serial
      const arma = await Armas.findOne({ serial });

      if (!arma) {
        return message.reply("❌ No se encontró un arma con ese serial.");
      }

      // Asignar el arma al usuario
      user.armaAsignada = arma;
      console.log(user.armaAsignada);
      await user.save();

      return message.channel.send(`✅ El arma **${arma.nombre}** con serial **${serial}** fue asignada a **${apodo}**`);
    }

  });
}
