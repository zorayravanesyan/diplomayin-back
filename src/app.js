const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.js');
const { errorHandler } = require('./middleware/errorHandler.js');

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

module.exports = app;
