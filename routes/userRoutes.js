const express = require('express');
const router = express.Router();

const { registerUser, verifyOTP, resendOTP, loginUser, getAllUsers, getUserById } = require('../controllers/userController');

const authJwt = require("../middleware/auth");




router.post('/api/register', registerUser);

router.post('/api/verify/:userId', verifyOTP);

router.post('/api/resend/:userId', resendOTP);

router.post('/api/login', loginUser);

router.get('/api/allUser', [authJwt.verifyToken], getAllUsers);

router.get('/api/:userId', [authJwt.verifyToken], getUserById);


module.exports = router;
