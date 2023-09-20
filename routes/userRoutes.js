const express = require('express');
const router = express.Router();

const { registerUser, verifyOTP, resendOTP, loginUser, getAllUsers, getUserById, addBrokerToUser, removeBrokerFromUser, chooseStrategy, getChosenStrategies, uploadImage, createAdminUser } = require('../controllers/userController');

const authJwt = require("../middleware/auth");

const { userImage } = require('../middleware/imageUpload');



// Normal User  create
router.post('/api/register', registerUser)
router.post('/api/verify/:userId', verifyOTP);
router.post('/api/resend/:userId', resendOTP);
router.post('/api/login', loginUser);
router.get('/api/allUser', [authJwt.verifyToken], getAllUsers);
router.get('/api/:userId', [authJwt.verifyToken], getUserById);
router.put('/api/add-broker/:brokerId', [authJwt.verifyToken], addBrokerToUser);
router.delete('/api/brokers/:brokerId', [authJwt.verifyToken], removeBrokerFromUser);
router.put('/api/choose-strategy', [authJwt.verifyToken], chooseStrategy);
router.get('/api/choose-strategy/:userId', [authJwt.verifyToken], getChosenStrategies);
router.put('/api/userImage/:id', [authJwt.verifyToken], userImage.single('image'), uploadImage);




//Admin user create 
router.post('/api/register-admin', createAdminUser);



module.exports = router;
