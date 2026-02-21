// 模型配置类型
export interface ModelConfig {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'custom'
  baseUrl?: string
  apiKey: string
  model: string
  maxTokens?: number
  temperature?: number
  isDefault?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateModelConfigInput {
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'custom'
  baseUrl?: string
  apiKey: string
  model: string
  maxTokens?: number
  temperature?: number
}

// 对话类型
export interface Conversation {
  id: string
  title: string
  modelId?: string
  kbIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateConversationInput {
  title?: string
  modelId?: string
  kbIds?: string[]
}

// 消息类型
export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  sources?: Source[]
  createdAt: Date
}

export interface Source {
  documentId: string
  documentName: string
  content: string
  similarity: number
}

export interface CreateMessageInput {
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  sources?: Source[]
}

// 知识库类型
export interface KnowledgeBase {
  id: string
  name: string
  description?: string
  embeddingModel: string
  documentCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateKnowledgeBaseInput {
  name: string
  description?: string
  embeddingModel?: string
}

// 文档类型
export interface Document {
  id: string
  kbId: string
  name: string
  content: string
  fileType: 'pdf' | 'docx' | 'txt' | 'md'
  fileSize?: number
  chunkCount?: number
  createdAt: Date
}

export interface CreateDocumentInput {
  kbId: string
  name: string
  content: string
  fileType: 'pdf' | 'docx' | 'txt' | 'md'
  fileSize?: number
}

// 向量块类型
export interface VectorChunk {
  id: string
  documentId: string
  kbId: string
  content: string
  chunkIndex: number
  metadata?: Record<string, any>
}

// 聊天请求类型
export interface ChatRequest {
  message: string
  conversationId?: string
  modelId?: string
  kbIds?: string[]
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}
