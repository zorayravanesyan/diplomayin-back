const { AppError, ValidationError } = require('../utils/errors.js');
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

function writeSseEvent(res, event, data) {
  if (res.destroyed || res.writableEnded) {
    return false;
  }

  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
  return true;
}

function toSseError(error) {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    };
  }

  console.error('Unhandled stream error:', error);
  return {
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
  };
}

async function sendMessageStream(req, res, next) {
  try {
    const id = parseConversationId(req.params.id);

    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders?.();

    const result = await chatService.sendMessageStream(req.user.id, id, req.body.content, async (chunk) => {
      const didWrite = writeSseEvent(res, 'chunk', { content: chunk });
      if (!didWrite) {
        throw new Error('Client disconnected');
      }
    });

    writeSseEvent(res, 'done', result);
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      return next(error);
    }

    writeSseEvent(res, 'error', toSseError(error));
    return res.end();
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
  sendMessageStream,
  deleteConversation,
};
