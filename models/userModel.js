const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    phoneNumber: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String, },
    isVerified: { type: Boolean, default: false },
    userType: { type: String, enum: ["Admin", "User"], default: "User" },
}, { timestamps: true });



const User = mongoose.model('User', userSchema);

module.exports = User;

