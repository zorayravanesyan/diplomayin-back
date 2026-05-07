const { Op } = require('sequelize');
const { User, UserSettings, ChatConversation, ChatMessage } = require('../models/index.js');
const { sequelize } = require('../config/database.js');
const { NotFoundError, ServiceUnavailableError } = require('../utils/errors.js');
const openaiService = require('./openaiService.js');

const MAX_HISTORY = 20;

function buildSystemPrompt(user) {
  const parts = [
    'You are a supportive fitness and nutrition assistant.',
    'Focus on workout planning, nutrition, recovery, hydration, goals, habits, injury prevention tips, health metrics, motivation, healthy lifestyle advice.',
    'If asked about topics clearly outside fitness/nutrition/health lifestyle, politely say you specialize in fitness and wellness and steer back briefly.',
    'Match the language of the user message.',
    'Do not say you examined personal files unless the user mentions their profile explicitly.',
    'Do not prescribe medication or diagnose medical conditions; suggest seeing a clinician when risks are unclear.',
    'Prefer concrete, actionable advice tailored to stated goals.',
  ];

  const profileBits = [];
  if (user?.first_name) {
    profileBits.push(`Preferred name/context: ${user.first_name}`);
  }
  if (user?.gender && user.gender !== 'UNKNOWN') {
    profileBits.push(`Gender: ${user.gender}`);
  }
  if (user?.settings?.weight_kg != null && user.settings.weight_kg !== '') {
    profileBits.push(`Weight (kg): ${user.settings.weight_kg}`);
  }
  if (user?.settings?.height_sm != null && user.settings.height_sm !== '') {
    profileBits.push(`Height (cm): ${user.settings.height_sm}`);
  }

  if (profileBits.length) {
    parts.push(`User notes (trust but verify):\n${profileBits.join('; ')}.`);
  }

  return parts.join(' ');
}

async function fetchHistoryRows(conversationId) {
  const rows = await ChatMessage.findAll({
    where: { conversation_id: conversationId },
    attributes: ['role', 'content'],
    order: [['created_at', 'DESC']],
    limit: MAX_HISTORY,
  });
  return rows.reverse();
}

async function buildMessageContext(userId, conversationId, content) {
  const [conversation, profileUser] = await Promise.all([
    ChatConversation.findOne({
      where: { id: conversationId, user_id: userId },
      attributes: ['id', 'title'],
    }),
    User.findByPk(userId, {
      attributes: ['gender', 'first_name'],
      include: [
        {
          model: UserSettings,
          as: 'settings',
          attributes: ['weight_kg', 'height_sm'],
          required: false,
        },
      ],
    }),
  ]);

  if (!conversation) {
    throw new NotFoundError('Conversation not found');
  }

  const history = await fetchHistoryRows(conversation.id);

  return {
    conversation,
    messagesForApi: [
      { role: 'system', content: buildSystemPrompt(profileUser) },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content },
    ],
  };
}

async function persistMessagePair(conversation, content, reply, usage) {
  return sequelize.transaction(async (t) => {
    const created = await ChatMessage.bulkCreate(
      [
        { conversation_id: conversation.id, role: 'user', content },
        {
          conversation_id: conversation.id,
          role: 'assistant',
          content: reply,
          tokens: usage?.completion_tokens ?? null,
        },
      ],
      { transaction: t, returning: true }
    );

    const patch = {};
    if (!conversation.title) {
      patch.title = content.slice(0, 60);
    }
    if (Object.keys(patch).length) {
      await conversation.update(patch, { transaction: t });
    }

    await conversation.reload({
      attributes: ['id', 'title', 'updated_at'],
      transaction: t,
    });

    return {
      user_message: created[0].toJSON(),
      assistant_message: created[1].toJSON(),
      conversation: {
        id: conversation.id,
        updated_at: conversation.updated_at,
      },
    };
  });
}

async function createConversation(userId, { title: titleRaw, first_message: firstMessage }) {
  const title =
    typeof titleRaw === 'string' && titleRaw.trim().length > 0 ? titleRaw.trim().slice(0, 120) : null;

  const conversation = await ChatConversation.create({
    user_id: userId,
    title,
  });

  if (!firstMessage) {
    return { conversation: conversation.toJSON(), messages: [] };
  }

  const user = await User.findByPk(userId, {
    attributes: ['gender', 'first_name'],
    include: [
      {
        model: UserSettings,
        as: 'settings',
        attributes: ['weight_kg', 'height_sm'],
        required: false,
      },
    ],
  });

  const messagesForApi = [
    { role: 'system', content: buildSystemPrompt(user) },
    { role: 'user', content: firstMessage },
  ];

  let reply;
  let usage;
  try {
    ({ content: reply, usage } = await openaiService.chatCompletion({ messages: messagesForApi }));
  } catch (err) {
    await conversation.destroy();
    throw err;
  }

  return sequelize.transaction(async (t) => {
    const created = await ChatMessage.bulkCreate(
      [
        { conversation_id: conversation.id, role: 'user', content: firstMessage },
        {
          conversation_id: conversation.id,
          role: 'assistant',
          content: reply,
          tokens: usage?.completion_tokens ?? null,
        },
      ],
      { transaction: t, returning: true }
    );

    const patch = {};
    if (!conversation.title) {
      patch.title = firstMessage.slice(0, 60);
    }
    if (Object.keys(patch).length) {
      await conversation.update(patch, { transaction: t });
    }
    await conversation.reload({
      attributes: ['id', 'title', 'user_id', 'created_at', 'updated_at'],
      transaction: t,
    });

    return {
      conversation: conversation.toJSON(),
      messages: created.map((m) => m.toJSON()),
    };
  });
}

async function listConversations(userId) {
  const conversations = await ChatConversation.findAll({
    where: { user_id: userId },
    attributes: ['id', 'title', 'updated_at'],
    order: [['updated_at', 'DESC']],
  });

  if (!conversations.length) {
    return [];
  }

  const ids = conversations.map((c) => c.id);
  const candidates = await ChatMessage.findAll({
    where: { conversation_id: { [Op.in]: ids } },
    attributes: ['conversation_id', 'content', 'created_at'],
    order: [['created_at', 'DESC']],
  });

  const seen = new Set();
  const previewByConv = {};
  for (const row of candidates) {
    const cid = row.conversation_id;
    if (seen.has(cid)) {
      continue;
    }
    seen.add(cid);
    previewByConv[cid] =
      typeof row.content === 'string'
        ? row.content.slice(0, 120)
        : '';

    if (seen.size === ids.length) {
      break;
    }
  }

  return conversations.map((c) => ({
    id: c.id,
    title: c.title,
    updated_at: c.updated_at,
    last_message_preview: previewByConv[c.id] ?? null,
  }));
}

async function getConversation(userId, conversationId) {
  const conversation = await ChatConversation.findOne({
    where: { id: conversationId, user_id: userId },
    attributes: ['id', 'title', 'created_at', 'updated_at'],
  });

  if (!conversation) {
    throw new NotFoundError('Conversation not found');
  }

  const messages = await ChatMessage.findAll({
    where: { conversation_id: conversation.id },
    attributes: ['id', 'role', 'content', 'tokens', 'created_at'],
    order: [['created_at', 'ASC']],
  });

  return {
    conversation: conversation.toJSON(),
    messages: messages.map((m) => m.toJSON()),
  };
}

async function sendMessage(userId, conversationId, content) {
  const { conversation, messagesForApi } = await buildMessageContext(userId, conversationId, content);
  const { content: reply, usage } = await openaiService.chatCompletion({ messages: messagesForApi });

  return persistMessagePair(conversation, content, reply, usage);
}

async function sendMessageStream(userId, conversationId, content, onChunk) {
  const { conversation, messagesForApi } = await buildMessageContext(userId, conversationId, content);
  let reply = '';
  let usage = null;

  for await (const event of openaiService.chatCompletionStream({ messages: messagesForApi })) {
    if (event.content) {
      reply += event.content;
      await onChunk(event.content);
    }
    if (event.usage) {
      usage = event.usage;
    }
  }

  if (!reply) {
    throw new ServiceUnavailableError('AI returned empty response');
  }

  return persistMessagePair(conversation, content, reply, usage);
}

async function deleteConversation(userId, conversationId) {
  const conversation = await ChatConversation.findOne({
    where: { id: conversationId, user_id: userId },
    attributes: ['id'],
  });

  if (!conversation) {
    throw new NotFoundError('Conversation not found');
  }

  await conversation.destroy();
  return { ok: true };
}

module.exports = {
  createConversation,
  listConversations,
  getConversation,
  sendMessage,
  sendMessageStream,
  deleteConversation,
};
