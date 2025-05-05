import { obtenerUsuario } from "../utils/blackjackUtils.js";

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
        user = await obtenerUsuario({ id: userId });

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
        title: `📄 Perfil de ${user.apodo || message.author.username}`,
        thumbnail: {
          url: (message.mentions.users.first() || message.author).displayAvatarURL({ dynamic: true, size: 1024 })
        },
        fields: [
          { name: "🪪 ID", value: userId, inline: false },
          { name: "💰 Dinero", value: `**${user.balance.toLocaleString()}** monedas`, inline: true },
          { name: "🟢 Robos exitosos", value: `**${user.robosExitosos}** ✅`, inline: true },
          { name: "🔴 Robos fallidos", value: `**${user.robosFallidos}** ❌`, inline: true },
          {name: "💼 Apodo de banda", value: `**${user.apodoBanda || "N/A"}**`, inline: true },
          {name: "Robos realizados", value: `**${user.RobosHechos}**`, inline: true },
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
  });
}
