const Transaction = require('../models/transcationModel');
const Stock = require('../models/stockModel');
const User = require('../models/userModel');
const Portfolio = require('../models/portfolioModel');
const moment = require('moment');





exports.buyStock = async (req, res) => {
  try {
    const userId = req.user.id;
    const { stockId, quantity } = req.body;

    const stock = await Stock.findById(stockId);

    if (!stock) {
      return res.status(404).json({ status: 404, message: 'Stock not found' });
    }

    const totalPrice = stock.currentPrice * quantity;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }

    if (user.balance < totalPrice) {
      return res.status(400).json({ status: 400, message: 'Insufficient balance' });
    }

    let portfolioEntry = await Portfolio.findOne({
      userId,
      stockId,
    });

    if (!portfolioEntry) {
      portfolioEntry = new Portfolio({
        userId,
        companyId: stock.company,
        stockId,
        quantity: 0,
        currentPrice: stock.currentPrice,
        totalPrice: 0,
      });
    }

    const buyTransaction = new Transaction({
      userId,
      stockId,
      transactionType: 'Buy',
      quantity,
      price: totalPrice,
      isBuy: true,
    });

    await buyTransaction.save();

    user.balance -= totalPrice;

    portfolioEntry.quantity += quantity;
    portfolioEntry.totalPrice = portfolioEntry.quantity * stock.currentPrice;

    await user.save();
    await portfolioEntry.save();

    res.status(201).json({ status: 201, message: 'Stock bought successfully', data: buyTransaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};


exports.sellStock = async (req, res) => {
  try {
    const userId = req.user.id;
    const { stockId, quantity } = req.body;

    const stock = await Stock.findById(stockId);

    if (!stock) {
      return res.status(404).json({ status: 404, message: 'Stock not found' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }

    const portfolioEntry = await Portfolio.findOne({
      userId,
      stockId,
    });

    if (!portfolioEntry || portfolioEntry.quantity < quantity) {
      return res.status(400).json({ status: 400, message: 'Insufficient stock quantity to sell' });
    }

    const totalPrice = stock.currentPrice * quantity;

    const sellTransaction = new Transaction({
      userId,
      stockId,
      transactionType: 'Sell',
      quantity,
      price: totalPrice,
      isBuy: false,
    });

    await sellTransaction.save();

    user.balance += totalPrice;
    portfolioEntry.quantity -= quantity;
    portfolioEntry.totalPrice = portfolioEntry.quantity * stock.currentPrice;

    await user.save();
    await portfolioEntry.save();

    res.status(201).json({ status: 201, message: 'Stock sold successfully', data: sellTransaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};


exports.getBuyTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const buyTransactions = await Transaction.find({
      userId,
      transactionType: 'Buy',
    }).populate('stockId');

    res.status(200).json({ status: 200, message: 'Buy transactions retrieved successfully', data: buyTransactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};


exports.getSellTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sellTransactions = await Transaction.find({
      userId,
      transactionType: 'Sell',
    }).populate('stockId');

    res.status(200).json({ status: 200, message: 'Sell transactions retrieved successfully', data: sellTransactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};


exports.getAllTransactionsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ userId }).populate('stockId');

    res.status(200).json({ status: 200, message: 'Transactions retrieved successfully', data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};


exports.getUserPerformance = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ userId });

    let totalProfit = 0;
    let totalLoss = 0;

    transactions.forEach((transaction) => {
      if (transaction.transactionType === 'Buy') {
        totalLoss += transaction.price;
      } else if (transaction.transactionType === 'Sell') {
        totalProfit += transaction.price;
      }
    });

    const netProfit = totalProfit - totalLoss;

    const totalTrades = transactions.length;

    const performanceData = {
      totalTrades,
      totalProfit,
      totalLoss,
      netProfit,
    };

    res.status(200).json(performanceData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};



exports.getUserPerformanceByDateRange = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dateRange } = req.params;

    const startDate = moment().subtract(dateRange, 'days').toDate();

    const transactions = await Transaction.find({
      userId,
      createdAt: { $gte: startDate },
    });

    let totalProfit = 0;
    let totalLoss = 0;

    transactions.forEach((transaction) => {
      if (transaction.transactionType === 'Buy') {
        totalLoss += transaction.price;
      } else if (transaction.transactionType === 'Sell') {
        totalProfit += transaction.price;
      }
    });

    // Calculate net profit correctly
    const netProfit = totalProfit - totalLoss;

    const totalTrades = transactions.length;

    const performanceData = {
      totalTrades,
      totalProfit,
      totalLoss,
      netProfit,
    };

    res.status(200).json(performanceData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};


