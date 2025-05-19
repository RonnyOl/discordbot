import Item from "../models/Item.js";

export default function handleLogs(client, channelLogsID) {
client.on('messageCreate', async (message) => {
    if (message.channel.id !== channelLogsID) return;
    
    const regexLog = /\*\*\[(.*?)\] (.*?)\*\* ha (guardado|retirado) `x(\d+)\s(.+?)`\./i;
    const match = message.content.match(regexLog);

    if (!match) {
        return; // Ignorar mensajes de "retirado"    
    }

    if (match[5].includes("Pistola") && match[3].includes("retirado")) {
        try {
            await message.react('🔫'); 
            await message.react('👁‍🗨'); 
        } catch (err) {
            console.error("No se pudo reaccionar al mensaje:", err);
        }
    }else if (match[5].includes("Pistola") && match[3].includes("guardado")) {
        try {
            await message.react('🔫'); 
            await message.react('✅'); 
        } catch (err) {
            console.error("No se pudo reaccionar al mensaje:", err);
        }
    }


    if (match[5].includes("Grado")) {
        const usuarioID = match[1];
        const nombre = match[2];
        const accion = match[3];
        const cantidad = parseInt(match[4]);
        const item = match[5];

        console.log(`Usuario: ${usuarioID}, Nombre: ${nombre}, Acción: ${accion}, Cantidad: ${cantidad}, Item: ${item}`);

        try {
            const existente = await Item.findOne({nombre: item});
            if (existente){
                // Si existe, sumamos o restamos según la acción
                if (accion === 'guardado') {
                    existente.cantidad += cantidad;
                } else if (accion === 'retirado') {
                    existente.cantidad -= cantidad;
                }

                await existente.save();
                console.log("Cantidad actualizada en la base de datos");
            }else{
                // Si no existe, creamos uno nuevo
                const itemCompleto = match[5];
                const matchGrado = itemCompleto.match(/\((Grado \d+)\)/);
                const grado = matchGrado ? matchGrado[1] : null;
                const nuevoItem = new Item({
                    nombre: item,
                    isWeapon: true,
                    type: grado,
                    cantidad: accion === 'guardado' ? cantidad : -cantidad,
                });

                await nuevoItem.save();
                console.log("Item nuevo guardado en la base de datos");
            }
        }catch (err) {
            console.error("Error al guardar/actualizar el item:", err);
        }
    }else{
        const usuarioID = match[1];
        const nombre = match[2];
        const accion = match[3];
        const cantidad = parseInt(match[4]);
        const item = match[5];

        console.log(`Usuario: ${usuarioID}, Nombre: ${nombre}, Acción: ${accion}, Cantidad: ${cantidad}, Item: ${item}`);

        // Ignoramos este tipo de item

        try {
            // Buscar si ya existe ese item en la base
            const existente = await Item.findOne({ nombre: item });

            if (existente) {
                // Si existe, sumamos o restamos según la acción
                if (accion === 'guardado') {
                    existente.cantidad += cantidad;
                } else if (accion === 'retirado') {
                    existente.cantidad -= cantidad;
                }

                await existente.save();
                console.log("Cantidad actualizada en la base de datos");
            } else {
                // Si no existe, creamos uno nuevo
                const nuevoItem = new Item({
                    nombre: item,
                    type: null,
                
                    cantidad: accion === 'guardado' ? cantidad : -cantidad,
                });

                await nuevoItem.save();
                console.log("Item nuevo guardado en la base de datos");
            }
        } catch (err) {
            console.error("Error al guardar/actualizar el item:", err);
        }
    }
})

}