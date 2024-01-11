const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
    symbol: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
    },
    currentPrice: {
        type: Number,
    },
    volume: {
        type: Number,
    },
    marketCap: {
        type: Number,
    },

}, { timestamps: true });

module.exports = mongoose.model('Stock', stockSchema);
