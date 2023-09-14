const express = require('express');
const router = express.Router();

const {
    getUserPortfolio,
    addStockToPortfolio,
    updatePortfolioQuantity,
    removeStockFromPortfolio,
    viewStockFinancials
} = require('../controllers/portfolioController');

const authJwt = require("../middleware/auth");



router.get('/api/portfolio', [authJwt.verifyToken], getUserPortfolio);
router.post('/api/portfolio/add-stock', [authJwt.verifyToken], addStockToPortfolio);
router.put('/api/update/:portfolioId', [authJwt.verifyToken], updatePortfolioQuantity);
router.delete('/api/portfolio/remove-stock/:stockId', [authJwt.verifyToken], removeStockFromPortfolio);
router.get('/api/stock/:stockId', [authJwt.verifyToken], viewStockFinancials);


module.exports = router;
