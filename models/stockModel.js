const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    currentPrice: {
        type: Number,
        required: true,
    },
    volume: {
        type: Number,
    },
    marketCap: {
        type: Number,
    },
    // Other stock-related fields
}, { timestamps: true });

module.exports = mongoose.model('Stock', stockSchema);
