const OpenAI = require('openai');
const { AppError, ValidationError, ServiceUnavailableError } = require('../utils/errors.js');

const MODEL = 'gpt-4o-mini';

function getApiKey() {
  return process.env.CHAT_GPT_API_KEY || process.env.OPENAI_API_KEY;
}



function createClient() {
  const apiKey = getApiKey();
  if (!apiKey || !apiKey.trim()) {
    throw new AppError('INTERNAL_ERROR', 'OpenAI API key not configured');
  }

  return new OpenAI({ apiKey: apiKey.trim() });
}

function mapOpenAIError(err) {
  if (err instanceof AppError) {
    return err;
  }
  

  if (err instanceof OpenAI.APIError) {
    if (err.status === 401) {
      return new AppError('INTERNAL_ERROR', 'OpenAI authentication failed');
    }
    if (err.status === 429) {
      const nested =
        typeof err.error === 'object' && err.error !== null ? err.error : {};
      const apiCode =
        nested.code ??
        ('code' in err && typeof err.code === 'string' ? err.code : undefined);

      if (apiCode === 'insufficient_quota') {
        return new ServiceUnavailableError(
          'OpenAI API has no usable quota (billing/credits required). ChatGPT subscription does not include API credits—add billing at platform.openai.com.'
        );
      }
      if (apiCode === 'rate_limit_exceeded') {
        return new ServiceUnavailableError(
          'OpenAI rate limit reached. Wait a minute and retry or lower request frequency.'
        );
      }

      return new ServiceUnavailableError(
        'OpenAI rejected the request due to quota or rate limits (HTTP 429). Check billing and usage at platform.openai.com.'
      );
    }
    if (err.status === 400) {
      const code =
        typeof err.error === 'object' && err.error !== null ? err.error.code : undefined;
      if (code === 'context_length_exceeded') {
        return new ValidationError('Conversation too long for the model context');
      }
    }
    return new ServiceUnavailableError('AI service error');
  }

  console.error('OpenAI unexpected error:', err?.message || String(err));
  return new ServiceUnavailableError('AI service unavailable');
}

async function chatCompletion({ messages }) {
  const client = createClient();

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
    });

    const choice = completion.choices[0];
    const content = choice?.message?.content;
    if (!content) {
      throw new ServiceUnavailableError('AI returned empty response');
    }

    return {
      content,
      usage: completion.usage ?? null,
    };
  } catch (err) {
    throw mapOpenAIError(err);
  }
}

async function* chatCompletionStream({ messages }) {
  const client = createClient();

  try {
    const stream = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      stream: true,
      stream_options: { include_usage: true },
    });

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        yield { content };
      }
      if (chunk.usage) {
        yield { usage: chunk.usage };
      }
    }
  } catch (err) {
    throw mapOpenAIError(err);
  }
}

module.exports = {
  chatCompletion,
  chatCompletionStream,
};
