const express = require('express');
const router = express.Router();

const referralController = require('../controllers/referController');

const authJwt = require("../middleware/auth");


//refer term
router.post('/api/referral-terms', [authJwt.verifyToken], referralController.createOrUpdateReferralTerms);
router.get('/api/referral-terms', [authJwt.verifyToken], referralController.getReferralTerms);




//referal
router.post('/api/referrals', [authJwt.verifyToken], referralController.createReferral);
router.put('/api/referrals/:id/complete', [authJwt.verifyToken], referralController.completeReferral);
router.get('/api/referrals', [authJwt.verifyToken], referralController.getAllReferrals);
router.delete('/api/referrals/:id', [authJwt.verifyToken], referralController.deleteReferral);


module.exports = router;
