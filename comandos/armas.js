import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

export default function armasComandos(client) {
  client.on("messageCreate", async (message) => {
    // Ignorar mensajes de bots y que no sean en canales de texto
    
    if (message.author.bot || !message.guild) return;

    if (message.content === "!btnArmas") {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("armas_agregar")
          .setLabel("Agregar Armas")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("armas_remover")
          .setLabel("Remover Armas")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("armas_cambiar")
          .setLabel("Cambiar Armas")
          .setStyle(ButtonStyle.Primary),
      );

      await message.channel.send({
        content: "Selecciona una acción para las armas:",
        components: [row]
      });
    }
  });
}
