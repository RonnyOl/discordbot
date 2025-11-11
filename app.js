import dotenv from "dotenv";
import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } from "discord.js";
import { conectarDB } from "./config/database.js";
import client from "./client/index.js";

import Usuario from "./models/Usuario.js";
import Robo from "./models/Robo.js";
import Item from "./models/Item.js";

import handleInventario from "./events/inventario.js";
import handleArmas from "./events/armas.js";
import handleLogs from "./events/logs.js";
import handleDinero from "./events/dinero.js";
import robosComandos from "./comandos/robos.js";
import blackjackComandos from "./comandos/blackjack.js";
import handleRobos from "./handlers/robos.js";
import handleBlackjack from "./handlers/blackjack.js";
import perfilComandos from "./comandos/perfil.js";
import casinoComandos from "./comandos/casino.js";
import handleBunker from "./events/bunker.js";
import armasComandos from "./comandos/armas.js";
import handleArmasBtn from "./handlers/armas.js";
import onReady from "./events/ready.js";
import handleRuleta from "./events/ruleta.js";
import juegosComandos from "./comandos/juegos.js";


// Cargar variables de entorno
dotenv.config();



// Variables de canal (puedes exportarlas de un archivo si quieres modularizar aún más)
const channelLogsID = "1326743374623019046";
const channelInventoryId = "1358333794993705080";
const channelWeaponId = "1358265394015637614";
const channelRegistroVentasId = "1371354216496631899";
const channelMoneyId = "1358272748132237312";
const channelRobosId = "1358309590751510578";
const channelRobosRegistrosId = "1358308861328756947";
const channelCasinoId = "1358346783637372981"
const channelJuegosId = "1358346783637372981"
const channelBunkerRegistry = "1371234472162496532"

// Conectar a la base de datos
await conectarDB();

// Inicializar eventos
onReady(client);
handleInventario(client, channelInventoryId);
handleArmas(client, channelWeaponId);
handleBunker(client, channelBunkerRegistry);
handleLogs(client, channelLogsID);
handleDinero(client, channelLogsID, channelMoneyId);
robosComandos(client, channelRobosId, channelRobosRegistrosId);
blackjackComandos(client, channelCasinoId)
perfilComandos(client, channelRobosId);
casinoComandos(client, channelCasinoId);
armasComandos(client);
handleRuleta(client);
juegosComandos(client, channelJuegosId);
// // Iniciar bot
client.login(process.env.TOKEN);



async function obtenerUsuario(user) {

  let usuario = await Usuario.findOne({ userId: user.id });

  if (!usuario) {
    usuario = new Usuario({
      userId: user.id,
      apodo: user.username,
      balance: 1000
    });
    await usuario.save();
  }

  return usuario;
}

let isRunning = false;

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!camion") {
    if (isRunning) {
      return message.channel.send("🚚 Ya hay un camión en camino.");
    }

    isRunning = true;
    loopCamion(message.channel);
  }

  if (message.content === "!parar") {
    isRunning = false;
    message.channel.send("🛑 El ciclo del camión fue detenido.");
  }
});

async function loopCamion(channel) {
  const gangRole = "<@&1326743368683753516>"; // ID del rol @gang

  while (isRunning) {
    const now = Math.floor(Date.now() / 1000); // tiempo actual en segundos
    const salida = now + (40 * 60); // 40 minutos más

    await channel.send(`🚛 Camión saldrá <t:${salida}:R> (<t:${salida}:t>)`);

    // Esperar hasta que falten 8 minutos (es decir, 32 minutos después del inicio)
    await sleep(32 * 60 * 1000);
    if (!isRunning) break;

    await channel.send(`⏳ Quedan 8 minutos para que salga el camión ${gangRole}`);

    // Esperar los últimos 8 minutos
    await sleep(8 * 60 * 1000);
    if (!isRunning) break;

    await channel.send(`✅ ¡Salió el camión! 🚚`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

client.on("messageCreate", async (message) => {
  if (message.content === "!8ball") {
    const respuesta = ["Sí", "No", "Tal vez", "Definitivamente", "No lo creo"];
    const randomIndex = Math.floor(Math.random() * respuesta.length);
    message.channel.send(respuesta[randomIndex]);
  }

  if (message.content.toLowerCase() === "!comandos") {
    const comandos = {
      "🚨 Robos": [
        ["!robos", "Iniciar un robo desde el menú interactivo | DEPRECATED |"],
        ["!robos @usuario", "Ver historial de robos de un usuario"],
        ["!lstRobos", "Ver ranking de robos por usuario"]
      ],
      "🎰 Casino": [
        ["!slots", "Jugar a las tragamonedas"],
        ["!ruleta", "Jugar a la ruleta rusa"],
        ["!cofre", "Abrir un cofre misterioso"],
        ["!blackjack", "Jugar al blackjack con botones"]
      ],
      "🏇 Apuestas y Juegos": [
        ["!carrera", "Iniciar una carrera de animales"],
        ["!apostar @animal", "Apostar por un animal en una carrera"],
        ["!pvp", "Retar a alguien a un duelo"]
      ],
      "💼 Economía": [
        ["!balance", "Ver tu balance actual de monedas"],
        ["!jugador @usuario", "Ver el perfil económico de otro jugador"],
        ["!giveMoney @usuario cantidad", "Enviar monedas a otro jugador"],
        ["!job", "Trabaja para ganar monedas (cada 1 min)"],
        ["!top", "Ver el top 10 de jugadores con más monedas"]
      ],
      "🛒 Tienda e Inventario": [
        ["!tienda", "Ver los objetos disponibles para comprar"],
        ["!comprar nombre_objeto", "Comprar un objeto de la tienda"],
        ["!inventario", "Ver las cartas que posees"],
        ["!rule", "Tirar de la ruleta de cartas"],
        ["!inventario list", "Ver la cartas en modo lista"]

      ],
      "🛠️ Uso Administrativo": [
        ["!give @usuario cantidad", "Dar monedas manualmente (admin)"],
        ["!remove @usuario cantidad", "Quitar monedas manualmente (admin)"],
        ["!giveMoneyAll", "Dar monedas a todos los usuarios (admin)"],
        ["!robosReset", "Reiniciar contadores de robos (admin)"]
      ]
    };

    let description = "**📋 Comandos disponibles**\n\n";

    for (const [categoria, lista] of Object.entries(comandos)) {
      description += `__${categoria}__\n`;
      for (const [comando, desc] of lista) {
        description += `• \`${comando}\` – ${desc}\n`;
      }
      description += `\n`;
    }

    const embed = {
      color: 0x00FF00,
      description
    };

    message.channel.send({ embeds: [embed] });
  }

  if (message.content.toLowerCase() === "vamos bot, haz lo tuyo") {
    message.channel.send({
      files: ["https://i.imgur.com/255CZF6.png"]  // Cambiá por la URL de tu imagen
    });
  }

  if (message.content.toLowerCase() === "holaaa") {
    message.channel.send("queridos streetbloods");
  }

  if (message.content.toLowerCase() === "si te gano en rol") {
    message.channel.send("También en ticket. 😈");
  }

  if (message.content.toLowerCase() === "si no te gano en rol") {
    message.channel.send("Te gano en ticket.");
  }

  if (message.content.toLowerCase() === "y donde está tobi?") {
    message.channel.send("Habbohoteleando.");
  }

  if (message.content.toLowerCase() === "donde está el trukitos?") {
    message.channel.send("Cazando paloma");
  }

});

client.on("interactionCreate", async (interaction) => {
  // ✅ MODAL SUBMIT
  if (interaction.isModalSubmit()) {
    if (
      interaction.customId.startsWith("modal_agregar_") ||
      interaction.customId.startsWith("modal_remover_") ||
      interaction.customId === "modal_cambiar_estado"
    ) {
      return handleArmasBtn(interaction, client);
    }

    return handleRobos(interaction, client); // si tienes otros modales
  }

  // ✅ BOTONES
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("bj_")) {
      return handleBlackjack(interaction);
    }

    if (
      interaction.customId.startsWith("robos_") ||
      interaction.customId.startsWith("robo_") ||
      interaction.customId.startsWith("secuestro_") ||
      interaction.customId.startsWith("participantes")
    ) {
      return handleRobos(interaction, client);
    }

    if (
      interaction.customId.startsWith("armas_") || // Mostrar botones de tipos
      interaction.customId.startsWith("agregar_") || // Botón tipo agregar
      interaction.customId.startsWith("remover_") || // Botón tipo remover
      interaction.customId === "armas_cambiar" // Botón cambiar estado
    ) {
      return handleArmasBtn(interaction, client);
    }
  }
});


const ruletasGlobales = new Map();

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("!Trule")) {
    const args = message.content.split(" ");
    const apuesta = parseInt(args[1]);
    if (isNaN(apuesta) || apuesta <= 0) return message.reply("❌ Apuesta inválida.");

    const usuario = await obtenerUsuario(message.author);
    if (usuario.balance < apuesta) return message.reply("❌ No tienes suficiente dinero.");

    usuario.balance -= apuesta;

    const opciones = [
      { label: "❌ Nada", multiplicador: 0, prob: 0.50 },
      { label: "0.5x Dinero", multiplicador: 0.5, prob: 0.25 },
      { label: "1x Dinero", multiplicador: 1, prob: 0.12 },
      { label: "2x Dinero", multiplicador: 2, prob: 0.07 },
      { label: "5x Dinero", multiplicador: 5, prob: 0.04 },
      { label: "10x Dinero", multiplicador: 10, prob: 0.015 },
      { label: "💎 25x Dinero", multiplicador: 25, prob: 0.005 }
    ];

    const elegirConProbabilidad = (opciones) => {
      const rand = Math.random();
      let acumulado = 0;
      for (const op of opciones) {
        acumulado += op.prob;
        if (rand < acumulado) return op;
      }
      return opciones[0]; // fallback a "Nada"
    };

    let mensaje = await message.reply("🎰 Girando la ruleta...");

    for (let i = 0; i < 5; i++) {
      const random = opciones[Math.floor(Math.random() * opciones.length)];
      await mensaje.edit(`🎯 Posible resultado: **${random.label}**`);
      await new Promise(r => setTimeout(r, 500));
    }

    const resultado = elegirConProbabilidad(opciones);
    const ganancia = Math.floor(apuesta * resultado.multiplicador);

    usuario.balance += ganancia;
    await usuario.save();

    return mensaje.edit(`🎯 Resultado final: **${resultado.label}**
💰 Ganancia: **${ganancia}** monedas`);
  }

  // 🎯 Ruleta Multijugador
  if (message.content.startsWith("!ruletaCrear")) {
    const args = message.content.split(" ");
    const apuesta = parseInt(args[1]);
    if (isNaN(apuesta) || apuesta <= 0) return message.reply("❌ Apuesta inválida.");

    if (ruletasGlobales.has(message.channel.id)) return message.reply("❌ Ya hay una ruleta activa.");

    ruletasGlobales.set(message.channel.id, {
      apuesta,
      jugadores: [message.author.id]
    });

    return message.reply(
      `🎉 Ruleta creada por <@${message.author.id}> con apuesta de **${apuesta}** monedas.
Escribe \`!ruletaUnirse\` para participar.`
    );
  }

  if (message.content === "!ruletaUnirse") {
    const ruleta = ruletasGlobales.get(message.channel.id);
    if (!ruleta) return message.reply("❌ No hay una ruleta activa en este canal.");
    if (ruleta.jugadores.includes(message.author.id)) return message.reply("❌ Ya estás unido.");

    const usuario = await obtenerUsuario(message.author);
    if (usuario.balance < ruleta.apuesta) return message.reply("❌ No tienes suficiente dinero.");

    ruleta.jugadores.push(message.author.id);
    return message.reply(`✅ <@${message.author.id}> se unió a la ruleta.`);
  }

  if (message.content === "!ruletaIniciar") {
    const ruleta = ruletasGlobales.get(message.channel.id);
    if (!ruleta) return message.reply("❌ No hay una ruleta activa.");
    if (ruleta.jugadores.length < 2) return message.reply("❌ Necesitas al menos 2 jugadores.");

    ruletasGlobales.delete(message.channel.id);

    // Descontar monedas a todos
    for (const id of ruleta.jugadores) {
      const usuario = await obtenerUsuario({ id });
      usuario.balance -= ruleta.apuesta;
      await usuario.save();
    }

    let mensaje = await message.reply("🎡 Iniciando ruleta entre jugadores...");
    for (let i = 0; i < 5; i++) {
      const random = ruleta.jugadores[Math.floor(Math.random() * ruleta.jugadores.length)];
      await mensaje.edit(`🎯 Posible ganador: <@${random}>`);
      await new Promise(r => setTimeout(r, 500));
    }

    const ganadorId = ruleta.jugadores[Math.floor(Math.random() * ruleta.jugadores.length)];
    const pozo = ruleta.apuesta * ruleta.jugadores.length;

    const ganador = await obtenerUsuario({ id: ganadorId });
    ganador.balance += pozo;
    await ganador.save();

    return mensaje.edit(`🏆 El ganador es <@${ganadorId}> y se lleva **${pozo}** monedas.`);
  }
});


client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!moneda")) return;

  const args = message.content.trim().split(" ");
  const eleccion = args[1]?.toLowerCase();
  let apuesta = args[2] === "all" ? null : parseInt(args[2]);

  const usuario = await obtenerUsuario(message.author);

  if (!["cara", "cruz"].includes(eleccion)) {
    return message.reply("❌ Debes elegir entre `cara` o `cruz`.");
  }

  if (!apuesta || isNaN(apuesta)) apuesta = usuario.balance;
  if (apuesta <= 0 || apuesta > usuario.balance) {
    return message.reply("❌ Apuesta inválida o insuficiente.");
  }

  const resultado = Math.random() < 0.5 ? "cara" : "cruz";

  let mensaje = `🪙 La moneda cayó en: **${resultado}**.\n`;
  if (resultado === eleccion) {
    usuario.balance += apuesta;
    mensaje += `🎉 ¡Ganaste **${apuesta}** monedas!`;
  } else {
    usuario.balance -= apuesta;
    mensaje += `💀 Perdiste **${apuesta}** monedas.`;
  }

  await usuario.save();
  message.reply(`${mensaje}\n💰 Nuevo balance: **${usuario.balance}** monedas.`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!plinko")) return;

  const args = message.content.trim().split(/\s+/);
  const monto = parseInt(args[1]);

  if (isNaN(monto) || monto <= 0) {
    return message.reply("❌ Usa `!plinko cantidad`, ejemplo: `!plinko 100`.");
  }

  const usuario = await obtenerUsuario(message.author);

  if (usuario.balance < monto) {
    return message.reply("❌ No tienes suficiente dinero.");
  }

  // Simulación de caída por niveles
  const niveles = 6;
  let posicion = 0;

  for (let i = 0; i < niveles; i++) {
    posicion += Math.random() < 0.5 ? -1 : 1;
  }

  // Asegura que se mantenga dentro de los límites
  const max = 3;
  if (posicion > max) posicion = max;
  if (posicion < -max) posicion = -max;

  // Define los multiplicadores por posición final
  const multiplicadores = {
    "-3": 0,
    "-2": 0.5,
    "-1": 1,
    "0": 2,
    "1": 1,
    "2": 0.5,
    "3": 0
  };

  const multiplicador = multiplicadores[posicion.toString()];
  const ganancia = Math.floor(monto * multiplicador);

  // Actualiza balance
  usuario.balance = usuario.balance - monto + ganancia;
  await usuario.save();

  // Visual del camino (solo estético)
  const camino = [];
  let actual = 3; // posición central
  for (let i = 0; i < niveles; i++) {
    const paso = Math.random() < 0.5 ? -1 : 1;
    actual += paso;
    if (actual < 0) actual = 0;
    if (actual > 6) actual = 6;

    const linea = ["▫️", "▫️", "▫️", "🔸", "▫️", "▫️", "▫️"];
    linea[actual] = "🔴";
    camino.push(linea.join(""));
  }

  camino.push("💸   0x   0.5x   1x   2x   1x   0.5x   0x");

  // Mostrar resultados
  message.reply({
    content:
      `🟡 ¡Jugada de Plinko!\n\n` +
      camino.join("\n") +
      `\n\nGanancia: **${ganancia} monedas**\nNuevo balance: **${usuario.balance}** 💰`
  });
});


client.on("messageCreate", async (message) => {

  if (!message.content.startsWith("!guerra")) return;

  const args = message.content.split(" ");
  let apuesta = args[1] === "all" ? null : parseInt(args[1]);

  const usuario = await obtenerUsuario(message.author);

  if (!apuesta || isNaN(apuesta)) apuesta = usuario.balance;
  if (apuesta <= 0 || apuesta > usuario.balance) {
    return message.reply("❌ Apuesta inválida. Asegúrate de tener suficiente dinero.");
  }

  const cartaJugador = Math.floor(Math.random() * 13) + 2;
  const cartaBot = Math.floor(Math.random() * 13) + 2;

  let resultado = `🃏 Tú sacaste: **${cartaJugador}**\n🤖 El bot sacó: **${cartaBot}**\n`;
  if (cartaJugador > cartaBot) {
    usuario.balance += apuesta;
    resultado += `🎉 ¡Ganaste! Ganas **${apuesta}** monedas.`;
  } else if (cartaJugador < cartaBot) {
    usuario.balance -= apuesta;
    resultado += `💀 Perdiste **${apuesta}** monedas.`;
  } else {
    resultado += `⚖️ Empate. Tu balance queda igual.`;
  }

  await usuario.save();
  message.reply(`${resultado}\n💰 Nuevo balance: **${usuario.balance}** monedas.`);
});

const simularRuleta = async (message, finalNumero, finalColor) => {
  const secuencia = [];

  for (let i = 0; i < 10; i++) {
    const n = Math.floor(Math.random() * 37);
    const color = n === 0 ? "🟢" : (n % 2 === 0 ? "⚫" : "🔴");
    secuencia.push(`🎯 Girando... **${n}** ${color}`);
  }

  // Agrega el resultado final
  const colorFinalEmoji = finalColor === "rojo" ? "🔴" : finalColor === "negro" ? "⚫" : "🟢";
  secuencia.push(`🎯 ¡La ruleta se detuvo en **${finalNumero}** ${colorFinalEmoji}!`);

  // Enviar primer mensaje
  const msg = await message.reply(secuencia[0]);

  // Editar para simular animación
  for (let i = 1; i < secuencia.length; i++) {
    await new Promise(r => setTimeout(r, 400));
    await msg.edit(secuencia[i]);
  }

  return msg;
};

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!ruleta")) return;

  const args = message.content.split(" ");
  const tipoApuesta = args[1]?.toLowerCase();
  const usuario = await obtenerUsuario(message.author);

  let monto = args[2] === "all" ? usuario.balance : parseInt(args[2]);

  if (!tipoApuesta || isNaN(monto) || monto <= 0) {
    return message.reply("🎰 Usa `!ruleta [rojo|negro|par|impar|0-36] [monto]`, ejemplo: `!ruleta rojo 200`.");
  }

  if (usuario.balance < monto) {
    return message.reply("❌ No tienes suficiente dinero para hacer esa apuesta.");
  }

  const numeroGanador = Math.floor(Math.random() * 37);
  const rojo = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const esRojo = rojo.includes(numeroGanador);
  const color = numeroGanador === 0 ? "verde" : esRojo ? "rojo" : "negro";
  const esPar = numeroGanador !== 0 && numeroGanador % 2 === 0;

  let resultado = `🎯 La ruleta giró y cayó en **${numeroGanador} (${color})**\n`;
  let ganancia = 0;

  if (!isNaN(tipoApuesta)) {
    const num = parseInt(tipoApuesta);
    if (num === numeroGanador) {
      ganancia = monto * 35;
      resultado += `🎉 ¡Ganaste ${ganancia}! Apostaste al número exacto.`;
    } else {
      resultado += "❌ Perdiste. Ese no era el número.";
    }
  } else if (["rojo", "negro"].includes(tipoApuesta)) {
    if (tipoApuesta === color) {
      ganancia = monto * 2;
      resultado += `🎉 ¡Ganaste ${ganancia}! Apostaste a **${tipoApuesta}**.`;
    } else {
      resultado += `❌ Perdiste. Salió **${color}**.`;
    }
  } else if (tipoApuesta === "par") {
    if (esPar) {
      ganancia = monto * 2;
      resultado += `🎉 ¡Ganaste ${ganancia}! Salió un número par.`;
    } else {
      resultado += "❌ Perdiste. Salió impar.";
    }
  } else if (tipoApuesta === "impar") {
    if (!esPar && numeroGanador !== 0) {
      ganancia = monto * 2;
      resultado += `🎉 ¡Ganaste ${ganancia}! Salió un número impar.`;
    } else {
      resultado += "❌ Perdiste. Salió par o 0.";
    }
  } else {
    return message.reply("❌ Apuesta no válida. Usa rojo, negro, par, impar o un número entre 0 y 36.");
  }

  if (ganancia > 0) {
    usuario.balance += ganancia;
  } else {
    usuario.balance -= monto;
  }

  await simularRuleta(message, numeroGanador, color);
  await usuario.save();

  return message.reply(`${resultado}\n💰 Tu nuevo balance es: ${usuario.balance}`);
});


const cooldownPesca = new Map(); // Si prefieres, usa esto para evitar hacer lastFish en Mongo

client.on("messageCreate", async (message) => {
  if (message.content !== "!pescar") return;

  const usuario = await obtenerUsuario(message.author);
  const ahora = Date.now();

  if (usuario.lastFish && ahora - usuario.lastFish < 60_000) {
    const tiempoRestante = Math.ceil((60_000 - (ahora - usuario.lastFish)) / 1000);
    return message.reply(`⏳ ¡Debes esperar ${tiempoRestante}s para volver a pescar!`);
  }

  const pesca = Math.random();
  let resultado = "";
  let ganancia = 0;

  if (pesca < 0.4) {
    resultado = "🐚 No pescaste nada. ¡Qué mala suerte!";
  } else if (pesca < 0.75) {
    resultado = "🐟 Pescaste un pez común. (+100 monedas)";
    ganancia = 100;
  } else if (pesca < 0.95) {
    resultado = "🦑 ¡Pescaste algo raro! (+300 monedas)";
    ganancia = 300;
  } else {
    resultado = "🐉 ¡Increíble! Pescaste una criatura legendaria. (+1000 monedas)";
    ganancia = 1000;
  }

  usuario.balance += ganancia;
  usuario.lastFish = ahora;
  await usuario.save();

  return message.reply(`${resultado}\n💰 Tu nuevo balance es: **${usuario.balance}** monedas.`);
});

const cooldownCofre = new Map();

client.on("messageCreate", async (message) => {
  if (message.content === "!cofre") {
    const userId = message.author.id;
    const ahora = Date.now();

    const cooldown = cooldownCofre.get(userId);
    if (cooldown && ahora - cooldown < 60_000) { // 1 minuto
      const restante = Math.ceil((60_000 - (ahora - cooldown)) / 1000);
      return message.reply(`⏳ Espera ${restante} segundos para abrir otro cofre.`);
    }

    cooldownCofre.set(userId, ahora);

    const recompensas = [
      { nombre: "💩 Mierda", valor: 0, prob: 0.20 },
      { nombre: "🔫 9mm", valor: 100, prob: 0.15 },
      { nombre: "⚙️ TEC", valor: 300, prob: 0.10 },
      { nombre: "🧪 Metanfetamina", valor: 700, prob: 0.08 },
      { nombre: "💼 Dinero sucio", valor: 1500, prob: 0.06 },
      { nombre: "🔒 Contraseña del admin", valor: 3000, prob: 0.05 },
      { nombre: "🧠 Cerebro del Sammylart", valor: 5000, prob: 0.04 },
      { nombre: "🚁 Helicóptero blindado", valor: 7000, prob: 0.03 },
      { nombre: "🏰 Terreno en Roleplay City", valor: 10000, prob: 0.02 },
      { nombre: "🪙 Token ultra raro", valor: 20000, prob: 0.01 },
      { nombre: "🤖 ChatGPT del Sammylart", valor: 500, prob: 0.06 }
    ];

    const rand = Math.random();
    let acumulado = 0;
    let recompensa;

    for (const r of recompensas) {
      acumulado += r.prob;
      if (rand < acumulado) {
        recompensa = r;
        break;
      }
    }

    if (!recompensa) recompensa = { nombre: "Nada", valor: 0 }; // Fallback por si no entra en ningún rango

    const usuario = await obtenerUsuario(message.author);
    usuario.balance += recompensa.valor;
    await usuario.save();

    return message.reply(`🎁 Abriste un cofre y encontraste: **${recompensa.nombre}** (+$${recompensa.valor})`);
  }
});


const cooldownsHunt = new Map();

client.on("messageCreate", async (message) => {
  if (message.content !== "!cazarP") return;

  const usuario = await obtenerUsuario(message.author);
  const ahora = Date.now();
  const cooldown = 60_000; // 1 minuto

  const ultimoHunt = cooldownsHunt.get(message.author.id) || 0;
  const tiempoRestante = cooldown - (ahora - ultimoHunt);

  if (tiempoRestante > 0) {
    return message.reply(`⏳ ¡Debes esperar ${Math.ceil(tiempoRestante / 1000)}s para volver a cazar palomas!`);
  }

  // Palomas con probabilidad y recompensa
  const palomas = [
    { nombre: "Paloma común", emoji: "🕊️", prob: 0.3, recompensa: 200 },
    { nombre: "Paloma gris urbana", emoji: "🐦", prob: 0.2, recompensa: 350 },
    { nombre: "Paloma gorda", emoji: "🍗", prob: 0.15, recompensa: 500 },
    { nombre: "Paloma mensajera", emoji: "📩", prob: 0.1, recompensa: 800 },
    { nombre: "Paloma albina", emoji: "🕊️✨", prob: 0.07, recompensa: 1200 },
    { nombre: "Paloma acrobática", emoji: "🎯", prob: 0.06, recompensa: 1600 },
    { nombre: "Paloma sombría", emoji: "🌑", prob: 0.05, recompensa: 2000 },
    { nombre: "Paloma de fuego", emoji: "🔥🕊️", prob: 0.035, recompensa: 3000 },
    { nombre: "Paloma dorada", emoji: "💰🕊️", prob: 0.019, recompensa: 5000 },
    { nombre: "Paloma de Trukitos", emoji: "🧙‍♂️🕊️", prob: 0.001, recompensa: 20000 },
  ];

  // Elegir resultado
  const rand = Math.random();
  let acumulado = 0;
  let resultado = null;

  for (const paloma of palomas) {
    acumulado += paloma.prob;
    if (rand < acumulado) {
      resultado = paloma;
      break;
    }
  }

  if (!resultado) {
    resultado = { nombre: "Nada", emoji: "🌫️", recompensa: 0 };
  }

  usuario.balance += resultado.recompensa;
  await usuario.save();

  cooldownsHunt.set(message.author.id, ahora); // Guardar último uso

  return message.reply(
    `${resultado.emoji} ¡Cazaste una **${resultado.nombre}**!\n` +
    `💰 Recompensa: **${resultado.recompensa}** monedas\n` +
    `🧾 Tu nuevo balance es: **${usuario.balance}** monedas.`
  );
});



const pvpsPendientes = new Map(); // clave: ID del desafiado

function lanzarDados() {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
}

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("!slots")) {
    const args = message.content.split(" ");
    const apuesta = parseInt(args[1]);

    if (isNaN(apuesta) || apuesta <= 0) {
      return message.reply("❌ Debes apostar una cantidad válida.");
    }

    const usuario = await obtenerUsuario(message.author);
    if (usuario.balance < apuesta) {
      return message.reply("❌ No tienes suficiente dinero para esa apuesta.");
    }

    const armas = ['🔪', '🪓', '🗡️', '🔫', '💣', '⚔️', '🔨']; // Más variedad
    const grid = [];

    // Generar tablero 3x3
    for (let i = 0; i < 3; i++) {
      grid[i] = [];
      for (let j = 0; j < 3; j++) {
        grid[i][j] = armas[Math.floor(Math.random() * armas.length)];
      }
    }

    // Mostrar el tablero
    const display = grid.map(row => row.join(" | ")).join("\n");

    // Verificar líneas ganadoras (horizontales)
    let lineasGanadoras = 0;
    for (let i = 0; i < 3; i++) {
      if (grid[i][0] === grid[i][1] && grid[i][1] === grid[i][2]) {
        lineasGanadoras++;
      }
    }

    let mensaje = `🎰 **Slots de ${message.author.username}**\n\`\`\`\n${display}\n\`\`\`\n`;
    let ganancia = 0;

    if (lineasGanadoras === 3) {
      ganancia = apuesta * 5;
      usuario.balance += ganancia;
      mensaje += `🎉 ¡Triple línea! Ganaste **${ganancia}** monedas.\n`;
    } else if (lineasGanadoras === 2) {
      ganancia = apuesta * 3;
      usuario.balance += ganancia;
      mensaje += `🔥 ¡Dos líneas! Ganaste **${ganancia}** monedas.\n`;
    } else if (lineasGanadoras === 1) {
      ganancia = apuesta * 2;
      usuario.balance += ganancia;
      mensaje += `✅ ¡Una línea! Ganaste **${ganancia}** monedas.\n`;
    } else {
      usuario.balance -= apuesta;
      mensaje += `💸 No acertaste ninguna línea. Perdiste **${apuesta}** monedas.\n`;
    }

    mensaje += `💰 Balance: ${usuario.balance}`;
    await usuario.save();
    message.reply(mensaje);
  }
});


client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!pvp")) return;
  if (message.author.bot) return;

  const args = message.content.trim().split(/\s+/);
  const comando = args[1];

  // Aceptar duelo
  if (comando === "accept") {
    const partida = pvpsPendientes.get(message.author.id);
    if (!partida) return message.reply("❌ No tienes ningún reto pendiente.");

    const retador = await client.users.fetch(partida.retadorId);
    const desafiado = message.author;

    const usuario1 = await obtenerUsuario(retador);
    const usuario2 = await obtenerUsuario(desafiado);

    if (usuario2.balance < partida.monto) {
      return message.reply("❌ No tienes suficiente dinero para aceptar la apuesta.");
    }

    message.channel.send(`🎮 **${retador.username}** vs **${desafiado.username}** por **${partida.monto}** monedas\n🎲 ¡Que comience la pelea!`);

    const dadosRetador = lanzarDados();
    const dadosDesafiado = lanzarDados();

    let texto = `🕐 Tirando dados...\n`;

    const mostrarProgreso = async () => {
      const msg = await message.channel.send(texto);

      setTimeout(() => {
        texto += `\n🎲 **${retador.username}** tira: ${dadosRetador[0]}`;
        msg.edit(texto);
      }, 1000);

      setTimeout(() => {
        texto += `, ${dadosRetador[1]}`;
        msg.edit(texto);
      }, 2000);

      setTimeout(() => {
        texto += `, ${dadosRetador[2]}`;
        msg.edit(texto);
      }, 3000);

      setTimeout(() => {
        texto += `\n🎲 **${desafiado.username}** tira: ${dadosDesafiado[0]}`;
        msg.edit(texto);
      }, 4000);

      setTimeout(() => {
        texto += `, ${dadosDesafiado[1]}`;
        msg.edit(texto);
      }, 5000);

      setTimeout(() => {
        texto += `, ${dadosDesafiado[2]}`;
        msg.edit(texto);
      }, 6000);

      setTimeout(async () => {
        const totalRetador = dadosRetador.reduce((a, b) => a + b, 0);
        const totalDesafiado = dadosDesafiado.reduce((a, b) => a + b, 0);

        let resultado = `\n\n📊 **Resultado:**\n${retador.username}: ${totalRetador} pts\n${desafiado.username}: ${totalDesafiado} pts\n`;

        let ganador, perdedor;
        if (totalRetador > totalDesafiado) {
          resultado += `🏆 **${retador.username} gana el duelo!**`;
          ganador = usuario1;
          perdedor = usuario2;
        } else if (totalDesafiado > totalRetador) {
          resultado += `🏆 **${desafiado.username} gana el duelo!**`;
          ganador = usuario2;
          perdedor = usuario1;
        } else {
          resultado += `🤝 ¡Empate! No se gana ni pierde dinero.`;
          return msg.edit(texto + resultado);
        }

        ganador.balance += partida.monto;
        perdedor.balance -= partida.monto;

        await ganador.save();
        await perdedor.save();

        resultado += `\n💰 ${ganador.apodo} ahora tiene: ${ganador.balance} monedas.`;

        msg.edit(texto + resultado);
        pvpsPendientes.delete(message.author.id);
      }, 7000);
    };

    return mostrarProgreso();
  }

  // Crear reto: !pvp @usuario cantidad
  const mencionado = message.mentions.users.first();
  const monto = parseInt(args[2]);

  if (!mencionado) {
    return message.reply("❌ Debes mencionar a alguien para retarlo.");
  }

  if (isNaN(monto) || monto <= 0) {
    return message.reply("❌ Monto de apuesta inválido.");
  }

  if (mencionado.id === message.author.id) {
    return message.reply("❌ No puedes retarte a ti mismo.");
  }

  const usuarioRetador = await obtenerUsuario(message.author);
  if (usuarioRetador.balance < monto) {
    return message.reply("❌ No tienes suficiente dinero para esa apuesta.");
  }

  pvpsPendientes.set(mencionado.id, {
    retadorId: message.author.id,
    monto
  });

  message.channel.send(`⚔️ **${message.author.username}** ha retado a **${mencionado.username}** por **${monto}** monedas.\n👉 ${mencionado}, escribe \`!pvp accept\` para aceptar el duelo.`);
});


const animales = ["🐢", "🐇", "🐎", "🐖", "🐆", "🐘", "🐊"];
const carreras = new Map();

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!carrera")) return;
  const args = message.content.split(" ");
  const subcomando = args[1];

  // Crear carrera
  if (subcomando === "crear") {
    const apuesta = parseInt(args[2]);
    if (isNaN(apuesta) || apuesta <= 0) {
      return message.reply("❌ Apuesta inválida. Usa `!carrera crear <monto>`");
    }
    if (carreras.has(message.channel.id)) {
      return message.reply("❌ Ya hay una carrera activa en este canal.");
    }

    const carrera = {
      jugadores: [],
      apuesta,
      enCurso: false,
      timeout: null
    };

    carreras.set(message.channel.id, carrera);
    message.channel.send(`🏁 Carrera creada con apuesta de **${apuesta}** monedas. Usa \`!carrera unir\` para entrar.\n⏳ Tienes 1 minuto para unirte.`);

    carrera.timeout = setTimeout(async () => {
      if (carrera.jugadores.length === 0) {
        carreras.delete(message.channel.id);
        return message.channel.send("❌ Carrera cancelada. No hubo participantes.");
      }

      carrera.enCurso = true;
      message.channel.send("🚦 ¡La carrera ha comenzado!");
      const meta = 10;
      let msg = await message.channel.send(generarCarril(carrera.jugadores, meta));

      const intervalo = setInterval(async () => {
        carrera.jugadores.forEach(j => {
          j.progreso += Math.random() < 0.5 ? 1 : 0;
        });

        await msg.edit(generarCarril(carrera.jugadores, meta));

        const ganador = carrera.jugadores.find(j => j.progreso >= meta);
        if (ganador) {
          clearInterval(intervalo);

          const premio = carrera.apuesta * carrera.jugadores.length;
          const uGanador = await obtenerUsuario({ id: ganador.id });
          uGanador.balance += premio;
          await uGanador.save();

          carreras.delete(message.channel.id);
          return message.channel.send(`🏆 ¡${ganador.animal} ${ganador.nombre} ha ganado y se lleva **${premio}** monedas!`);
        }
      }, 2000);
    }, 60_000);
  }

  // Unirse a la carrera
  if (subcomando === "unir") {
    const carrera = carreras.get(message.channel.id);
    if (!carrera) return message.reply("❌ No hay carrera activa.");
    if (carrera.enCurso) return message.reply("❌ La carrera ya está en curso.");

    const usuario = await obtenerUsuario(message.author);
    if (!usuario || usuario.balance < carrera.apuesta) {
      return message.reply("❌ No tienes suficiente dinero.");
    }

    if (carrera.jugadores.find(j => j.id === message.author.id)) {
      return message.reply("❌ Ya estás en la carrera.");
    }

    usuario.balance -= carrera.apuesta;
    await usuario.save();

    carrera.jugadores.push({
      id: message.author.id,
      nombre: message.author.username,
      animal: animales[Math.floor(Math.random() * animales.length)],
      progreso: 0
    });

    return message.channel.send(`✅ ${message.author.username} se ha unido a la carrera.`);
  }
});


function generarCarril(jugadores, meta) {
  return jugadores
    .map(j => `${j.animal} ${j.nombre}:\n${"·".repeat(j.progreso)}🏁${" ".repeat(Math.max(0, meta - j.progreso))}`)
    .join("\n\n");
}

function generarCarrilCaballos(participantes, meta) {
  const carrilLargo = meta * 3; // 3 guiones por unidad
  return participantes.map(p => {
    const avance = "—".repeat(p.progreso * 3);
    const espacio = " ".repeat(carrilLargo - p.progreso * 3);
    return `${p.animal} |${avance}${p.animal}${espacio}| 🏁`;
  }).join("\n");
}


const caballos = ["🐎", "🐴", "🏇", "🦄"];
const enCarreraCaballos = new Set(); // Evitar carreras solapadas

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!carreraCaballos")) return;
  const args = message.content.split(" ");
  const eleccion = parseInt(args[1]);
  const apuesta = parseInt(args[2]);

  if (isNaN(eleccion) || isNaN(apuesta) || eleccion < 1 || eleccion > caballos.length || apuesta <= 0) {
    return message.reply("❌ Usa el comando correctamente: `!carreraCaballos <número de caballo> <apuesta>`");
  }

  if (enCarreraCaballos.has(message.author.id)) {
    return message.reply("❌ Ya estás viendo una carrera. Espera que termine.");
  }

  const usuario = await obtenerUsuario(message.author);
  if (!usuario || usuario.balance < apuesta) {
    return message.reply("❌ No tienes suficiente dinero.");
  }

  // Descontar apuesta
  usuario.balance -= apuesta;
  await usuario.save();

  enCarreraCaballos.add(message.author.id);

  const participantes = caballos.map((c) => ({
    animal: c,
    progreso: 0
  }));
  const meta = 10;
  let eleccionAnimal = participantes[eleccion - 1].animal;

  const intro = participantes.map((p, i) => `**${i + 1}.** ${p.animal}`).join("\n");
  let msg = await message.channel.send(`🏇 **¡Apuesta registrada!** Tú elegiste: **${eleccionAnimal}**\n\nLos caballos son:\n${intro}\n\nLa carrera comenzará en...`);

  // Cuenta regresiva
  for (let i = 3; i >= 1; i--) {
    await new Promise(r => setTimeout(r, 1000));
    await msg.edit(`🏇 La carrera comenzará en... **${i}**`);
  }

  await new Promise(r => setTimeout(r, 1000));
  await msg.edit("🚦 ¡Y arrancan!");

  let pista = await message.channel.send(generarCarrilCaballos(participantes, meta));

  const intervalo = setInterval(async () => {
    participantes.forEach(p => {
      p.progreso += Math.random() < 0.5 ? 1 : 0;
    });

    await pista.edit(generarCarrilCaballos(participantes, meta));

    const ganador = participantes.find(p => p.progreso >= meta);
    if (ganador) {
      clearInterval(intervalo);
      enCarreraCaballos.delete(message.author.id);

      if (ganador.animal === eleccionAnimal) {
        usuario.balance += apuesta * 2;
        await usuario.save();
        return message.channel.send(`🏆 ¡Ganó tu caballo ${ganador.animal}! Has ganado **${apuesta * 2}** monedas.`);
      } else {
        return message.channel.send(`❌ El caballo ganador fue ${ganador.animal}. ¡Suerte la próxima!`);
      }
    }
  }, 2000);
});


client.login(process.env.DISCORD_TOKEN);
