const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../utils/validators');

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/profile', protect, getProfile);

module.exports = router;
