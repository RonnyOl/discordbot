import { calcularPuntaje, mostrarMano, partidasBlackjack, obtenerUsuario } from "../utils/blackjackUtils.js";

export default async function handleBlackjack(interaction) {
  const partida = partidasBlackjack.get(interaction.user.id);

  if (!partida || partida.terminado) {
    if (!interaction.replied && !interaction.deferred) {
      return interaction.reply({
        content: "❌ No tienes una partida activa.",
        ephemeral: true
      }).catch(() => {});
    }
    return;
  }

  if (interaction.customId === "bj_pedir") {
    partida.jugador.push(partida.mazo.pop());
    const puntos = calcularPuntaje(partida.jugador);

    if (puntos > 21) {
      partida.terminado = true;
      partidasBlackjack.delete(interaction.user.id);
      return interaction.update({
        content: `🂠 Tu mano: **${mostrarMano(partida.jugador)}** (Total: ${puntos})\n💥 ¡Te pasaste! Perdiste.`,
        components: []
      }).catch(console.error);
    }

    return interaction.update({
      content: `🂠 Tu mano: **${mostrarMano(partida.jugador)}** (Total: ${puntos})\n🤖 Dealer: **${mostrarMano(partida.dealer)}**, 🂠`,
      components: interaction.message.components
    }).catch(console.error);
  }

  if (interaction.customId === "bj_quedarse") {
    let puntosJugador = calcularPuntaje(partida.jugador);
    let puntosDealer = calcularPuntaje(partida.dealer);

    while (puntosDealer < 17) {
      partida.dealer.push(partida.mazo.pop());
      puntosDealer = calcularPuntaje(partida.dealer);
    }

    partida.terminado = true;
    partidasBlackjack.delete(interaction.user.id);

    let resultado;
    const usuario = await obtenerUsuario(interaction.user);

    if (puntosDealer > 21 || puntosJugador > puntosDealer) {
      resultado = "🎉 ¡Ganaste!";
      usuario.balance += partida.apuesta * 2;
      resultado += `\n💰 Ganaste **${partida.apuesta * 2}** monedas.`;
    } else if (puntosJugador < puntosDealer) {
      resultado = "💀 Perdiste.";
      resultado += `\n💸 Perdiste tu apuesta de **${partida.apuesta}** monedas.`;
    } else {
      resultado = "🤝 Empate.";
      usuario.balance += partida.apuesta;
      resultado += `\n💵 Recuperaste tu apuesta de **${partida.apuesta}** monedas.`;
    }

    await usuario.save();

    return interaction.update({
      content: `🂠 Tu mano: **${mostrarMano(partida.jugador)}** (Total: ${puntosJugador})\n🤖 Dealer: **${mostrarMano(partida.dealer)}** (Total: ${puntosDealer})\n\n${resultado}`,
      components: []
    }).catch(console.error);
  }
}
