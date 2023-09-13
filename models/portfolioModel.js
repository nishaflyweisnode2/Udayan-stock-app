const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    stockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    averagePrice: {
        type: Number,
        required: true,
    },
    // Other portfolio-related fields
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
