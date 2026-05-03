const { ValidationError } = require('../utils/errors.js');
const chatService = require('../services/chatService.js');

function parseConversationId(param) {
  const id = Number.parseInt(param, 10);
  if (!Number.isFinite(id) || id < 1) {
    throw new ValidationError('Invalid conversation id');
  }
  return id;
}

async function createConversation(req, res, next) {
  try {
    const result = await chatService.createConversation(req.user.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function listConversations(req, res, next) {
  try {
    const items = await chatService.listConversations(req.user.id);
    res.json({ conversations: items });
  } catch (error) {
    next(error);
  }
}

async function getConversation(req, res, next) {
  try {
    const id = parseConversationId(req.params.id);
    const result = await chatService.getConversation(req.user.id, id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function sendMessage(req, res, next) {
  try {
    const id = parseConversationId(req.params.id);
    const result = await chatService.sendMessage(req.user.id, id, req.body.content);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function deleteConversation(req, res, next) {
  try {
    const id = parseConversationId(req.params.id);
    const result = await chatService.deleteConversation(req.user.id, id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createConversation,
  listConversations,
  getConversation,
  sendMessage,
  deleteConversation,
};
