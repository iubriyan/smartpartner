const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    sellingPrice: { type: Number, required: true },
    profit: { type: Number, required: true },
    courierCharge: { type: Number, default: 0 },
    status: { type: String, enum: ['Delivered', 'Returned'], default: 'Delivered' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);