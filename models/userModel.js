const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    image: { type: String },
    dateOfBirth: { type: Date, required: true },
    phoneNumber: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String, },
    isVerified: { type: Boolean, default: false },
    userType: { type: String, enum: ["Admin", "User"], default: "User" },
    brokers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Broker', },],
    strategy: { type: String, enum: ['Investor', 'Trader'], },
    strategyId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Strategy', },],
    totalRewardsEarned: { type: Number, default: 0, },
    totalReferrals: { type: Number, default: 0, },

}, { timestamps: true });



const User = mongoose.model('User', userSchema);

module.exports = User;

