const express = require('express');
const router = express.Router();
const { createStock, getAllStocks, getStockById, updateStockById, deleteStockById, getTrendingStocks, getLatestStockUpdates, searchStocks, getPopularSearches } = require('../controllers/stockController');

const authJwt = require("../middleware/auth");



router.post('/api/create', [authJwt.verifyToken], createStock);
router.get('/api/', [authJwt.verifyToken], getAllStocks);
router.get('/api/:stockId', [authJwt.verifyToken], getStockById);
router.put('/api/:stockId', [authJwt.verifyToken], updateStockById);
router.delete('/api/:stockId', [authJwt.verifyToken], deleteStockById);
router.get('/api-trending', [authJwt.verifyToken], getTrendingStocks);
router.get('/api-latest-updates', [authJwt.verifyToken], getLatestStockUpdates);
router.get('/api/stocks/search', [authJwt.verifyToken], searchStocks);
router.get('/api/stocks/popular-searches', [authJwt.verifyToken], getPopularSearches);



module.exports = router;
