const express = require('express');
const router = express.Router();
const { createStock, getAllStocks, getStockById, updateStockById, deleteStockById } = require('../controllers/stockController');

const authJwt = require("../middleware/auth");



router.post('/api/create', [authJwt.verifyToken], createStock);
router.get('/api/', [authJwt.verifyToken], getAllStocks);
router.get('/api/:stockId', [authJwt.verifyToken], getStockById);
router.put('/api/:stockId', [authJwt.verifyToken], updateStockById);
router.delete('/api/:stockId', [authJwt.verifyToken], deleteStockById);



module.exports = router;
