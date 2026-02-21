# AI Chat - 网页版 AI 对话系统

基于 Nuxt 3 + Vue 3 + TypeScript 开发的全栈 AI 对话应用，支持多模型切换和知识库（RAG）。

## 功能特性

- 多模型支持：OpenAI、Claude、Google Gemini、自定义 OpenAI 兼容 API
- 流式对话：实时显示 AI 回复
- 知识库管理：上传文档（PDF/DOCX/TXT），RAG 检索增强
- 对话历史：保存多轮对话
- 模型配置：动态添加、删除、切换 AI 模型

## 技术栈

| 技术 | 用途 |
|------|------|
| Nuxt 3 | Vue 全栈框架 |
| Tailwind CSS | 原子化 CSS |
| Headless UI | 无样式 UI 组件 |
| Vercel AI SDK | AI 模型统一调用 |
| Drizzle ORM | TypeScript ORM |
| PostgreSQL | 数据库 |
| Pinia | 状态管理 |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/aichat"
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
```

### 3. 初始化数据库

```bash
# 创建 PostgreSQL 数据库后执行
npm run db:push
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 使用指南

### 添加 AI 模型

1. 访问 http://localhost:3000/settings/models
2. 点击"添加模型"
3. 填写模型信息：
   - 名称：如 "GPT-4"
   - 提供商：选择 OpenAI/Anthropic/Google/自定义
   - API Key：你的 API 密钥
   - 模型 ID：如 "gpt-4", "claude-3-opus-20240229"
4. 保存后即可在对话页面使用

### 使用知识库

1. 访问 http://localhost:3000/kb 创建知识库
2. 上传文档（支持 PDF、DOCX、TXT、Markdown）
3. 在对话页面选择知识库
4. AI 将基于知识库内容回答问题

## 项目结构

```
.
├── components/          # Vue 组件
│   ├── chat/           # 对话组件
│   ├── kb/             # 知识库组件
│   └── ui/             # 通用 UI
├── pages/              # 页面路由
│   ├── index.vue       # 对话页
│   ├── kb/             # 知识库管理
│   └── settings/       # 设置页面
├── server/             # 后端 API
│   ├── api/            # API 路由
│   ├── db/             # 数据库 Schema
│   └── utils/          # 工具函数
├── composables/        # 组合式函数
├── stores/             # Pinia 状态
└── types/              # TypeScript 类型
```

## 部署

### Vercel 部署

```bash
npm run build
```

上传 `.output` 目录到 Vercel，配置环境变量即可。

### Docker 部署

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
CMD ["node", ".output/server/index.mjs"]
```

## 功能清单

- [x] 用户注册/登录 (JWT + bcrypt)
- [x] 多模型支持 (OpenAI/Claude/Gemini/自定义)
- [x] 流式对话
- [x] 知识库管理
- [x] RAG 向量检索
- [x] 对话历史管理
- [x] 用户数据隔离

## 待优化项

- [ ] 移动端适配
- [ ] 深色模式
- [ ] Markdown 渲染
- [ ] 代码块高亮

## License

MIT
