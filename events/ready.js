export default (client) => {
    client.once("ready", () => {
      console.log(`🤖 Bot iniciado como ${client.user.tag}`);
    });
  };