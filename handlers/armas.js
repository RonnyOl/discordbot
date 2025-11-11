import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";

import ArmasVenta from "../models/ArmasVenta.js";


const tiposValidos = {
  agregar_9mm: "9mm",
  agregar_pesada: "Pesada",
  agregar_sns: "SNS",
  agregar_combate: "Combate",
  remover_9mm: "9mm",
  remover_pesada: "Pesada",
  remover_sns: "SNS",
  remover_combate: "Combate",
  agregar_micro: "Micro",
  agregar_mini: "Mini",
  remover_micro: "Micro",
  remover_mini: "Mini"
};

export default async function handleArmasBtn(interaction, client) {
  // Mostrar botones para agregar
  if (interaction.customId === "armas_agregar") {
    const row1 = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId("agregar_9mm").setLabel("9mm").setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId("agregar_pesada").setLabel("Pesada").setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId("agregar_sns").setLabel("SNS").setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId("agregar_combate").setLabel("Combate").setStyle(ButtonStyle.Secondary),
  new ButtonBuilder().setCustomId("agregar_micro").setLabel("Micro").setStyle(ButtonStyle.Primary)
);

const row2 = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setCustomId("agregar_mini").setLabel("Mini").setStyle(ButtonStyle.Primary)
);

await interaction.reply({
  content: "Selecciona el tipo de arma a agregar:",
  components: [row1, row2],
  ephemeral: true
});


    return true;
  }

  // Mostrar botones para remover
  if (interaction.customId === "armas_remover") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("remover_9mm").setLabel("9mm").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("remover_pesada").setLabel("Pesada").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("remover_sns").setLabel("SNS").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("remover_combate").setLabel("Combate").setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: "Selecciona el tipo de arma a remover:",
      components: [row],
      ephemeral: true
    });

    return true;
  }

  // Botón de tipo para agregar o remover
  if (tiposValidos[interaction.customId]) {
   
    const tipoAccion = interaction.customId.startsWith("agregar") ? "agregar" : "remover";
    const tipoSeleccionado = tiposValidos[interaction.customId];
 console.log(tipoSeleccionado)
    const modal = new ModalBuilder()
      .setCustomId(`modal_${tipoAccion}_${tipoSeleccionado.toLowerCase()}`)
      .setTitle(`${tipoAccion === "agregar" ? "Agregar" : "Remover"} (${tipoSeleccionado})`);

    const serialInput = new TextInputBuilder()
      .setCustomId("serial_arma")
      .setLabel("Número(s) de serie (separados por coma)")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Ej: ABC123, DEF456, GHI789")
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(serialInput));

    await interaction.showModal(modal);
    return true;
  }

  // Modal para agregar o remover
  if (interaction.customId.startsWith("modal_agregar_") || interaction.customId.startsWith("modal_remover_")) {
    const [_, accion, tipo] = interaction.customId.split("_");
    const tipoCapitalizado = tipo.charAt(0).toLowerCase() + tipo.slice(1);
    const serialesTexto = interaction.fields.getTextInputValue("serial_arma");
    
    const seriales = serialesTexto
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (seriales.length === 0) {
      return interaction.reply({
        content: "⚠️ No ingresaste ningún número de serie válido.",
        ephemeral: true
      });
    }

    if (accion === "agregar") {
      const armasInsertadas = seriales.map((serial) => ({
        nombre:tipoCapitalizado,
        isSold: false,
        serial
      }));

      await ArmasVenta.insertMany(armasInsertadas);

      const canalLogs = await client.channels.fetch("1371352922448990209");
      await canalLogs.send(` ✅ Se han añadido ${armasInsertadas.length} arma(s) del tipo **${tipoCapitalizado}** con los seriales: ${seriales.join(", ")}`);
      await interaction.reply({
        content: `✅ Se añadieron ${armasInsertadas.length} arma(s) del tipo **${tipoCapitalizado}**.`,
        ephemeral: true
      });
    } else {
      const resultado = await ArmasVenta.deleteMany({
        nombre: tipoCapitalizado,
        serial: { $in: seriales }
      });

      const canalLogs = await client.channels.fetch("1371352922448990209");
      await canalLogs.send(` 🗑️ Se han eliminado ${resultado.deletedCount} arma(s) del tipo **${tipoCapitalizado}** con los seriales: ${seriales.join(", ")}`);
      await interaction.reply({
        content: `🗑️ Se removieron ${resultado.deletedCount} arma(s) del tipo **${tipoCapitalizado}**.`,
        ephemeral: true
      });
    }


    return true;
  }
  
    // Mostrar modal para cambiar isSold
  if (interaction.customId === "armas_cambiar") {
    const modal = new ModalBuilder()
      .setCustomId("modal_cambiar_estado")
      .setTitle("Cambiar estado de venta");

    const serialInput = new TextInputBuilder()
      .setCustomId("serial_arma")
      .setLabel("Número(s) de serie (separados por coma)")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Ej: ABC123, DEF456, GHI789")
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(serialInput));

    await interaction.showModal(modal);
    return true;
  }

  // Procesar modal para cambiar estado isSold
  if (interaction.customId === "modal_cambiar_estado") {
    const serialesTexto = interaction.fields.getTextInputValue("serial_arma");

    const seriales = serialesTexto
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (seriales.length === 0) {
      return interaction.reply({
        content: "⚠️ No ingresaste ningún número de serie válido.",
        ephemeral: true
      });
    }

    const armas = await ArmasVenta.find({ serial: { $in: seriales } });

    if (armas.length === 0) {
      return interaction.reply({
        content: "❌ No se encontraron armas con los seriales ingresados.",
        ephemeral: true
      });
    }

    const actualizaciones = [];

    for (const arma of armas) {
      arma.isSold = !arma.isSold;
      actualizaciones.push(arma.save());
    }

    await Promise.all(actualizaciones);
    const canalLogs = await client.channels.fetch("1371352922448990209");
    await canalLogs.send(` 🔁 Se cambió el estado de venta de ${armas.length} arma(s): ${armas.map(a => `${a.nombre} (${a.serial})`).join(", ")}`);
    await interaction.reply({
      content: `🔁 Se cambió el estado de venta de ${armas.length} arma(s).`,
      ephemeral: true
    });

    return true;
  }

  return false;
};
