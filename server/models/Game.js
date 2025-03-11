const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  questionId: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  correctAnswer: {
    type: Number,
    required: true
  },
  attempts: [{
    value: Number,
    timestamp: Date
  }],
  completed: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Game', gameSchema);