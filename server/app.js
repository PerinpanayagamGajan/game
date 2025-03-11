
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/error');

// Create Express app
const app = express();
require('dotenv').config();
// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/game', require('./routes/gameRoutes'));
app.use('/api/scores', require('./routes/scoreRoutes'));

// Error Handler
app.use(errorHandler);

module.exports = app;

