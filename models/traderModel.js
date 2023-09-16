const mongoose = require('mongoose');

const traderTypeSchema = new mongoose.Schema({
    strategy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Strategy',
    },
    name: {
        type: String,
        enum: ['Positional', 'Intraday'],
    },
    title: {
        type: String,
    },
    description: {
        type: String,
    },
});

module.exports = mongoose.model('TraderType', traderTypeSchema);
