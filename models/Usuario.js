import mongoose from "mongoose";


const usuarioSchema = new mongoose.Schema({
  userId: String,
  apodo: String,
  apodoBanda: String,
  balance: { type: Number, default: 1000 },
  ultimoTrabajo: { type: Date, default: null },
  lastFish: Number,
  inventario: [String],
  robosExitosos: { type: Number, default: 0 },
  robosFallidos: { type: Number, default: 0 },
  robosFallidosPorSemana: { type: Number, default: 0 },
  robosExitososPorSemana: { type: Number, default: 0 },
  RobosHechos: { type: Number, default: 0 },
  armaAsignada: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Arma'
},
  robos: [{
    robo: {type: String, required: true},
    resultado: {type: String, required: true}, // "exito" o "fracaso"
    fecha: {type: Date, default: Date.now},
  }] // ✅ Correcto: embebido con el esquema
});

export default mongoose.model("Usuario", usuarioSchema);
