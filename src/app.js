<<<<<<< HEAD
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import { errorHandler } from './middleware/errorHandler.js';
=======
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.js');
const usersRoutes = require('./routes/users.js');
const { errorHandler } = require('./middleware/errorHandler.js');
>>>>>>> 0e79217d6450744c0062f74289ded1a5fda20daf

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
<<<<<<< HEAD
app.use('/api/chat', chatRoutes);
=======
app.use('/api/users', usersRoutes);
>>>>>>> 0e79217d6450744c0062f74289ded1a5fda20daf

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

module.exports = app;
