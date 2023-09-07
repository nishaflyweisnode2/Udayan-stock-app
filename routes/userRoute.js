const express = require('express');
const router = express.Router();
const { registerUser, verifyOTP, resendOTP, loginUser, getAllUsers, getUserById } = require('../controllers/userController');

// const authMiddleware = require('../middleware/authMiddleware');



router.post('/api/register', registerUser);

router.post('/api/verify/:userId', verifyOTP);

router.post('/api/resend/:userId', resendOTP);

router.post('/api/login', loginUser);

router.get('/api/allUser', getAllUsers);

router.get('/api/:userId', getUserById);


module.exports = router;
