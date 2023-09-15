const express = require('express');
const router = express.Router();

const { createPlan, getAllPlans, updatePlan, getPlanById } = require('../controllers/planController');

const authJwt = require("../middleware/auth");



router.post('/api/plans', [authJwt.verifyToken], createPlan);
router.get('/api/plans', [authJwt.verifyToken], getAllPlans);
router.put('/api/plans/:id', [authJwt.verifyToken], updatePlan);
router.get('/api/plans/:id', [authJwt.verifyToken], getPlanById);


module.exports = router;
