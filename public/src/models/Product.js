const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    quantity: { type: Number, required: true, default: 0 },
    buyingPrice: { type: Number, required: true },
    extraCost: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);