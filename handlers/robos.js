import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";

import Robo from "../models/Robo.js";
import { actualizarResumenRobos } from "../utils/robosUtils.js";

const filtroCategoria = {
  express: ["Tiendas y Peluquerías", "Joyería", "Banco de Paleto", "Ammunation", "Jet privado", "Oficinas de Clinton", "Casa de Empeños"],
  organizado: ["Life Invader", "Casa de Michael", "Casa de Franklin", "Bancos Chicos", "Diamond Casino", "Banco Central", "Fabrica de Lester"],
  tiroteo: ["Yate", "Aduanas", "Laboratorios Humane", "Fábrica de Pollos"]
};

export default async function handleRobos(interaction, client) {
  // ✅ MENÚ PRINCIPAL
  if (interaction.customId === "robos_menu") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("robos_express").setLabel("💸 Express").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("robos_organizado").setLabel("💼 Organizado").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("robos_tiroteo").setLabel("🔫 Tiroteo").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("robos_otros").setLabel("📍 Otros").setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      content: "Selecciona una categoría de robo:",
      components: [row],
      ephemeral: true
    }).catch(console.error);

    setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
    return true;
  }

  // ✅ CATEGORÍA "OTROS"
  if (interaction.customId === "robos_otros") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("secuestro_oficial_menu").setLabel("📍 Secuestro Oficial").setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      content: "Otros lugares disponibles:",
      components: [row],
      ephemeral: true
    }).catch(console.error);

    setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
    return true;
  }

  // ✅ SELECCIÓN DE SECUESTRO OFICIAL
  if (interaction.customId === "secuestro_oficial_menu") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("secuestro_oficial_exito").setLabel("✅ Éxito").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("secuestro_oficial_fallo").setLabel("❌ Fallo").setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: `¿El **Secuestro Oficial** fue exitoso o fallido?`,
      components: [row],
      ephemeral: true
    }).catch(console.error);

    setTimeout(() => interaction.deleteReply().catch(() => {}), 4000);
    return true;
  }

  // ✅ MODAL PARA SECUESTRO OFICIAL
  if (
    interaction.customId === "secuestro_oficial_exito" ||
    interaction.customId === "secuestro_oficial_fallo"
  ) {
    const exito = interaction.customId.endsWith("exito");
    const tipo = exito ? "exito" : "fallo";

    const modal = new ModalBuilder()
    .setCustomId(`modal_${categoria}_${index}_${resultado}`)
    .setTitle(resultado === "exito" ? "✅ Robo Exitoso" : "❌ Robo Fallido");
  
  const input = new TextInputBuilder()
    .setCustomId("participantes")
    .setLabel("¿Quiénes participaron?")
    .setPlaceholder("Inclúyete si participaste. Ej: Beretta, Pac")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);
  
  const row = new ActionRowBuilder().addComponents(input);
  modal.addComponents(row);
  
  await interaction.showModal(modal);
  
    return true;
  }

  // ✅ CATEGORÍA NORMAL
  const [prefix, categoria, index, resultado] = interaction.customId.split("_");

  if (prefix === "robos" && ["express", "organizado", "tiroteo"].includes(categoria)) {
    const robos = await Robo.find();
    const robosCategoria = robos.filter(r => filtroCategoria[categoria].includes(r.nombre));

    const rows = [];
    let currentRow = new ActionRowBuilder();

    robosCategoria.forEach((robo, i) => {
      if (currentRow.components.length === 5) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }
      currentRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`robo_${categoria}_${i}`)
          .setLabel(robo.nombre)
          .setStyle(ButtonStyle.Success)
      );
    });

    if (currentRow.components.length > 0) {
      rows.push(currentRow);
    }

    await interaction.reply({
      content: `**${categoria.charAt(0).toUpperCase() + categoria.slice(1)}:** Elige un lugar`,
      components: rows,
      ephemeral: true
    }).catch(console.error);

    setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
    return true;
  }

  // ✅ SELECCIÓN DE LUGAR
  if (prefix === "robo" && index && !resultado) {
    const nombreLugar = filtroCategoria[categoria]?.[index];
    if (!nombreLugar) return;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`robo_${categoria}_${index}_exito`).setLabel("✅ Éxito").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`robo_${categoria}_${index}_fallo`).setLabel("❌ Fallo").setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: `¿El robo en **${nombreLugar}** fue exitoso o fallido?`,
      components: [row],
      ephemeral: true
    }).catch(console.error);

    setTimeout(() => interaction.deleteReply().catch(() => {}), 4000);
    return true;
  }

  // ✅ BOTÓN DE RESULTADO DE LUGAR → ABRE MODAL
  if (prefix === "robo" && resultado) {
    const modal = new ModalBuilder()
    .setCustomId(`modal_${categoria}_${index}_${resultado}`)
    .setTitle(resultado === "exito" ? "✅ Robo Exitoso" : "❌ Robo Fallido");
  
  const input = new TextInputBuilder()
    .setCustomId("participantes")
    .setLabel("¿Quiénes participaron?")
    .setPlaceholder("Inclúyete si participaste. Ej: Beretta, Pac")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);
  
  const row = new ActionRowBuilder().addComponents(input);
  modal.addComponents(row);
  
  await interaction.showModal(modal);
  
    return true;
  }

  // ✅ PROCESAR ENVÍO DEL MODAL
  if (interaction.isModalSubmit() && interaction.customId.startsWith("modal_")) {
    const [_, categoria, index, resultado] = interaction.customId.split("_");
    const participantesTexto = interaction.fields.getTextInputValue("participantes");
  
    const nombreLugar = filtroCategoria[categoria]?.[index] || "Secuestro Oficial";
    let lugar = await Robo.findOne({ nombre: nombreLugar });
  
    if (!lugar) {
      return interaction.reply({
        content: "❌ Lugar no registrado.",
        ephemeral: true
      }).catch(console.error);
    }
  
    // ✅ Actualiza el lugar
    if (resultado === "exito") {
      if (lugar.actual < lugar.max || lugar.max === Infinity) {
        lugar.actual++;
        lugar.exitos++;
      } else {
        return interaction.reply({
          content: `❌ Ya se alcanzó el límite de robos en **${lugar.nombre}**.`,
          ephemeral: true
        }).catch(console.error);
      }
    } else {
      lugar.fallos++;
      lugar.actual++;
    }
  
    await lugar.save();
  
    // ✅ Procesar los apodos (si los hay)
    let apodos = participantesTexto
      .split(/[,\n]/) // coma o salto de línea
      .map(p => p.trim())
      .filter(Boolean);
  
    const { default: Usuario } = await import("../models/Usuario.js");
  
    for (const apodo of apodos) {
      const user = await Usuario.findOne({ apodoBanda: new RegExp(`^${apodo}$`, "i") });
      
      if (user) {
        
        // Agregar al historial de robos
        user.robos.push({
          robo: nombreLugar,
          resultado: resultado === "exito" ? "éxito" : "fracaso",
          fecha: new Date()
        });
      
        // Contadores si querés mantenerlos igual
        if (resultado === "exito") {
          user.robosExitosos++;
          user.RobosHechos++
          user.robosExitososPorSemana++
        } else {
          user.robosFallidos++;
          user.RobosHechos++
          user.robosFallidosPorSemana++

        }
      
        await user.save();
      }
    }
  
    // ✅ Mensaje de resultado
    const log = resultado === "exito"
      ? `✅ Robo exitoso en **${lugar.nombre}** (${lugar.actual}/${lugar.max === Infinity ? "∞" : lugar.max})`
      : `❌ Robo fallido en **${lugar.nombre}** (fallos: ${lugar.fallos})`;
  
    const canalRegistros = await client.channels.fetch("1358308861328756947");
   
    if (canalRegistros?.isTextBased()) {
      canalRegistros.send(`${log} Lo confirmó <@${interaction.user.id}> y fue realizado por los siguientes integrantes: ${participantesTexto}`).catch(() => {});
    }
  
    actualizarResumenRobos(client, "1358309590751510578");
  
    await interaction.reply({
      content: `${log}${apodos.length ? `\n👥 Participantes: ${apodos.join(", ")}` : ""}`,
      ephemeral: true
    }).catch(console.error);
  
    return true;
  }

  return false;
}
