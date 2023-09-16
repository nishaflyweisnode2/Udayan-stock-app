const express = require('express');
const router = express.Router();

const traderController = require('../controllers/traderController');

const authJwt = require("../middleware/auth");


router.post('/api/trader-types', [authJwt.verifyToken], traderController.createTraderType);
router.get('/api/trader-types', [authJwt.verifyToken], traderController.getAllTraderTypes);
router.get('/api/trader-types/:name', [authJwt.verifyToken], traderController.getTraderTypeByName);



module.exports = router;
