const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
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

}, { timestamps: true });

module.exports = mongoose.model('Stock', stockSchema);
