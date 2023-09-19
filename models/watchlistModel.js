const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    stocks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stock',
        },
    ],
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
});

module.exports = mongoose.model('Watchlist', watchlistSchema);
