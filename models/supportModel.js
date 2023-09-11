const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema({

    description: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
    },
    email: {
        type: String,
    },

}, { timestamps: true });

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
