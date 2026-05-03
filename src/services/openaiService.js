import OpenAI from 'openai';
import { AppError, ValidationError, ServiceUnavailableError } from '../utils/errors.js';

const MODEL = 'gpt-4o-mini';

function getApiKey() {
  return process.env.OPENAI_API_KEY;
}

/**
 * @param {{ messages: Array<{ role: string; content: string }> }} params
 */
export async function chatCompletion({ messages }) {
  const apiKey = getApiKey();
  if (!apiKey || !apiKey.trim()) {
    throw new AppError('INTERNAL_ERROR', 'OpenAI API key not configured');
  }

  const client = new OpenAI({ apiKey: apiKey.trim() });

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
    if (err instanceof OpenAI.APIError) {
      if (err.status === 401) {
        throw new AppError('INTERNAL_ERROR', 'OpenAI authentication failed');
      }
      if (err.status === 429) {
        const nested =
          typeof err.error === 'object' && err.error !== null ? err.error : {};
        const apiCode =
          nested.code ??
          ('code' in err && typeof err.code === 'string' ? err.code : undefined);

        if (apiCode === 'insufficient_quota') {
          throw new ServiceUnavailableError(
            'OpenAI API has no usable quota (billing/credits required). ChatGPT subscription does not include API credits—add billing at platform.openai.com.'
          );
        }
        if (apiCode === 'rate_limit_exceeded') {
          throw new ServiceUnavailableError(
            'OpenAI rate limit reached. Wait a minute and retry or lower request frequency.'
          );
        }

        throw new ServiceUnavailableError(
          'OpenAI rejected the request due to quota or rate limits (HTTP 429). Check billing and usage at platform.openai.com.'
        );
      }
      if (err.status === 400) {
        const code =
          typeof err.error === 'object' && err.error !== null ? err.error.code : undefined;
        if (code === 'context_length_exceeded') {
          throw new ValidationError('Conversation too long for the model context');
        }
      }
      throw new ServiceUnavailableError('AI service error');
    }

    console.error('OpenAI unexpected error:', err?.message || String(err));
    throw new ServiceUnavailableError('AI service unavailable');
  }
}
