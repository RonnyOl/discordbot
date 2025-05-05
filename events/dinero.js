export default function handleDinero(client, channelLogsID, channelMoneyId) {
    client.on("messageCreate", async (message) => {
      if (message.channel.id !== channelLogsID) return;
  
      const regex = /\*\*\[(\w+)\] ([\w\s]+)\*\* ha (retirado|depositado) `\$(\d+)`/;
      const match = message.content.match(regex);
      if (!match) return;
  
      const [_, codigo, nombre, accion, monto] = match;
      const tipo = accion === "retirado" ? "📉 **RETIRO**" : "📈 **DEPÓSITO**";
      const alerta = `${tipo}\n📌 Código: ${codigo}\n👤 Usuario: ${nombre.trim()}\n💰 Monto: $${monto}`;
  
      const targetChannel = client.channels.cache.get(channelMoneyId);
      if (targetChannel) {
        targetChannel.send(alerta);
      }
    });
  }
  