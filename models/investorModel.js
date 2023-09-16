const mongoose = require('mongoose');

const investorTypeSchema = new mongoose.Schema({
    strategy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Strategy',
    },
    name: {
        type: String,
        enum: ['Long Term', 'Short Term'],
    },
    title: {
        type: String,
    },
    description: {
        type: String,
    },
});

module.exports = mongoose.model('InvestorType', investorTypeSchema);
