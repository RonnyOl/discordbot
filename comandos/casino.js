
import { obtenerUsuario } from "../utils/blackjackUtils.js";
import Usuario from "../models/Usuario.js";
const tienda = [
  // 🐾 Mascotas
  { categoria: "Mascota", nombre: "Bombardino Cocodrilo", precio: 2000000 },
  { categoria: "Mascota", nombre: "Golden Retriever", precio: 3232300 },
  { categoria: "Mascota", nombre: "Panda", precio: 503230 },
  { categoria: "Mascota", nombre: "Tigre", precio: 8032 },
  { categoria: "Mascota", nombre: "ñamy lar", precio: 666999 },

  // 🏠 Casas
  { categoria: "Casa", nombre: "Tierra", precio: 12350 },
  { categoria: "Casa", nombre: "Cartón", precio: 22350 },
  { categoria: "Casa", nombre: "Chapa", precio: 40230 },
  { categoria: "Casa", nombre: "Casa de Oro", precio: 123200 },
  { categoria: "Casa", nombre: "Mansión", precio: 202300 },

  // 🔫 Armas
  { categoria: "Arma", nombre: "Uzi", precio: 12300 },
  { categoria: "Arma", nombre: "Tec Pistol", precio: 25230 },
  { categoria: "Arma", nombre: "9mm", precio: 40230 },
  { categoria: "Arma", nombre: "AK-47", precio: 102300 },
  { categoria: "Arma", nombre: "Bate", precio: 202300 },

  { categoria: "ROL", nombre: "SIN PAGO SEMANAL", precio: 999999999999999 },
  { categoria: "ROL", nombre: "/gang", precio: 999999999999999 },
];

let penesDiablo = 0;

export default function casinoComandos(client, channelCasinoId) {
  client.on("messageCreate", async (message) => {
    if (message.channel.id !== channelCasinoId) return; // Solo escucha en el canal especificado

    if (message.content === "!balance") {
      const usuario = await obtenerUsuario(message.author);
      return message.reply(`👤 **${usuario.apodoBanda}**, tu balance actual es: 💰 **${usuario.balance}** monedas.`);
    }

    if (message.content.startsWith("!jugador")) {
      const mencionado = message.mentions.users.first();
      if (!mencionado) {
        return message.reply("❌ Debes mencionar a un usuario para ver su perfil.");
      }

      const usuario = await obtenerUsuario(mencionado);
      return message.reply(`📊 Perfil de **${usuario.apodo}**:\n💰 Balance: **${usuario.balance}** monedas.`);
    }

    if (message.content === "!giveMoneyAll") {
      const permitidos = ['291347070692884490'];
      if (!permitidos.includes(message.author.id)) {
        return message.reply("🚫 No tienes permiso para usar este comando.");
      }
      const usuarios = await Usuario.find();
      const cantidad = 10000000; // Cantidad a dar a cada usuario

      for (const usuario of usuarios) {
        usuario.balance += cantidad;
        await usuario.save();
      }

      return message.reply(`💰 Se han dado **${cantidad}** monedas a todos los usuarios.`);
    }

    if (message.content.startsWith("!giveMoney")) {

      const args = message.content.trim().split(/ +/);
      const usuarioMencionado = message.mentions.users.first();
      const cantidad = parseInt(args[2]);

      if (!usuarioMencionado || isNaN(cantidad) || cantidad <= 0) {
        return message.reply("❌ Uso: `!giveMoney @usuario cantidad` (la cantidad debe ser un número mayor a 0)");
      }

      if (usuarioMencionado.id === message.author.id) {
        return message.reply("❌ No puedes enviarte dinero a ti mismo.");
      }

      const remitente = await obtenerUsuario(message.author);
      const receptor = await obtenerUsuario({ id: usuarioMencionado.id });

      if (!remitente || !receptor) {
        return message.reply("❌ Error al obtener los datos de usuario.");
      }

      if (remitente.balance < cantidad) {
        return message.reply("❌ No tienes suficiente dinero para transferir.");
      }

      remitente.balance -= cantidad;
      receptor.balance += cantidad;

      await remitente.save();
      await receptor.save();

      return message.channel.send(`💸 <@${message.author.id}> le dio **${cantidad}** monedas a <@${usuarioMencionado.id}>.`);
    }

    if (message.content === "!gaysnow") {
      const usuario = await obtenerUsuario({ id: "601964081443897364" });

      usuario.balance += 1000000;
      await usuario.save();
      return message.reply("💰 Se le ha dado 1M a Gaysnow.");
    }

    if (message.content === "!alimentarDiablo") {
      penesDiablo++
      return message.reply(` Se le ha dado de comer al diablo 😈. Total de penes: ${penesDiablo}`);
    }

    if (message.content === "!job") {
      const usuario = await obtenerUsuario(message.author);
      const ahora = new Date();
      const unMinuto = 60 * 1000;

      if (usuario.ultimoTrabajo && ahora - usuario.ultimoTrabajo < unMinuto) {
        const tiempoRestante = unMinuto - (ahora - usuario.ultimoTrabajo);
        const segundos = Math.floor(tiempoRestante / 1000);
        return message.reply(`⏳ Debes esperar **${segundos}s** antes de volver a trabajar.`);
      }

      const recompensa = Math.floor(Math.random() * 401) + 100; // 100 a 500
      usuario.balance += recompensa;
      usuario.ultimoTrabajo = ahora;
      await usuario.save();

      const trabajos = [
        `🧹 Hiciste limpieza en una casa y ganaste 💰 ${recompensa} monedas.`,
        `💻 Programaste un bot y te pagaron 💰 ${recompensa}.`,
        `📦 Repartiste paquetes y te dieron 💰 ${recompensa}.`,
        `🍕 Repartiste pizzas y ganaste 💰 ${recompensa}.`,
        `🛠️ Arreglaste computadoras y te pagaron 💰 ${recompensa}.`
      ];

      const trabajoRandom = trabajos[Math.floor(Math.random() * trabajos.length)];

      return message.reply(trabajoRandom);
    }

    if (message.content == "!top") {
      const usuarios = await Usuario.find().sort({ balance: -1 }).limit(10);
      let top = "**🏆 Top 10 Jugadores:**\n";
      usuarios.forEach((usuario, index) => {
        top += `**${index + 1}.** ${usuario.apodoBanda} - 💰 ${usuario.balance} monedas\n`;
      });
      message.reply(top);
    }

    if (message.content === "!tiendaDEPRECATED") {
      let texto = "**🛍️ Tienda de Cartas:**\n";

      const categorias = ["Mascota", "Casa", "Arma", "ROL"];
      for (const cat of categorias) {
        texto += `\n🔹 **${cat}s:**\n`;
        tienda
          .filter(obj => obj.categoria === cat)
          .forEach(obj => {
            texto += `• ${obj.nombre} - 💰 ${obj.precio} monedas\n`;
          });
      }

      texto += `\nPara comprar usa: \`!comprar nombre_del_objeto\``;
      return message.reply(texto);
    }

    if (message.content.startsWith("!comprar")) {
      const args = message.content.trim().split(/\s+/);
      const nombre = args.slice(1).join(" ").toLowerCase();

      const objeto = tienda.find(obj => obj.nombre.toLowerCase() === nombre);
      if (!objeto) return message.reply("❌ Ese objeto no está en la tienda.");

      const usuario = await obtenerUsuario(message.author);

      if (usuario.balance < objeto.precio) {
        return message.reply("❌ No tienes suficiente dinero.");
      }

      usuario.balance -= objeto.precio;

      if (!usuario.inventario) usuario.inventario = [];
      usuario.inventario.push(objeto.nombre);

      await usuario.save();

      return message.reply(`✅ Compraste **${objeto.nombre}** por ${objeto.precio} monedas.`);
    }

    if (message.content === "!inventario") {
      const usuario = await obtenerUsuario(message.author);

      if (!usuario.inventario || usuario.inventario.length === 0) {
        return message.reply("📦 Tu inventario está vacío. ¡Compra algo en la tienda con `!tienda`!");
      }

      const conteo = {};
      for (const item of usuario.inventario) {
        conteo[item] = (conteo[item] || 0) + 1;
      }

      let texto = `**🎒 Inventario de ${message.author.username}:**\n\n`;
      for (const [nombre, cantidad] of Object.entries(conteo)) {
        texto += `• ${nombre} x${cantidad}\n`;
      }

      return message.reply(texto);
    }

    if (message.content.startsWith("!give") || message.content.startsWith("!remove")) {
      if (message.author.id !== "291347070692884490") {
        return message.reply("🚫 No tienes permiso para usar este comando.");
      }

      const args = message.content.trim().split(/ +/);
      const usuarioMencionado = message.mentions.users.first();
      const cantidad = parseInt(args[2]);

      if (!usuarioMencionado || isNaN(cantidad) || cantidad <= 0) {
        return message.reply("❌ Uso: `!give @usuario cantidad` o `!remove @usuario cantidad`");
      }

      const usuario = await obtenerUsuario({ id: usuarioMencionado.id });
      if (!usuario) {
        return message.reply("❌ Usuario no encontrado en la base de datos.");
      }

      if (message.content.startsWith("!give")) {
        usuario.balance += cantidad;
        await usuario.save();
        return message.channel.send(`✅ Le diste **${cantidad}** monedas a <@${usuarioMencionado.id}>. Nuevo balance: **${usuario.balance}**`);
      }

      if (message.content.startsWith("!remove")) {
        usuario.balance = Math.max(0, usuario.balance - cantidad); // evita negativo
        await usuario.save();
        return message.channel.send(`✅ Le quitaste **${cantidad}** monedas a <@${usuarioMencionado.id}>. Nuevo balance: **${usuario.balance}**`);
      }
    }


  })
}