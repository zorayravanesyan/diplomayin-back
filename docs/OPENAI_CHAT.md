# OpenAI chat integration

Short reference for how the backend talks to OpenAI and persists chat history.

---

## Overview

| Layer          | File                    | Responsibility                                      |
|----------------|-------------------------|-----------------------------------------------------|
| SDK wrapper    | `src/services/openaiService.js` | `chat.completions.create`, error mapping    |
| Business logic | `src/services/chatService.js`    | System prompt, history trim, DB writes      |
| HTTP           | `src/routes/chat.js`             | JWT-protected routes                         |

Flow: validated request → load user + conversation ownership → build `messages[]` → **OpenAI call** → **transaction**: save user + assistant rows.

---

## Environment

| Variable           | Required | Purpose                          |
|--------------------|----------|----------------------------------|
| `OPENAI_API_KEY`   | Yes      | OpenAI Platform API key (secret) |

**Note:** The SDK helper only reads `OPENAI_API_KEY`. If you still use `CHAT_GPT_API_KEY` elsewhere, align `.env` and code so one variable is the single source of truth.

---

## `openaiService.chatCompletion`

- **API:** Chat Completions (`client.chat.completions.create`).
- **Model:** Fixed in code — `gpt-4o-mini` (`src/services/openaiService.js`). Not read from env today.
- **Temperature:** `0.7`.
- **Input:** `{ messages: [{ role, content }, ...] }`.
- **Output:** `{ content: string, usage | null }` (`usage` is whatever OpenAI returns).

### Error mapping

| Situation                                      | HTTP (via app errors) | Client `code`           |
|-----------------------------------------------|-----------------------|-------------------------|
| Missing API key                               | 500                   | `INTERNAL_ERROR`        |
| OpenAI HTTP 401                               | 500                   | `INTERNAL_ERROR`        |
| OpenAI HTTP 429                               | 503                   | `SERVICE_UNAVAILABLE`   |
| OpenAI 400 `context_length_exceeded`          | 400                   | `VALIDATION_ERROR`      |
| Empty assistant content                       | 503                   | `SERVICE_UNAVAILABLE`   |
| Other SDK errors                              | 503                   | `SERVICE_UNAVAILABLE`   |
| Network / non-SDK failures                    | 503                   | `SERVICE_UNAVAILABLE`   |

Secrets are not logged; only fallback logging uses `err.message` string.

---

## `chatService` ↔ OpenAI

### System prompt

Fitness/nutrition coach persona (`buildSystemPrompt`):

- Scoped topics: workouts, food, recovery, hydration, habits, motivation, lifestyle health.
- Off-topic: politely decline and steer back.
- Matches the **user’s message language**.
- Medical: no prescribing/diagnosis; defer to clinician when unsure.
- Injects optional profile lines: `first_name`, `gender` (unless `UNKNOWN`), `weight_kg`, `height_sm`.

### History sent to the model

- Loads the **latest 20** DB messages for the conversation (`DESC` + `LIMIT 20`, then reversed to chronological order).
- Prepends **one** `system` message.
- Appends the **current** user message after history.
- Older rows stay in Postgres but are **not** passed to OpenAI.

### Persistence rules

| Action | OpenAI timing | DB |
|--------|---------------|-----|
| `POST /conversations` **with** `first_message` | Call succeeds **before** message insert | If OpenAI fails, conversation row is **removed** (`destroy`). |
| `POST /conversations/:id/messages`           | Call **before** transaction               | Messages saved only after a successful reply. |

- Assistant reply stores `completion_tokens` in `ChatMessage.tokens` when present.

### Conversation title

If `title` is empty: first **user** message text is truncated to **60 characters** (no extra OpenAI call).

---

## REST API (all require `Authorization: Bearer <accessToken>`)

Base path: `/api/chat` (see `src/app.js`).

| Method | Path | Body | Calls OpenAI? |
|--------|------|------|----------------|
| `POST` | `/conversations` | `{ title?, first_message? }` | Only if `first_message` present |
| `GET` | `/conversations` | — | No |
| `GET` | `/conversations/:id` | — | No |
| `POST` | `/conversations/:id/messages` | `{ content }` (`1..4000` chars) | Yes |
| `DELETE` | `/conversations/:id` | — | No |

Validation (`src/utils/validation.js`): `stripUnknown: true`; invalid bodies → `400` `{ code: 'VALIDATION_ERROR', ... }`.

---

## Quick code review notes

1. **Model & env:** Consider `process.env.OPENAI_MODEL || 'gpt-4o-mini'` so environments can switch models without code changes.
2. **Key aliases:** Optional `CHAT_GPT_API_KEY || OPENAI_API_KEY` avoids breaking older `.env` files.
3. **History limit:** `MAX_HISTORY = 20` is a hard cap; tune if you hit context limits or need longer memory in the model window.
4. **429 vs billing:** Quota/billing issues often surface as 429; responses already map to `SERVICE_UNAVAILABLE` with a clear message.
