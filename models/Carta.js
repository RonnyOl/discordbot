import mongoose from "mongoose";


const cartaSchema = new mongoose.Schema({
    nombre: String,
    image: String,
    probabilidad: Number,
    precio: Number
});

export default mongoose.model("Carta", cartaSchema);