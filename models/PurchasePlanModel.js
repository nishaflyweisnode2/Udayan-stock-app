const mongoose = require('mongoose');


const purchasePlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    purchaseDate: {
        type: Date,
        default: Date.now,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending',
    }

}, { timestamps: true });

module.exports = mongoose.model('PurchasePlan', purchasePlanSchema);
