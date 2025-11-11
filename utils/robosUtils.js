import Robo from "../models/Robo.js";

export async function actualizarResumenRobos(client, channelRobosId) {
  const canal = await client.channels.fetch(channelRobosId);
  if (!canal || !canal.isTextBased()) return;

  try {
    const mensaje = await canal.messages.fetch("1358322960984969227");
    const robos = await Robo.find();

    const categorias = {
      express: {
        titulo: "⚡ **Express**",
        lugares: ["Tiendas y Peluquerías", "Joyería", "Banco de Paleto", "Ammunation", "Jet privado", "Life Invader", "Oficinas de Clinton", "Casa de Empeños"]
      },
      organizado: {
        titulo: "🧠 **Robo Organizado**",
        lugares: ["Casa de Michael", "Casa de Franklin", "Bancos Chicos", "Diamond Casino", "Banco Central", "Fabrica de Lester", "Bobcat"]
      },
      tiroteo: {
        titulo: "🔫 **Robo con tiroteo directo**",
        lugares: ["Yate", "Aduanas", "Laboratorios Humane", "Fábrica de Pollos"]
      },
      secuestro: {
        titulo: "📍 **Secuestro Oficial**",
        lugares: ["Secuestro Oficial"]
      }
    };

    let contenido = "📊 **Resumen de robos actualizados:**\n\n";

    for (const key in categorias) {
      const { titulo, lugares } = categorias[key];
      contenido += `${titulo}\n\n\`\`\`\n`;

      lugares.forEach(nombreLugar => {
        const robo = robos.find(r => r.nombre === nombreLugar);
        const actual = robo?.actual ?? 0;
        const max = robo?.max === Infinity ? "∞" : robo?.max ?? "?";
        const exitos = robo?.exitos ?? 0;
        const fallos = robo?.fallos ?? 0;
        const puntos = robo?.puntos ?? 0;
        const linea = `${nombreLugar.padEnd(25)} ${String(actual).padStart(2)}/${String(max).padEnd(2)} | P: ${String(puntos).padEnd(2)} |  ✅ ${String(exitos).padEnd(2)} ❌ ${String(fallos).padEnd(2)} `;
        contenido += linea + "\n";
      });

      contenido += "```\n";
    }

    await mensaje.edit({ content: contenido });
  } catch (err) {
    console.error("Error actualizando resumen:", err);
  }
}
