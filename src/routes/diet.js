const express = require('express');
const dietController = require('../controllers/dietController.js');
const { authenticateToken } = require('../middleware/auth.js');

const router = express.Router();

router.get('/random', authenticateToken, dietController.getRandomRecommendations);

module.exports = router;
