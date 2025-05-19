import Usuario from "../models/Usuario.js"; // Importa el modelo de Usuario

// Crea un mazo de cartas estándar para Blackjack (4 palos, sin comodines)
function crearMazo() {
  const palos = ["♠", "♥", "♦", "♣"];
  const valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const mazo = [];

  for (const palo of palos) {
    for (const valor of valores) {
      mazo.push(`${valor}${palo}`);
    }
  }

  return mazo.sort(() => Math.random() - 0.5);
}

// Calcula el puntaje de una mano en Blackjack
function calcularPuntaje(mano) {
  let total = 0;
  let ases = 0;

  for (const carta of mano) {
    const valor = carta.slice(0, -1);
    if (valor === "A") {
      ases++;
      total += 11;
    } else if (["J", "Q", "K"].includes(valor)) {
      total += 10;
    } else {
      total += parseInt(valor);
    }
  }

  while (total > 21 && ases > 0) {
    total -= 10;
    ases--;
  }

  return total;
}

// Muestra las cartas de una mano como string
function mostrarMano(mano) {
  return mano.join(" ");
}

// Map para guardar partidas activas
const partidasBlackjack = new Map();

// Obtener o crear el usuario en la base de datos
async function obtenerUsuario(user) {
  let usuario = await Usuario.findOne({ userId: user.id }).populate("armaAsignada");
  console.log("usuario", usuario)
  if (!usuario) {
    console.log("paso acá")
    usuario = new Usuario({
      userId: user.id,
      apodo: user.username,
      balance: 1000,
    });
    await usuario.save();
  }
  return usuario;
}

// Exportar funciones y objetos
export  {
  crearMazo,
  calcularPuntaje,
  mostrarMano,
  partidasBlackjack,
  obtenerUsuario
};
