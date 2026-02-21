# AI Chat 项目结构文档

## 项目概述
基于 Nuxt 3 + Vue 3 + TypeScript 的全栈 AI 对话系统，支持多模型切换、知识库 RAG 和用户认证。

---

## 已完成功能

### Phase 1: 基础架构
- [x] Nuxt 3 项目初始化
- [x] Tailwind CSS + Headless UI 配置
- [x] TypeScript 类型定义
- [x] 数据库 Schema 设计 (Drizzle ORM)
- [x] 基础布局组件

### Phase 2: 对话核心
- [x] 流式对话 API
- [x] Vercel AI SDK 集成
- [x] 前端对话界面
- [x] 流式响应渲染

### Phase 3: 模型管理
- [x] 模型配置 CRUD API
- [x] 多提供商支持 (OpenAI/Anthropic/Google/Custom)
- [x] 模型选择器组件
- [x] 默认模型设置

### Phase 4: 知识库基础
- [x] 知识库 CRUD API
- [x] 文档上传 API
- [x] 文本分块
- [x] 知识库管理页面

### Phase 5: RAG 向量检索
- [x] 向量存储工具
- [x] 文本向量化 (OpenAI Embedding)
- [x] 余弦相似度检索
- [x] 上下文注入 Prompt
- [x] 引用来源显示

### Phase 6: 对话历史管理
- [x] 对话列表侧边栏
- [x] 对话 CRUD API
- [x] useConversations composable

### Phase 7: 用户认证
- [x] 用户注册/登录 API (JWT)
- [x] bcrypt 密码加密
- [x] 登录/注册页面
- [x] useAuth composable
- [x] 用户数据隔离
- [x] 认证中间件

---

## 项目结构

```
ai-chat-bykimi/
├── .nuxt/                    # Nuxt 生成文件 (自动生成)
├── .output/                  # 构建输出 (自动生成)
├── app/                      # Nuxt App 目录
├── assets/
│   └── css/
│       └── main.css          # Tailwind 入口
├── components/
│   ├── chat/
│   │   ├── ChatInput.vue     # 消息输入
│   │   ├── ChatMessage.vue   # 消息气泡
│   │   ├── ChatSidebar.vue   # 对话侧边栏
│   │   └── ModelSelector.vue # 模型选择器
│   └── ui/
│       └── MultiSelect.vue   # 多选下拉框
├── composables/
│   ├── useAuth.ts            # 认证逻辑
│   ├── useChat.ts            # 对话逻辑
│   └── useConversations.ts   # 对话历史管理
├── layouts/
│   └── default.vue           # 默认布局
├── pages/
│   ├── index.vue             # 对话首页
│   ├── kb/
│   │   └── index.vue         # 知识库管理
│   ├── login.vue             # 登录/注册页面
│   └── settings/
│       └── models.vue        # 模型设置
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.post.ts       # 用户登录
│   │   │   ├── me.get.ts           # 获取当前用户
│   │   │   └── register.post.ts    # 用户注册
│   │   ├── chat/
│   │   │   └── index.post.ts       # 流式对话
│   │   ├── conversations/
│   │   │   ├── index.get.ts        # 获取对话列表
│   │   │   ├── index.post.ts       # 创建对话
│   │   │   ├── [id].get.ts         # 获取对话详情
│   │   │   └── [id].delete.ts      # 删除对话
│   │   ├── kb/
│   │   │   ├── index.get.ts        # 获取知识库列表
│   │   │   ├── index.post.ts       # 创建知识库
│   │   │   ├── [id].delete.ts      # 删除知识库
│   │   │   ├── [id]/index.get.ts   # 获取知识库详情
│   │   │   ├── [id]/documents.post.ts  # 上传文档
│   │   │   └── [id]/query.post.ts  # 知识库查询
│   │   └── models/
│   │       ├── index.get.ts        # 获取模型列表
│   │       ├── index.post.ts       # 添加模型
│   │       ├── [id].delete.ts      # 删除模型
│   │       └── [id]/default.post.ts # 设置默认模型
│   ├── db/
│   │   ├── index.ts            # 数据库连接
│   │   └── schema.ts           # 表结构定义
│   └── utils/
│       ├── ai.ts               # AI 客户端封装
│       ├── auth.ts             # JWT/bcrypt 工具
│       ├── documents.ts        # 文档解析工具
│       ├── embeddings.ts       # 文本向量化
│       ├── getCurrentUser.ts   # 获取当前用户
│       └── vectorStore.ts      # 向量存储
├── stores/                     # Pinia 状态管理
├── types/
│   └── index.ts                # TypeScript 类型定义
├── .env                        # 环境变量
├── .env.example                # 环境变量示例
├── drizzle.config.ts           # Drizzle ORM 配置
├── nuxt.config.ts              # Nuxt 配置
├── package.json                # 项目依赖
├── README.md                   # 项目说明
├── tailwind.config.ts          # Tailwind 配置
└── tsconfig.json               # TypeScript 配置
```

---

## 数据库表结构

### users (用户表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| email | varchar(255) | 邮箱（唯一） |
| passwordHash | text | bcrypt 加密密码 |
| name | varchar(255) | 用户昵称 |
| avatar | text | 头像 URL |
| createdAt | timestamp | 创建时间 |
| updatedAt | timestamp | 更新时间 |

### model_configs (模型配置表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| userId | uuid | 所属用户 ID |
| name | varchar(255) | 模型显示名称 |
| provider | varchar(50) | openai/anthropic/google/custom |
| baseUrl | text | 自定义 API 基础 URL |
| apiKey | text | API 密钥 |
| model | varchar(255) | 模型 ID |
| maxTokens | integer | 最大 token 数 |
| temperature | real | 温度参数 |
| isDefault | integer | 是否为默认模型 |
| createdAt | timestamp | 创建时间 |
| updatedAt | timestamp | 更新时间 |

### conversations (对话表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| userId | uuid | 所属用户 ID |
| title | varchar(255) | 对话标题 |
| modelId | uuid | 使用的模型 |
| kbIds | jsonb | 关联的知识库 ID 数组 |
| createdAt | timestamp | 创建时间 |
| updatedAt | timestamp | 更新时间 |

### messages (消息表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| conversationId | uuid | 所属对话 |
| role | varchar(20) | user/assistant/system |
| content | text | 消息内容 |
| sources | jsonb | RAG 引用来源 |
| createdAt | timestamp | 创建时间 |

### knowledge_bases (知识库表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| userId | uuid | 所属用户 ID |
| name | varchar(255) | 知识库名称 |
| description | text | 描述 |
| embeddingModel | varchar(255) | 向量化模型 |
| createdAt | timestamp | 创建时间 |
| updatedAt | timestamp | 更新时间 |

### documents (文档表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| kbId | uuid | 所属知识库 |
| name | varchar(255) | 文档名称 |
| content | text | 文档内容 |
| fileType | varchar(50) | pdf/docx/txt/md |
| fileSize | real | 文件大小 |
| createdAt | timestamp | 创建时间 |

### vector_chunks (向量块表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| documentId | uuid | 所属文档 |
| kbId | uuid | 所属知识库 |
| content | text | 分块内容 |
| chunkIndex | integer | 分块索引 |
| metadata | jsonb | 元数据 |
| createdAt | timestamp | 创建时间 |

---

## API 路由清单

| 路由 | 方法 | 功能 | 认证 |
|------|------|------|------|
| /api/auth/register | POST | 用户注册 | 否 |
| /api/auth/login | POST | 用户登录 | 否 |
| /api/auth/me | GET | 获取当前用户 | 是 |
| /api/chat | POST | 流式对话 | 是 |
| /api/conversations | GET | 获取对话列表 | 是 |
| /api/conversations | POST | 创建对话 | 是 |
| /api/conversations/:id | GET | 获取对话详情 | 是 |
| /api/conversations/:id | DELETE | 删除对话 | 是 |
| /api/models | GET | 获取模型列表 | 是 |
| /api/models | POST | 添加模型 | 是 |
| /api/models/:id | DELETE | 删除模型 | 是 |
| /api/models/:id/default | POST | 设置默认模型 | 是 |
| /api/kb | GET | 获取知识库列表 | 是 |
| /api/kb | POST | 创建知识库 | 是 |
| /api/kb/:id | GET | 获取知识库详情 | 是 |
| /api/kb/:id | DELETE | 删除知识库 | 是 |
| /api/kb/:id/documents | POST | 上传文档 | 是 |
| /api/kb/:id/query | POST | 知识库查询 | 是 |

---

## 环境变量配置

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/aichat"

# AI API Keys
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_API_KEY="..."

# 应用密钥 (用于 JWT 签名)
NUXT_SESSION_SECRET="your-secret-key-here"
```

---

## 开发命令

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 数据库操作
npm run db:push      # 推送 schema 到数据库
npm run db:generate  # 生成迁移文件
npm run db:migrate   # 执行迁移
npm run db:studio    # 打开 Drizzle Studio

# 构建
npm run build
npm run preview
```

---

## 认证流程

1. **注册/登录**
   - 访问 `/login` 页面
   - 后端使用 bcrypt 加密存储密码
   - 登录成功后返回 JWT Token

2. **Token 存储**
   - 前端将 Token 存储在 localStorage
   - 每次 API 请求携带 `Authorization: Bearer <token>` 头

3. **API 认证**
   - 后端验证 JWT Token
   - 提取用户 ID
   - 所有数据查询添加 `userId` 过滤

4. **数据隔离**
   - 用户只能访问自己的数据
   - 删除操作验证数据所有权

---

## 完成功能清单

- [x] 用户注册/登录 (JWT + bcrypt)
- [x] 多模型支持 (OpenAI/Claude/Gemini)
- [x] 流式对话
- [x] 知识库管理
- [x] RAG 向量检索
- [x] 对话历史管理
- [x] 用户数据隔离

**核心功能全部完成！**
