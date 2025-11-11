import mongoose from "mongoose";

export const roboSchema = new mongoose.Schema({
  nombre: String,
  actual: { type: Number, default: 0 },
  max: { type: Number, default: Infinity },
  exitos: { type: Number, default: 0 },
  fallos: { type: Number, default: 0 },
  puntos: { type: Number, default: 0 },
});

// Exportas **ambos**: el modelo y el esquema
export default mongoose.model("Robo", roboSchema);
