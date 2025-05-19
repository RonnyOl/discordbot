import mongoose from "mongoose";

const infoSchema = new mongoose.Schema({
  totalDineroVendido: {
    type: Number,
  },
  nombre: {
    type: String,
  },
});

export default mongoose.model("Info", infoSchema);
