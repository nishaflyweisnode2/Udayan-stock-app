const mongoose = require('mongoose');

const tutorialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    videoLink: { type: String, required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Tutorial', tutorialSchema);
