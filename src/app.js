const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.js');
const usersRoutes = require('./routes/users.js');
const chatRoutes = require('./routes/chat.js');
const { errorHandler } = require('./middleware/errorHandler.js');

const app = express();

app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/chat', chatRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

module.exports = app;
