import mongoose from "mongoose";

const armasVentaSchema = new mongoose.Schema({
  nombre: String,
  type: String,
  isSold: Boolean,
  serial: String,
});

export default mongoose.model("ArmasVenta", armasVentaSchema);
