const express = require('express');
const router = express.Router();

const strategyController = require('../controllers/strategyController');

const { strategyImage } = require('../middleware/imageUpload');

const authJwt = require("../middleware/auth");



router.post('/api/strategies', [authJwt.verifyToken], strategyImage.single('image'), strategyController.createStrategy);
router.get('/api/strategies', [authJwt.verifyToken], strategyController.getAllStrategies);
router.put('/api/strategies/:strategyId', [authJwt.verifyToken], strategyImage.single('image'), strategyController.updateStrategy);
router.delete('/api/strategies/:strategyId', [authJwt.verifyToken], strategyController.deleteStrategy);


module.exports = router;
