export default async function juegosComandos(client, juegosChannelId) {
    client.on("messageCreate", async (message) => {
        if (message.channel.id !== juegosChannelId) return; // Solo escucha en el canal especificado

        if (message.content.startsWith("!impostor")) {
            const args = message.content.split(" ");
            const categoria = args[1]?.toLowerCase();
            const mentions = message.mentions.users;

            // Lista base de jugadores (incluye autor si no está mencionado)
            const jugadores = Array.from(mentions.values());
            if (!jugadores.some(u => u.id === message.author.id)) jugadores.push(message.author);

            if (jugadores.length < 3) {
                return message.reply("⚠️ Necesitás al menos **3 jugadores** (contándote a vos).");
            }

            const posiblesTemas = {
                objetos: [
                    "cacerola", "tenedor", "lámpara", "computadora", "silla", "auto", "martillo",
                    "botella", "celular", "llave"
                ],
                animales: [
                    "perro", "gato", "elefante", "jirafa", "panda", "mono", "lobo", "conejo", "zorro"
                ],
                personas: [
                    "SammyLart", "Dani", "LilJ", "EscuelaRP", "Elon Musk", "Messi", "Bad Bunny",
                    "Taylor Swift", "Shakira", "maru", "nadine", "ostia pues sale barato"
                ],
                series: [
                    "Los Simpsons", "Bob Esponja", "Phineas y Ferb", "Kim Possible", "El Laboratorio de Dexter",
                    "Las Chicas Superpoderosas", "Coraje el Perro Cobarde", "Johnny Bravo", "Ed, Edd y Eddy",
                    "Ben 10", "Danny Phantom", "Los Padrinos Mágicos", "Jimmy Neutrón", "Rugrats", "Rocket Power",
                    "Hey Arnold", "CatDog", "Recreo", "Duck Dodgers", "Pinky y Cerebro", "Animaniacs",
                    "Scooby-Doo", "Tom y Jerry", "Looney Tunes", "Teen Titans", "Avatar: La Leyenda de Aang",
                    "Avatar: La Leyenda de Korra", "El Increíble Mundo de Gumball", "Regular Show",
                    "Steven Universe", "Gravity Falls", "Hora de Aventura", "Star vs. Las Fuerzas del Mal",
                    "Clarence", "Chowder", "Campamento de Lazlo", "Johnny Test", "Jake Long: El Dragón Occidental",
                    "KND: Los Chicos del Barrio", "Las Aventuras de Billy y Mandy",

                    "Drake y Josh", "iCarly", "Victorious", "Kenan y Kel", "Zack y Cody", "Hannah Montana",
                    "Lizzie McGuire", "Cory en la Casa Blanca", "Los Hechiceros de Waverly Place",
                    "Manual de Supervivencia Escolar de Ned", "Malcolm el de en Medio", "El Príncipe del Rap",
                    "Friends", "The Office", "How I Met Your Mother", "Brooklyn Nine-Nine", "Modern Family",
                    "The Big Bang Theory", "Stranger Things", "The Walking Dead", "Breaking Bad",
                    "Better Call Saul", "Game of Thrones", "The Boys", "The Mandalorian", "The Last of Us",
                    "Wednesday", "Loki", "WandaVision", "Moon Knight", "Peaky Blinders", "Vikings", "Dark",
                    "Money Heist", "Lucifer", "Sherlock", "Doctor Who", "Prison Break", "Outer Banks",
                    "Supernatural", "Smallville", "Gotham", "Arrow", "The Flash", "Titans", "Black Mirror",
                    "You", "The Umbrella Academy"
                ],

                peliculas: [

                    "El Rey León", "Aladdín", "La Sirenita", "La Bella y la Bestia", "Blancanieves",
                    "Cenicienta", "Mulán", "Pocahontas", "Hércules", "Tarzán", "Frozen", "Encanto",
                    "Zootopia", "Moana", "Ralph el Demoledor", "Lilo y Stitch",
                    "Toy Story", "Toy Story 2", "Toy Story 3", "Toy Story 4", "Monsters Inc.",
                    "Monsters University", "Los Increíbles", "Los Increíbles 2", "Buscando a Nemo",
                    "Buscando a Dory", "Cars", "Cars 2", "Cars 3", "Up", "Wall-E", "Coco", "Soul",
                    "Intensamente", "Red", "Un Gran Dinosaurio", "Luca", "Elemental",
                    "Shrek", "Shrek 2", "Shrek Tercero", "Madagascar", "Kung Fu Panda", "Cómo Entrenar a tu Dragón",
                    "Megamente", "Los Croods", "El Gato con Botas", "Trolls", "Home", "Bee Movie",
                    "Minions", "Mi Villano Favorito", "Sing", "El Lorax", "Hotel Transylvania",
                    "La Era de Hielo", "Rio", "Los Pitufos", "Ratatouille", "Bolt", "Big Hero 6",
                    "Las Aventuras de Tintín", "Detective Pikachu", "Sonic", "Super Mario Bros: La Película",
                    "Spider-Man: Un Nuevo Universo", "Spider-Man: A Través del Spider-Verso"
                ],
                roleplay: [
                    "ak", "chango", "pac", "chino", "sarco", "mozlo", "lexa", "mudo", "lucky",
                    "exo", "ace", "glock", "luci", "rolo", "switch", "lilj", "sammy", "north",
                    "nadine", "smoke", "maru", "andyuwu", "mono", "rana", "pepe", "black angels",
                    "gsto", "stb", "chiclepuffs", "vodkaconjugo", "meryjo", "melocoton", "luxd", "Dulce", "Kuko", "Milena", "copito", "diablo", "kan", "manuelux", "tary",
                    "atlas", "gianca", "trukitos", "kronox", "mk", "woozie", "richie", "sarahi", "lara sawyer", "romanov", "negrito", "tekla", "meimei"
                ],
                videojuegos: [
                    "Super Mario Bros", "The Legend of Zelda", "Donkey Kong", "Pac-Man", "Tetris",
                    "Sonic the Hedgehog", "Street Fighter", "Mortal Kombat", "Final Fantasy", "Mega Man",
                    "Pokémon", "Castlevania", "Metroid", "Crash Bandicoot", "Spyro the Dragon",
                    "Fortnite", "Minecraft", "Roblox", "Among Us", "Valorant", "Counter-Strike 2",
                    "CS:GO", "League of Legends", "Dota 2", "Overwatch", "Apex Legends", "PUBG",
                    "Call of Duty", "Call of Duty: Warzone", "Call of Duty: Mobile", "Rainbow Six Siege",
                    "Team Fortress 2", "Rocket League", "Brawl Stars", "Clash Royale", "Clash of Clans",
                    "GTA V", "GTA San Andreas", "Red Dead Redemption 2", "The Witcher 3", "Elden Ring",
                    "Dark Souls", "Hollow Knight", "Skyrim", "Fallout 4", "Cyberpunk 2077", "Terraria",
                    "Subnautica", "No Man’s Sky", "Assassin’s Creed", "Assassin’s Creed Valhalla",
                    "God of War", "God of War: Ragnarök", "The Last of Us", "Uncharted", "Horizon Zero Dawn",
                    "Horizon Forbidden West", "Spider-Man", "Spider-Man: Miles Morales", "Ghost of Tsushima",
                    "Bloodborne", "Gran Turismo", "Forza Horizon", "Halo", "Gears of War",
                    "Stardew Valley", "Undertale", "Cuphead", "Celeste", "Slay the Spire", "Dead Cells",
                    "Vampire Survivors", "Hades", "The Binding of Isaac", "Don't Starve", "Terraria",
                    "Valheim", "Rust", "Phasmophobia",
                    "Battlefield", "Escape from Tarkov", "ARMA 3", "Destiny 2", "Titanfall 2",
                    "Payday 2", "Left 4 Dead 2", "Back 4 Blood", "Borderlands", "Far Cry", "DOOM",
                    "Five Nights at Freddy’s", "FIFA", "EA Sports FC", "NBA 2K", "Madden NFL",
                    "The Sims", "SimCity", "Civilization VI", "Age of Empires", "Hearts of Iron IV",
                    "Cities: Skylines", "Genshin Impact",]

            };


            if (!categoria || !posiblesTemas[categoria]) {
                return message.reply(
                    "⚠️ Categoría inválida o faltante. Usá una de estas: `personas`, `objetos`, `animales`, `series`.\n\n" +
                    "📌 Ejemplo: `!impostor personas @jugador1 @jugador2 @jugador3`"
                );
            }

            // --- IMPORTANTE: usamos COPIAS para no mutar el array original ---
            // copia para seleccionar impostores
            const poolParaSeleccion = [...jugadores];
            // copia para mostrar orden (la mezclamos más abajo)
            const jugadoresParaOrden = [...jugadores];

            // Elegir impostores (1 o 2) a partir de la pool (sin tocar jugadoresParaOrden)
            const cantidadImpostores = Math.random() < 0.5 ? 1 : 2;
            const impostores = [];
            for (let i = 0; i < cantidadImpostores; i++) {
                const idx = Math.floor(Math.random() * poolParaSeleccion.length);
                const elegido = poolParaSeleccion.splice(idx, 1)[0];
                impostores.push(elegido);
            }

            // Elegir palabra
            const palabra = posiblesTemas[categoria][Math.floor(Math.random() * posiblesTemas[categoria].length)];

            // Enviar mensajes privados (recorremos la lista original 'jugadores')
            for (const jugador of jugadores) {
                try {
                    if (impostores.some(x => x.id === jugador.id)) {
                        await jugador.send("👀 **Sos el impostor**. Fingí saber la palabra.");
                    } else {
                        await jugador.send(`🔤 La palabra secreta (${categoria}) es: **${palabra}**`);
                    }
                } catch {
                    message.channel.send(`⚠️ No pude enviarle mensaje a ${jugador.username}.`);
                }
            }

            // Generar orden ALEATORIO usando la copia jugadoresParaOrden (no mutada por la selección)
            function shuffleArray(arr) {
                // Fisher–Yates
                const a = [...arr];
                for (let i = a.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [a[i], a[j]] = [a[j], a[i]];
                }
                return a;
            }

            const ordenAleatorio = shuffleArray(jugadoresParaOrden)
                .map((u, i) => `${i + 1}. ${u}`)
                .join("\n");

            await message.reply(
                `✅ Ronda creada con categoría **${categoria}**. Hay **${cantidadImpostores} impostor(es)** entre nosotros...\n\n` +
                `🔢 **Orden aleatorio de juego:**\n${ordenAleatorio}`
            );

            console.log(`Impostores: ${impostores.map(u => u.username).join(", ")} | Palabra: ${palabra} | Categoría: ${categoria}`);
        }
    })
}