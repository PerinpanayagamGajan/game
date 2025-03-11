const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  startGame,
  submitAnswer
} = require('../controllers/gameController');

// Game routes
router.post('/start', protect, startGame);
router.post('/submit', protect, submitAnswer);

module.exports = router;