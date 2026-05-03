import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as chatController from '../controllers/chatController.js';
import { validate, createConversationSchema, sendMessageSchema } from '../utils/validation.js';

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
  '/conversations/:id/messages',
  authenticateToken,
  validate(sendMessageSchema),
  chatController.sendMessage
);
router.delete('/conversations/:id', authenticateToken, chatController.deleteConversation);

export default router;
