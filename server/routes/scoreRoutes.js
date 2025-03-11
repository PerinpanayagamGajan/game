const express = require('express');
const router = express.Router();
const { getScores, getUserScores } = require('../controllers/scoreController');
const { protect } = require('../middleware/auth');

// Public route to get all scores
router.get('/', getScores);

// Protected route to get scores for the authenticated user
router.get('/user', protect, getUserScores);

// Catch-all for undefined routes in score routes
router.all('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

module.exports = router;
