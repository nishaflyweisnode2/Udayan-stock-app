const mongoose = require('mongoose');

const strategySchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['Investor', 'Trader'],
    },
    image: {
        type: String,
    },
});

module.exports = mongoose.model('Strategy', strategySchema);
