const express = require('express');
const { authenticateToken } = require('../middleware/auth.js');
const chatController = require('../controllers/chatController.js');
const { validate, createConversationSchema, sendMessageSchema } = require('../utils/validation.js');

const router = express.Router();

router.post(
  '/conversations',
  authenticateToken,
  validate(createConversationSchema),
  chatController.createConversation
);
router.get('/conversations', authenticateToken, chatController.listConversations);
router.get('/conversations/:id', authenticateToken, chatController.getConversation);
router.post(
  '/conversations/:id/messages/stream',
  authenticateToken,
  validate(sendMessageSchema),
  chatController.sendMessageStream
);
router.post(
  '/conversations/:id/messages',
  authenticateToken,
  validate(sendMessageSchema),
  chatController.sendMessage
);
router.delete('/conversations/:id', authenticateToken, chatController.deleteConversation);

module.exports = router;
