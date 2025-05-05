
import { obtenerUsuario } from "../utils/blackjackUtils.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { crearMazo, calcularPuntaje, partidasBlackjack, mostrarMano } from "../utils/blackjackUtils.js";


export default async function blackjackComandos(client, channelBlackjackId) {
  client.on("messageCreate", async (message) => {
    if (!message.content.startsWith("!blackjack") && !message.content.startsWith("!bj")) return;

    const args = message.content.split(" ");
    const apuesta = parseInt(args[1]);

    if (isNaN(apuesta) || apuesta <= 0) {
        return message.reply("❌ Apuesta inválida. Usa `!blackjack <cantidad>`.");
    }

    const usuario = await obtenerUsuario(message.author);
    if (usuario.balance < apuesta) {
        return message.reply("❌ No tienes suficiente dinero para esa apuesta.");
    }

    usuario.balance -= apuesta;
    await usuario.save();

    const mazo = crearMazo();
    const jugador = [mazo.pop(), mazo.pop()];
    const dealer = [mazo.pop()];

    partidasBlackjack.set(message.author.id, {
        mazo,
        jugador,
        dealer,
        apuesta,
        terminado: false
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`bj_pedir`).setLabel("🃏 Pedir").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`bj_quedarse`).setLabel("✋ Quedarse").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`bj_salir`).setLabel("❌ Salir").setStyle(ButtonStyle.Danger)
    );

    return message.reply({
        content: `💵 Apuesta: **${apuesta}** monedas\n🂠 Tu mano: **${mostrarMano(jugador)}** (Total: ${calcularPuntaje(jugador)})\n🤖 Dealer: **${mostrarMano(dealer)}**, 🂠`,
        components: [row]
    });
});

}