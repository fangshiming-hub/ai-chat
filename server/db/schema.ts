import { pgTable, uuid, varchar, text, timestamp, jsonb, real, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// 用户表
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// 模型配置表
export const modelConfigs = pgTable('model_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(), // openai, anthropic, google, custom
  baseUrl: text('base_url'),
  apiKey: text('api_key').notNull(),
  model: varchar('model', { length: 255 }).notNull(),
  maxTokens: integer('max_tokens'),
  temperature: real('temperature').default(0.7),
  isDefault: integer('is_default').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// 对话表
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull().default('New Chat'),
  modelId: uuid('model_id').references(() => modelConfigs.id),
  kbIds: jsonb('kb_ids').default([]).$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// 消息表
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // user, assistant, system
  content: text('content').notNull(),
  sources: jsonb('sources').default([]), // RAG引用来源
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// 知识库表
export const knowledgeBases = pgTable('knowledge_bases', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  embeddingModel: varchar('embedding_model', { length: 255 }).default('text-embedding-3-small'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// 文档表
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  kbId: uuid('kb_id').references(() => knowledgeBases.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  content: text('content').notNull(),
  fileType: varchar('file_type', { length: 50 }).notNull(), // pdf, docx, txt
  fileSize: real('file_size'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// 向量块表
export const vectorChunks = pgTable('vector_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  kbId: uuid('kb_id').references(() => knowledgeBases.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// 关系定义
export const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
  knowledgeBases: many(knowledgeBases),
  modelConfigs: many(modelConfigs)
}))

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id]
  }),
  messages: many(messages)
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id]
  })
}))

export const knowledgeBasesRelations = relations(knowledgeBases, ({ one, many }) => ({
  user: one(users, {
    fields: [knowledgeBases.userId],
    references: [users.id]
  }),
  documents: many(documents),
  chunks: many(vectorChunks)
}))

export const documentsRelations = relations(documents, ({ one, many }) => ({
  knowledgeBase: one(knowledgeBases, {
    fields: [documents.kbId],
    references: [knowledgeBases.id]
  }),
  chunks: many(vectorChunks)
}))

export const modelConfigsRelations = relations(modelConfigs, ({ one }) => ({
  user: one(users, {
    fields: [modelConfigs.userId],
    references: [users.id]
  })
}))

export const vectorChunksRelations = relations(vectorChunks, ({ one }) => ({
  document: one(documents, {
    fields: [vectorChunks.documentId],
    references: [documents.id]
  }),
  knowledgeBase: one(knowledgeBases, {
    fields: [vectorChunks.kbId],
    references: [knowledgeBases.id]
  })
}))
