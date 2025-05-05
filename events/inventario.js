import Item from "../models/Item.js";

export default async function handleInventario(client, channelInventoryId) {
  client.on('messageCreate', async (message) => {
    if (message.channel.id !== channelInventoryId) return;

    if (message.content.startsWith('!inventario')) {
      try {
                  const items = await Item.find({ cantidad: { $gt: 0 } });
      
                  let inventario = "**📦 Inventario del Grupo:**\n";
      
                  // 💰 Apartado de Dinero (ordenado por cantidad descendente)
                  const dineroItems = items
                      .filter(item => item.nombre.toLowerCase().includes('dinero'))
                      .sort((a, b) => b.cantidad - a.cantidad);
      
                  if (dineroItems.length > 0) {
                      inventario += "\n**💰 Dinero:**\n";
                      inventario += dineroItems
                          .map(item => `> • ${item.nombre} x${Number(item.cantidad).toLocaleString('es-ES')}`)
                          .join("\n") + "\n";
                  }
      
                  // ✨ Ítems destacados (ordenado por nombre)
                  const destacadosNombres = ["Antiestres", "Balas Livianas", ".45 ACP", "Chaleco", "Trojan USB"];
                  const destacados = items
                      .filter(item => destacadosNombres.includes(item.nombre))
                      .sort((a, b) => a.nombre.localeCompare(b.nombre));
      
                  if (destacados.length > 0) {
                      inventario += "\n**🟣 Ítems Especiales:**\n";
                      inventario += destacados
                          .map(item => `> • ${item.nombre} x${item.cantidad}`)
                          .join("\n") + "\n";
                  }
      
                  // 📦 Resto del inventario (ordenado por nombre)
                  const idsEspeciales = [...dineroItems, ...destacados].map(i => i._id.toString());
                  const restantes = items
                      .filter(item => !idsEspeciales.includes(item._id.toString()))
                      .sort((a, b) => a.nombre.localeCompare(b.nombre));
      
                  if (restantes.length > 0) {
                      inventario += "\n**📦 Otros objetos:**\n";
                      inventario += "```markdown\n";
                      inventario += restantes
                          .map(item => `- ${item.nombre} x${item.cantidad}`)
                          .join("\n");
                      inventario += "\n```";
                  }
      
                  if (inventario.trim() === "**📦 Inventario del Grupo:**") {
                      inventario += "\n_No hay items en el inventario._";
                  }
      
                  await message.channel.send(inventario);
              } catch (err) {
                  console.error("Error al obtener el inventario:", err);
              }
    }

    if (message.content.startsWith('!update')) {
        const args = message.content.trim().split(" ");
        const cantidad = parseInt(args[args.length - 1]);
      
        if (isNaN(cantidad)) return message.channel.send(`Cantidad inválida.`);
      
        // El nombre es todo lo que está entre !update y la cantidad
        const nombre = args.slice(1, -1).join(" ");
      
        const item = await Item.findOne({ nombre: nombre });
        if (!item) return message.channel.send(`El item **${nombre}** no existe.`);
        
        item.cantidad = cantidad;
        await item.save();
        message.channel.send(`Item **${nombre}** actualizado a **${cantidad}**.`);
      }
      

    if (message.content.startsWith('!delete')) {
      const args = message.content.trim().split(" ");
      const nombre = args[1].replace(/-/g, " ");

      const item = await Item.findOne({ nombre: nombre });
      if (!item) return message.channel.send(`El item **${nombre}** no existe.`);
      await item.deleteOne();
      message.channel.send(`Item **${nombre}** eliminado.`);
    }
  });
}
