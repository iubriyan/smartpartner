const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const investorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    investments: [investmentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Investor', investorSchema);