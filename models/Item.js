import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  nombre: String,
  isWeapon: Boolean,
  type: String,
  cantidad: Number,
});

export default mongoose.model("Item", itemSchema);
