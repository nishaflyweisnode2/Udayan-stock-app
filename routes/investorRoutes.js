const express = require('express');
const router = express.Router();

const investorTypeController = require('../controllers/investorController');

const authJwt = require("../middleware/auth");





router.post('/api/investor-types', [authJwt.verifyToken], investorTypeController.createInvestorType);
router.get('/api/investor-types', [authJwt.verifyToken], investorTypeController.getAllInvestorTypes);
router.get('/api/investor-types/:name', [authJwt.verifyToken], investorTypeController.getInvestorTypeByName);



module.exports = router;
