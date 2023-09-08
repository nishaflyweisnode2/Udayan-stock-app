const express = require('express');
const router = express.Router();

const { buyPlan } = require('../controllers/PurchasePlanController');

const authJwt = require("../middleware/auth");



router.post('/api/buy-plan', buyPlan);


module.exports = router;
