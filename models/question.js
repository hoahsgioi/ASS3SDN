const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    options: {
        type: [String],
        required: true
    },
    keywords: {
        type: [String],
        default: []
    },
    correctAnswerIndex: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
