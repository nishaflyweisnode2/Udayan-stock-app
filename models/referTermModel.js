const mongoose = require('mongoose');

const referralTermsSchema = new mongoose.Schema({
    howToUse: {
        type: String,
        required: true,
    },
    termsAndConditions: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('ReferralTerms', referralTermsSchema);
