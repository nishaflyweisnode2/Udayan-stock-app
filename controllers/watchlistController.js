const Watchlist = require('../models/watchlistModel');
const Stock = require('../models/stockModel');




exports.createWatchlist = async (req, res) => {
    try {
        const userId = req.user.id;

        const existingWatchlist = await Watchlist.findOne({ user: userId });

        if (existingWatchlist) {
            return res.status(400).json({ status: 400, message: 'Watchlist already exists for this user' });
        }

        const watchlist = new Watchlist({ user: userId, stocks: [] });
        await watchlist.save();
        return res.status(201).json({ status: 201, message: 'Watchlist created successfully', data: watchlist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.addStockToWatchlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { stockId } = req.body;
        const watchlist = await Watchlist.findOne({ user: userId });

        if (!watchlist) {
            return res.status(404).json({ status: 404, message: 'Watchlist not found' });
        }

        const stock = await Stock.findById(stockId);

        if (!stock) {
            return res.status(404).json({ status: 404, message: 'Stock not found' });
        }

        if (watchlist.stocks.includes(stockId)) {
            return res.status(400).json({ status: 400, message: 'Stock is already in the watchlist' });
        }

        watchlist.stocks.push(stockId);
        await watchlist.save();

        return res.status(200).json({ status: 200, message: 'Stock added to watchlist', data: watchlist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getWatchlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const watchlist = await Watchlist.findOne({ user: userId }).populate('stocks');

        if (!watchlist) {
            return res.status(404).json({ status: 404, message: 'Watchlist not found' });
        }

        return res.status(200).json({ status: 200, message: 'Watchlist Get Sucessfully', data: watchlist.stocks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.removeStockFromWatchlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const stockId = req.params.stockId;

        const watchlist = await Watchlist.findOne({ user: userId });

        if (!watchlist) {
            return res.status(404).json({ status: 404, message: 'Watchlist not found' });
        }

        if (watchlist.stocks.length === 0) {
            return res.status(400).json({ status: 400, message: 'Watchlist is already empty' });
        }

        watchlist.stocks = watchlist.stocks.filter((stock) => stock.toString() !== stockId);

        await watchlist.save();

        return res.status(200).json({ status: 200, message: 'Stock removed from watchlist', data: watchlist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

