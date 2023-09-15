const mongoose = require('mongoose');

const brokerSchema = new mongoose.Schema({
    name: { type: String, },
    image: { type: String },
    title: { type: String, },
    summary: { type: String, },
    experience: {
        title: { type: String, }, experienceYears: { type: String },
        yearsOfExperience: { type: Number, default: 0 }, description: { type: String, },
    },
    education: { collegeName: { type: String, }, year: { type: String, }, description: { type: String, }, }

}, { timestamps: true });

module.exports = mongoose.model('Broker', brokerSchema);
