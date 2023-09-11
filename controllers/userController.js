require("dotenv").config();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');


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