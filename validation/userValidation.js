const mongoose = require('mongoose');
const Joi = require('joi');




exports.registrationSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    dateOfBirth: Joi.date().iso().required(),
    phoneNumber: Joi.string().required(),
    userName: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().min(6).required(),
});


exports.generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};



exports.loginSchema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required(),
});


exports.userIdSchema = Joi.object({
    userId: Joi.string().length(24).hex().required(),
});


exports.otpSchema = Joi.object({
    userId: Joi.string().length(24).hex().required(),
    otp: Joi.string().length(6).required(),
});


exports.resendOtpSchema = Joi.object({
    userId: Joi.string().length(24).hex().required()
});


