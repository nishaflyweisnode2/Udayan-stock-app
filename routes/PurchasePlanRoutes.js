const express = require('express');
const router = express.Router();

const { buyPlan, getAllPayments, getPaymentById } = require('../controllers/PurchasePlanController');

const authJwt = require("../middleware/auth");



router.post('/api/buy-plan', [authJwt.verifyToken], buyPlan);

router.get('/api/payments', [authJwt.verifyToken], getAllPayments);

router.get('/api/payments/:id', [authJwt.verifyToken], getPaymentById);

module.exports = router;
