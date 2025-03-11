const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: [true, 'Game ID is required']
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  level: {
    type: String,
    enum: {
      values: ['Easy', 'Medium', 'Hard'],
      message: '{VALUE} is not a valid difficulty level'
    },
    required: [true, 'Game level is required']
  },
  attempts: {
    type: Number,
    required: [true, 'Number of attempts is required'],
    min: [1, 'Attempts must be at least 1']
  }
}, { 
  timestamps: true,
  strict: 'throw' // Throw errors on invalid fields
});

// Indexes for better query performance
scoreSchema.index({ userId: 1 });
scoreSchema.index({ score: -1 }); // For leaderboard sorting
scoreSchema.index({ level: 1, score: -1 }); // For level-specific leaderboards

// Virtual populate setup for getting game details
scoreSchema.virtual('gameDetails', {
  ref: 'Game',
  localField: 'gameId',
  foreignField: '_id',
  justOne: true
});

// Virtual populate setup for getting user details
scoreSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Add a compound index for user-specific level scores
scoreSchema.index({ userId: 1, level: 1, score: -1 });

// Method to get formatted score data
scoreSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.formattedDate = new Date(obj.createdAt).toLocaleDateString();
  return obj;
};

module.exports = mongoose.model('Score', scoreSchema);