const express = require('express');
const router = express.Router();

const { addBroker,
    updateBroker,
    getAllBrokers,
    getBroker,
    deleteBroker,
    getPopularBroker,
} = require('../controllers/brokerController');

const { brokerValidationSchema, validateBroker } = require('../validation/brokerValidation');

const { brokerImage } = require('../middleware/imageUpload');

const authJwt = require("../middleware/auth");




router.post('/api/brokers', [authJwt.verifyToken], brokerImage.single('image'), addBroker);
router.put('/api/brokers/:brokerId', [authJwt.verifyToken], brokerImage.single('image'), updateBroker);
router.get('/api/brokers', [authJwt.verifyToken], getAllBrokers);
router.get('/api/brokers/:brokerId', [authJwt.verifyToken], getBroker);
router.delete('/api/brokers/:brokerId', [authJwt.verifyToken], deleteBroker);
router.get('/api/brokers-top10', [authJwt.verifyToken], getPopularBroker);



module.exports = router;
