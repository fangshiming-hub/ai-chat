# 开发环境配置指南

## 快速开始（使用 Docker）

### 1. 启动数据库

确保已安装 Docker，然后运行：

```bash
# 启动 PostgreSQL 和 pgAdmin
docker-compose up -d

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f postgres
```

### 2. 数据库连接信息

- **Host**: localhost
- **Port**: 5432
- **Database**: aichat
- **Username**: aichat
- **Password**: aichat123

### 3. 数据库管理工具（pgAdmin）

访问 http://localhost:5050
- 邮箱: admin@example.com
- 密码: admin123

## 无 Docker 的替代方案

### 方案 A: 使用 Mock 数据模式

创建开发模式开关，不连接真实数据库：

```bash
# .env
DEV_MODE=true
MOCK_DATA=true
```

在 `server/db/index.ts` 中根据环境变量返回 mock 数据。

### 方案 C: 使用云数据库

免费的云 PostgreSQL 选项：

1. **Supabase** (https://supabase.com)
   - 免费额度：500MB 存储
   - 注册后获取连接字符串

2. **Neon** (https://neon.tech)
   - 免费额度：500MB 存储
   - 无服务器 PostgreSQL

3. **Railway** (https://railway.app)
   - 免费额度：$5/月信用额度
   - 一键部署 PostgreSQL

获取连接字符串后更新 `.env`：
```bash
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

## 常用命令

```bash
# 启动开发服务器
npm run dev

# 数据库操作（使用 Drizzle Kit）
npx drizzle-kit generate  # 生成迁移
npx drizzle-kit migrate   # 执行迁移
npx drizzle-kit studio    # 打开可视化编辑器

# Docker 管理
docker-compose up -d      # 后台启动
docker-compose down       # 停止
docker-compose down -v    # 停止并删除数据卷
```

## 故障排除

### 端口被占用

如果 5432 端口被占用，修改 `docker-compose.yml`：
```yaml
ports:
  - "5433:5432"  # 使用 5433 端口
```

然后更新 `.env`：
```bash
DATABASE_URL="postgresql://aichat:aichat123@localhost:5433/aichat"
```

### 连接被拒绝

1. 检查 Docker 容器是否运行：`docker-compose ps`
2. 检查防火墙设置
3. 等待数据库完全启动（首次启动需要 10-20 秒）

### 数据库未初始化

首次启动后需要创建表结构：
```bash
npx drizzle-kit migrate
```
