const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
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
    transactionType: {
        type: String,
        enum: ['Buy', 'Sell'],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    // Other transaction-related fields
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
