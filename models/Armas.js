import mongoose from "mongoose";

const armaSchema = new mongoose.Schema({
  nombre: String,
  type: String,
  isLost: Boolean,
  serial: String,
});

export default mongoose.model("Arma", armaSchema);
