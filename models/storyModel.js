const mongoose = require('mongoose');



const storySchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    content: { type: String, required: true },

}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);
