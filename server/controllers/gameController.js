const Game = require('../models/Game');
const Score = require('../models/Score');
const axios = require('axios');
const mongoose = require('mongoose');

const BANANA_API_URL = 'https://marcconrad.com/uob/banana/api.php?out=csv&base64=yes';
const FALLBACK_QUESTION = {
  question: 'https://marcconrad.com/uob/banana/q/1.jpg',
  answer: 5
};

// Enhanced error logging
const logError = (error, context, additionalInfo = {}) => {
  console.error(`Error in ${context}:`, {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    ...additionalInfo
  });
};

const getBananaQuestion = async () => {
  try {
    console.log('Fetching banana question from API');
    const response = await axios.get(BANANA_API_URL, {
      timeout: 5000 // 5 second timeout
    });

    if (!response.data) {
      throw new Error('Empty response from Banana API');
    }

    console.log('Received API response, processing data');
    const [imageBase64, answer] = response.data.split(',');

    if (!imageBase64 || !answer) {
      throw new Error('Invalid API response format: missing image or answer');
    }

    const parsedAnswer = parseInt(answer.trim());
    if (isNaN(parsedAnswer) || parsedAnswer < 0 || parsedAnswer > 9) {
      throw new Error(`Invalid answer value: ${answer}`);
    }

    const questionData = {
      id: Date.now().toString(),
      question: `data:image/png;base64,${imageBase64}`,
      answer: parsedAnswer
    };

    console.log('Successfully processed question data');
    return questionData;

  } catch (error) {
    logError(error, 'getBananaQuestion', {
      apiUrl: BANANA_API_URL,
      responseReceived: !!error.response
    });
    
    console.log('Using fallback question due to API error');
    return {
      id: Date.now().toString(),
      ...FALLBACK_QUESTION
    };
  }
};

const validateGameLevel = (level) => {
  const validLevels = ['Easy', 'Medium', 'Hard'];
  return validLevels.includes(level);
};

const startGame = async (req, res) => {
  try {
    console.log('Starting new game session');
    const { level } = req.body;

    // Authentication check
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    // Level validation
    if (!validateGameLevel(level)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid game level. Must be Easy, Medium, or Hard'
      });
    }

    // Database connection check
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection not ready');
    }

    // Get question
    const bananaQuestion = await getBananaQuestion();
    console.log('Question obtained, creating game record');

    // Create and validate game instance
    const game = new Game({
      userId: req.user._id,
      level,
      questionId: bananaQuestion.id,
      correctAnswer: bananaQuestion.answer,
      question: bananaQuestion.question,
      attempts: [],
      completed: false
    });

    // Validate game data
    await game.validate();
    await game.save();

    console.log('Game created successfully:', { gameId: game._id, level });

    return res.status(201).json({
      success: true,
      data: {
        gameId: game._id,
        question: bananaQuestion.question,
        level: game.level
      }
    });

  } catch (error) {
    logError(error, 'startGame', {
      userId: req.user?._id,
      requestBody: req.body
    });

    return res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Failed to start game'
    });
  }
};

const submitAnswer = async (req, res) => {
  try {
    console.log('Processing answer submission');
    const { gameId, answer } = req.body;

    // Validate gameId
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid game ID format'
      });
    }

    // Validate answer
    const parsedAnswer = parseInt(answer);
    if (isNaN(parsedAnswer) || parsedAnswer < 0 || parsedAnswer > 9) {
      return res.status(400).json({
        success: false,
        error: 'Answer must be a number between 0 and 9'
      });
    }

    // Find and validate game
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    // Authorization check
    if (game.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this game'
      });
    }

    // Check if game is already completed
    if (game.completed) {
      return res.status(400).json({
        success: false,
        error: 'Game is already completed'
      });
    }

    // Record attempt
    game.attempts.push({
      value: parsedAnswer,
      timestamp: Date.now()
    });

    const isCorrect = parsedAnswer === game.correctAnswer;

    if (isCorrect) {
      console.log('Correct answer submitted, processing game completion');
      game.completed = true;
      game.score = calculateScore(game.attempts.length, game.level);

      // Create score record
      try {
        const scoreData = {
          userId: req.user._id,
          gameId: game._id,
          level: game.level,
          score: game.score,
          attempts: game.attempts.length
        };

        await Score.create(scoreData);
        console.log('Score record created successfully');
      } catch (scoreError) {
        logError(scoreError, 'createScoreRecord', { gameId, userId: req.user._id });
        // Continue with game save even if score creation fails
      }
    }

    await game.save();
    console.log('Game state updated successfully');

    return res.json({
      success: true,
      data: {
        correct: isCorrect,
        completed: game.completed,
        score: game.score,
        attempts: game.attempts.length
      }
    });

  } catch (error) {
    logError(error, 'submitAnswer', {
      gameId: req.body.gameId,
      userId: req.user?._id
    });

    return res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Failed to submit answer'
    });
  }
};

const calculateScore = (attempts, level) => {
  const baseScore = 100;
  const deductions = {
    'Easy': 5,
    'Medium': 10,
    'Hard': 15
  };
  
  const score = Math.max(baseScore - (attempts - 1) * deductions[level], 10);
  console.log('Calculated score:', { attempts, level, score });
  return score;
};

module.exports = {
  startGame,
  submitAnswer
};