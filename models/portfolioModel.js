const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
    stockId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stock',
        },
    ],
    quantity: {
        type: Number,
    },
    currentPrice: {
        type: Number,
    },
    totalPrice: {
        type: Number,
    },

}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
