const express = require('express');
const router = express.Router();

const stockController = require('../controllers/stockBuy&SellController');

const authJwt = require("../middleware/auth");



router.post('/api/buy-stock', [authJwt.verifyToken], stockController.buyStock);
router.post('/api/sell-stock', [authJwt.verifyToken], stockController.sellStock);
router.get('/api/buy-transactions', [authJwt.verifyToken], stockController.getBuyTransactions);
router.get('/api/sell-transactions', [authJwt.verifyToken], stockController.getSellTransactions);
router.get('/api/transactions', [authJwt.verifyToken], stockController.getAllTransactionsForUser);


// User Performance 
router.get('/api/user-performance', [authJwt.verifyToken], stockController.getUserPerformance);
router.get('/api/user-performance/:dateRange', [authJwt.verifyToken], stockController.getUserPerformanceByDateRange);





module.exports = router;
