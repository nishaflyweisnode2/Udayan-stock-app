require("dotenv").config();
const User = require('../models/userModel');
const Broker = require('../models/brokerModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');
const Strategy = require('../models/strategyModel');




const { registrationSchema, generateOtp, otpSchema, resendOtpSchema, loginSchema, userIdSchema } = require('../validation/userValidation');


exports.registerUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            dateOfBirth,
            phoneNumber,
            userName,
            password,
            confirmPassword,
        } = req.body

        const { error } = registrationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }

        const existingUser = await User.findOne({ userName: userName });
        if (existingUser) {
            return res.status(400).json({ status: 400, message: 'Username already exists' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ status: 400, message: "Password and Confirm Password must match" });
        }


        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            phoneNumber: phoneNumber,
            userName: userName,
            password: hashedPassword,
            otp: generateOtp()
        });

        await newUser.save();

        return res.status(201).json({ status: 201, data: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};


exports.verifyOTP = async (req, res) => {
    try {
        const userId = req.params.userId
        const { otp } = req.body;

        const { error } = otpSchema.validate({ userId, otp });
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        if (user.otp !== otp) {
            return res.status(401).json({ status: 401, message: 'Invalid OTP' });
        }
        user.isVerified = true;
        await user.save();
        const token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: process.env.ACCESS_TOKEN_TIME });
        console.log("Created Token:", token);
        console.log(process.env.SECRET)


        return res.status(200).json({ status: 200, message: 'OTP verified successfully', token: token, data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};


exports.resendOTP = async (req, res) => {
    try {
        const { error } = resendOtpSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }

        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 400, message: 'User not found' });
        }

        const newOTP = generateOtp();
        user.otp = newOTP;
        await user.save();

        res.status(200).json({ status: 200, message: 'OTP resent successfully', data: user.otp });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};


exports.loginUser = async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { userName, password } = req.body;

        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(401).json({ status: 401, error: 'Invalid username or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ status: 401, error: 'Invalid username or password' });
        }
        user.isVerified = true;

        const token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: process.env.ACCESS_TOKEN_TIME });

        return res.status(200).json({ status: 200, data: token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};


exports.getAllUsers = async (req, res) => {
    try {
        console.log(req.user);
        const users = await User.find();
        if (users.length === 0) {
            return res.status(404).json({ status: 404, message: 'No users found' });
        }
        return res.status(200).json({ status: 200, message: "Successfully retrieved all users", data: users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};


exports.getUserById = async (req, res) => {
    try {
        const { error } = userIdSchema.validate(req.params);
        if (error) {
            return res.status(400).json({ status: 400, error: error.details[0].message });
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ status: 200, message: 'User not found' });
        }

        res.status(200).json({ status: 200, message: "sucessfully Get User", data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};


exports.addBrokerToUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const newBrokerId = req.params.brokerId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const broker = await Broker.findById(newBrokerId);

        if (!broker) {
            return res.status(404).json({ status: 404, message: 'Broker not found' });
        }

        if (user.brokers.includes(newBrokerId)) {
            return res.status(400).json({ status: 400, message: 'Broker already exists in user profile' });
        }

        user.brokers.push(newBrokerId);
        await user.save();

        return res.status(200).json({ status: 200, message: 'Broker added to user successfully', data: user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.removeBrokerFromUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const brokerId = req.params.brokerId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const broker = await Broker.findById(brokerId);

        if (!broker) {
            return res.status(404).json({ status: 404, message: 'Broker not found' });
        }

        const brokerObjectId = new mongoose.Types.ObjectId(brokerId);

        if (!user.brokers.includes(brokerObjectId)) {
            return res.status(404).json({ status: 404, message: 'Broker not found in user profile' });
        }

        user.brokers = user.brokers.filter((id) => id.toString() !== brokerObjectId.toString());
        await user.save();

        return res.status(200).json({ status: 200, message: 'Broker removed from user successfully', data: user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.chooseStrategy = async (req, res) => {
    try {
        const userId = req.user.id;
        const { strategy } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        if (user.strategy !== strategy) {
            if (strategy !== 'Investor' && strategy !== 'Trader') {
                return res.status(400).json({ status: 400, message: 'Invalid strategy' });
            }
        }

        console.log("Current User Strategy:", user.strategy);

        const newStrategy = await Strategy.findOne({ name: strategy });

        if (!newStrategy) {
            return res.status(404).json({ status: 404, message: 'New strategy not found' });
        }

        user.strategy = strategy;
        user.strategyId = [newStrategy._id];
        await user.save();

        res.status(200).json({ status: 200, message: 'User strategy updated successfully', data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getChosenStrategies = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log("userId", userId);

        const user = await User.findById(userId)
            .populate('strategyId')
            .exec();

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const chosenStrategies = user.strategyId.map(strategy => strategy);

        res.status(200).json({ status: 200, message: 'Chosen strategies retrieved successfully', data: chosenStrategies });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.uploadImage = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.image = req.file.path;

        const updateduser = await user.save();

        res.status(200).json({ status: 200, message: "User Image Updated Successfully", data: updateduser });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.createAdminUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            dateOfBirth,
            phoneNumber,
            userName,
            password,
            confirmPassword,
        } = req.body;

        const existingUser = await User.findOne({ userName });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ status: 400, message: "Password and Confirm Password must match" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const adminUser = new User({
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            phoneNumber: phoneNumber,
            userName: userName,
            password: hashedPassword,
            otp: generateOtp(),
            userType: "Admin"
        });

        await adminUser.save();

        res.status(201).json({ message: 'Admin user created successfully', data: adminUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

