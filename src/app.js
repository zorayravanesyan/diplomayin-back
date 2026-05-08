const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth.js');
const usersRoutes = require('./routes/users.js');
const chatRoutes = require('./routes/chat.js');
const dietRoutes = require('./routes/diet.js');
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
app.use('/api/diet', dietRoutes);

// Static API docs (ReDoc HTML + OpenAPI yaml)
const POSTMAN_DIR = path.join(__dirname, '..', 'postman');
const REDOC_HTML_PATH = path.join(POSTMAN_DIR, 'redoc-static.html');
const OPENAPI_YAML_PATH = path.join(POSTMAN_DIR, 'openapi.yaml');

app.get('/docs', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.type('html');
  return res.sendFile(REDOC_HTML_PATH, (err) => {
    if (err) {
      // Fall back to JSON if file missing/unreadable
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Docs not found' });
    }
  });
});

app.get('/docs/openapi.yaml', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.type('yaml');
  return res.sendFile(OPENAPI_YAML_PATH, (err) => {
    if (err) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'OpenAPI spec not found' });
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

module.exports = app;
