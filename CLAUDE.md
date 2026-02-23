# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Chat - A full-stack AI conversation system built with Nuxt 3 + Vue 3 + TypeScript. Features multi-model support (OpenAI, Claude, Google Gemini, custom OpenAI-compatible APIs), streaming conversations, knowledge base RAG, and JWT-based user authentication.

## Common Commands

### Development
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production (output to `.output/`)
- `npm run preview` - Preview production build

### Database (Drizzle ORM)
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run pending migrations
- `npm run db:studio` - Open Drizzle Studio (visual database editor)

### Docker (PostgreSQL)
- `docker-compose up -d` - Start PostgreSQL and pgAdmin containers
- `docker-compose down` - Stop containers
- `docker-compose down -v` - Stop and remove data volumes

## Architecture

### Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Nuxt 3 (Vue 3 + Nitro) |
| Styling | Tailwind CSS + Headless UI |
| State | Pinia + Vue composables |
| AI SDK | Vercel AI SDK (@ai-sdk/openai, @ai-sdk/anthropic, @ai-sdk/google) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | bcrypt + jsonwebtoken |

### Project Structure
- `pages/` - File-based routing (index.vue = chat, login.vue = auth, kb/ = knowledge base, settings/models.vue = model config)
- `server/api/` - API routes using Nitro handlers
- `server/db/` - Drizzle schema and database connection
- `server/utils/` - Server-side utilities (AI clients, auth, vector store)
- `composables/` - Vue composables (useAuth.ts, useChat.ts, useConversations.ts)
- `types/` - TypeScript type definitions

### Key Architectural Patterns

**API Response Format**: All APIs return a unified format defined in `server/utils/response.ts`:
```typescript
{ statusCode: 0, msg: "success", data: T }
// statusCode: 0 = success, non-0 = error (see ErrorCodes)
```

**Authentication Flow**:
- JWT stored in localStorage, sent via `Authorization: Bearer <token>` header
- `getCurrentUser()` utility extracts user from JWT in API handlers
- All data queries filter by `userId` for isolation

**Chat Streaming**: The `/api/chat` endpoint uses Vercel AI SDK's `streamText()` with `toDataStreamResponse()`. The frontend reads the stream via `response.body.getReader()` and parses chunks (lines starting with `0:` for text, `3:` for errors).

**RAG Implementation**: Knowledge bases store documents which are chunked and vectorized (OpenAI embeddings). The `vectorStore.ts` utility performs cosine similarity search in-memory (no external vector DB required). Retrieved chunks are injected into the system prompt with citation markers [1], [2], etc.

**Database Schema**: Core tables include `users`, `model_configs`, `conversations`, `messages`, `knowledge_bases`, `documents`, `vector_chunks`. See `server/db/schema.ts` for full definitions.

### Environment Variables
Required in `.env`:
```env
DATABASE_URL="postgresql://aichat:aichat123@localhost:5432/aichat"
NUXT_SESSION_SECRET="your-secret-key"
OPENAI_API_KEY=""  # Optional, for OpenAI models
ANTHROPIC_API_KEY=""  # Optional, for Claude models
GOOGLE_API_KEY=""  # Optional, for Gemini models
```

## Important Notes

- This is a Chinese language application (UI and comments are in Chinese)
- Default development database runs via Docker Compose (PostgreSQL on port 5432, pgAdmin on 5050)
- File uploads are stored in PostgreSQL (not filesystem) - documents table holds content
- Vector search is done in-memory, not via external vector database
