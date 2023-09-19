const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');

const authJwt = require("../middleware/auth");




router.post('/api/create', [authJwt.verifyToken], watchlistController.createWatchlist);
router.post('/api/add-stock', [authJwt.verifyToken], watchlistController.addStockToWatchlist);
router.get('/api/get', [authJwt.verifyToken], watchlistController.getWatchlist);
router.delete('/api/remove-stock/:stockId', [authJwt.verifyToken], watchlistController.removeStockFromWatchlist);



module.exports = router;
