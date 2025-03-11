const Score = require('../models/Score');
const User = require('../models/User');
const mongoose = require('mongoose');

const logError = (error, context) => {
  console.error(`Error in ${context}:`, {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code
  });
};

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

exports.getScores = async (req, res) => {
  try {
    console.log('GetScores request received', {
      headers: req.headers,
      user: req.user
    });

    // Validate database connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection not ready');
    }

    const scores = await Score.find({})
      .populate('userId', 'name')
      .sort({ score: -1, createdAt: -1 })
      .lean();

    console.log('Scores retrieved:', scores.length);

    const formattedScores = scores.map(score => ({
      name: score.userId?.name || 'Anonymous',
      level: score.level,
      score: score.score,
      attempts: score.attempts,
      date: score.createdAt
    }));

    return res.json({
      success: true,
      data: formattedScores
    });
  } catch (error) {
    logError(error, 'getScores');
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve scores',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getUserScores = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId || !validateObjectId(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    console.log('GetUserScores request received', {
      userId,
      headers: req.headers
    });

    const scores = await Score.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const user = await User.findById(userId).select('name').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`Retrieved ${scores.length} scores for user ${user.name}`);

    const formattedScores = scores.map(score => ({
      name: user.name,
      level: score.level,
      score: score.score,
      attempts: score.attempts,
      date: score.createdAt
    }));

    return res.json({
      success: true,
      data: formattedScores
    });
  } catch (error) {
    logError(error, 'getUserScores');
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user scores',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.submitScore = async (req, res) => {
  try {
    const { userId, gameId, score, level } = req.body;

    if (!userId || !validateObjectId(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    if (!gameId || !validateObjectId(gameId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid game ID'
      });
    }

    const newScore = new Score({
      userId,
      gameId,
      score,
      level,
      attempts: 1 // You might want to pass this from the game logic
    });

    await newScore.save();

    return res.json({
      success: true,
      message: 'Score submitted successfully'
    });
  } catch (error) {
    logError(error, 'submitScore');
    return res.status(500).json({
      success: false,
      error: 'Failed to submit score',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};