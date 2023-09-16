const express = require('express');
const router = express.Router();
const termAndConditionController = require('../controllers/term&ConditionController');

const termAndConditionValidation = require('../validation/term&ConditionValidation');

const authJwt = require("../middleware/auth");



router.post('/api/terms-and-conditions', [authJwt.verifyToken], termAndConditionController.createTermAndCondition);
router.get('/api/terms-and-conditions', [authJwt.verifyToken], termAndConditionController.getAllTermAndCondition);
router.get('/api/terms-and-conditions/:id', [authJwt.verifyToken], termAndConditionController.getTermAndConditionById);
router.put('/api/terms-and-conditions/:id', [authJwt.verifyToken], termAndConditionController.updateTermAndConditionById);
router.delete('/api/terms-and-conditions/:id', [authJwt.verifyToken], termAndConditionController.deleteTermAndConditionById);



module.exports = router;
