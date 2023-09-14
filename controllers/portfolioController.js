const User = require('../models/userModel');
const Portfolio = require('../models/portfolioModel');
const Stock = require('../models/stockModel');
const mongoose = require('mongoose');



exports.getUserPortfolio = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const portfolio = await Portfolio.findOne({ user: req.user.id }).populate('stockId'); //companyId

        res.status(200).json({ portfolio });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.addStockToPortfolio = async (req, res) => {
    try {
        const { companyId, stockId, quantity } = req.body;
        const userId = req.user.id;

        if (quantity === 0) {
            if (quantity < 0) {
                return res.status(400).json({ status: 400, message: 'Quantity cannot be negative' });
            }
        }
        let stock = await Stock.findOne({ _id: stockId });

        if (!stock) {
            return res.status(404).json({ status: 404, message: 'Stock not found' });
        }

        const stockPrice = stock.currentPrice;

        let portfolio = await Portfolio.findOne({ userId, stockId });

        if (!portfolio) {
            portfolio = new Portfolio({
                userId,
                companyId,
                stockId,
                quantity,
                currentPrice: stockPrice,
                totalPrice: stockPrice * quantity,
            });
        } else {
            const newQuantity = portfolio.quantity + quantity;

            if (newQuantity < 0) {
                return res.status(400).json({ status: 400, message: 'Quantity cannot go below zero' });
            }

            const newTotalValue = portfolio.totalPrice + quantity * stockPrice;

            portfolio.quantity = newQuantity;
            portfolio.totalPrice = newTotalValue;
        }

        await portfolio.save();

        res.status(201).json({ message: 'Stock added to the portfolio successfully', data: portfolio });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.updatePortfolioQuantity = async (req, res) => {
    try {
        const { portfolioId, quantity } = req.body;
        const userId = req.user.id;

        const portfolio = await Portfolio.findOne({ _id: portfolioId, userId });

        if (!portfolio) {
            return res.status(404).json({ status: 404, message: 'Portfolio not found' });
        }

        const stock = await Stock.findOne({ _id: portfolio.stockId });

        if (!stock) {
            return res.status(404).json({ status: 404, message: 'Stock not found' });
        }

        const newQuantity = portfolio.quantity + quantity;
        if (newQuantity < 0) {
            return res.status(400).json({ status: 400, message: 'Quantity cannot be negative' });
        }

        const newTotalValue = stock.currentPrice * newQuantity;

        portfolio.quantity = newQuantity;
        portfolio.totalPrice = newTotalValue;

        await portfolio.save();

        res.status(200).json({ message: 'Portfolio quantity updated successfully', data: portfolio });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.removeStockFromPortfolio = async (req, res) => {
    try {
        const stockId = req.params.stockId;

        const portfolio = await Portfolio.findOne({ user: req.user.id });

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        portfolio.stocks = portfolio.stocks || [];

        const stockObjectId = new mongoose.Types.ObjectId(stockId);

        portfolio.stocks = portfolio.stocks.filter((item) => item.stock.toString() !== stockObjectId.toString());

        await portfolio.save();

        await portfolio.deleteOne({ user: req.user.id, stockId: stockObjectId });

        res.status(200).json({ status: 200, message: 'Stock removed from the portfolio successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.viewStockFinancials = async (req, res) => {
    try {
        const stockId = req.params.stockId;

        const stock = await Stock.findById({ _id: stockId });

        if (!stock) {
            return res.status(404).json({ message: 'Stock not founds' });
        }

        res.status(200).json({ stock });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};
