import Item from "../models/Item.js";

export default function handleArmas(client, channelWeaponId) {
  client.on('messageCreate', async (message) => {
    if (message.channel.id !== channelWeaponId) return;

    if (message.content.startsWith('!armas')) {
      try {
                  const items = await Item.find({ isWeapon: true });
      
                  let inventario = "**📦 Inventario de Armas en el Depósito**\n";
      
                  // Grado 1
                  let grado1 = items
                      .filter(item => item.cantidad > 0 && item.type === "Grado 1")
                      .map(item => `• ${item.nombre} x${item.cantidad}`)
                      .join("\n");
                  inventario += "\n**🧪 Grado 1:**\n";
                  inventario += grado1.length > 0 ? `\`\`\`markdown\n${grado1}\n\`\`\`` : "_No hay armas de Grado 1_\n";
      
                  // Grado 2
                  let grado2 = items
                      .filter(item => item.cantidad > 0 && item.type === "Grado 2")
                      .map(item => `• ${item.nombre} x${item.cantidad}`)
                      .join("\n");
                  inventario += "\n**⚔️ Grado 2:**\n";
                  inventario += grado2.length > 0 ? `\`\`\`markdown\n${grado2}\n\`\`\`` : "_No hay armas de Grado 2_\n";
      
                  // Grado 3
                  let grado3 = items
                      .filter(item => item.cantidad > 0 && item.type === "Grado 3")
                      .map(item => `• ${item.nombre} x${item.cantidad}`)
                      .join("\n");
                  inventario += "\n**🛡️ Grado 3:**\n";
                  inventario += grado3.length > 0 ? `\`\`\`markdown\n${grado3}\n\`\`\`` : "_No hay armas de Grado 3_";
      
                  await message.channel.send(inventario);
              } catch (err) {
                  console.error("Error al obtener el inventario:", err);
              }
    }
  });
}
