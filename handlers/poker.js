import { partidasPoker, evaluarMano, mostrarMano } from "../utils/pokerUtils.js";
import { obtenerUsuario } from "../utils/blackjackUtils.js";

export default async function handlePoker(interaction) {
  const partida = partidasPoker.get(interaction.user.id);

  if (!partida || partida.terminado) {
    return interaction.reply({
      content: "❌ No tienes una partida activa.",
      ephemeral: true
    }).catch(() => {});
  }

  if (interaction.customId !== "poker_revelar") return;

  partida.terminado = true;
  partidasPoker.delete(partida.jugador1); // Borra por el iniciador

  const usuario1 = await obtenerUsuario({ id: partida.jugador1 });
  let resultadoTexto = "";

  // Partida contra el BOT
  if (!partida.jugador2) {
    const cartasJugador = partida.mano1;
    const cartasBot = partida.mano2;

    const resultadoJugador = evaluarMano(cartasJugador);
    const resultadoBot = evaluarMano(cartasBot);

    resultadoTexto += `🃏 Tu mano: ${mostrarMano(cartasJugador)} (${resultadoJugador.nombre})\n🤖 Mano del bot: ${mostrarMano(cartasBot)} (${resultadoBot.nombre})\n\n`;

    if (resultadoJugador.valor > resultadoBot.valor) {
      usuario1.balance += partida.apuesta * 2;
      resultadoTexto += `🎉 ¡Ganaste! Obtuviste **${partida.apuesta * 2}** monedas.`;
    } else if (resultadoJugador.valor < resultadoBot.valor) {
      resultadoTexto += `💀 Perdiste tu apuesta de **${partida.apuesta}** monedas.`;
    } else {
      usuario1.balance += partida.apuesta;
      resultadoTexto += `🤝 Empate. Recuperaste tu apuesta de **${partida.apuesta}** monedas.`;
    }

    await usuario1.save();

  } else {
    // Partida 1v1
    const usuario2 = await obtenerUsuario({ id: partida.jugador2 });
    const resultado1 = evaluarMano(partida.mano1);
    const resultado2 = evaluarMano(partida.mano2);

    resultadoTexto += `🃏 Mano de <@${partida.jugador1}>: ${mostrarMano(partida.mano1)} (${resultado1.nombre})\n`;
    resultadoTexto += `🃏 Mano de <@${partida.jugador2}>: ${mostrarMano(partida.mano2)} (${resultado2.nombre})\n\n`;

    if (resultado1.valor > resultado2.valor) {
      usuario1.balance += partida.apuesta * 2;
      resultadoTexto += `🎉 <@${partida.jugador1}> gana y se lleva **${partida.apuesta * 2}** monedas.`;
    } else if (resultado2.valor > resultado1.valor) {
      usuario2.balance += partida.apuesta * 2;
      resultadoTexto += `🎉 <@${partida.jugador2}> gana y se lleva **${partida.apuesta * 2}** monedas.`;
    } else {
      usuario1.balance += partida.apuesta;
      usuario2.balance += partida.apuesta;
      resultadoTexto += `🤝 Empate. Ambos recuperan su apuesta.`;
    }

    await usuario1.save();
    await usuario2.save();
  }

  return interaction.update({
    content: resultadoTexto,
    components: []
  }).catch(console.error);
}
