#!/bin/bash
# Bash 脚本：启动数据库和开发服务器
# 用法: ./scripts/dev-with-db.sh

set -e

echo -e "\033[0;32m🚀 Starting AI Chat development environment...\033[0m"

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "\033[0;31m❌ Docker is not running. Please start Docker first.\033[0m"
    echo -e "\033[0;33m   Install: https://docs.docker.com/get-docker/\033[0m"
    exit 1
fi

# 检查 docker-compose.yml 是否存在
if [ ! -f "docker-compose.yml" ]; then
    echo -e "\033[0;31m❌ docker-compose.yml not found.\033[0m"
    exit 1
fi

# 启动数据库
echo -e "\033[0;36m📦 Starting PostgreSQL database...\033[0m"
docker-compose up -d

# 等待数据库启动
echo -e "\033[0;33m⏳ Waiting for database to be ready...\033[0m"
MAX_ATTEMPTS=30
ATTEMPT=0
READY=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ] && [ "$READY" = false ]; do
    sleep 1
    ATTEMPT=$((ATTEMPT + 1))

    if docker-compose logs --tail=5 postgres 2>/dev/null | grep -q "database system is ready to accept connections"; then
        READY=true
    fi

    echo -e "\033[0;37m   Attempt $ATTEMPT/$MAX_ATTEMPTS...\033[0m"
done

if [ "$READY" = false ]; then
    echo -e "\033[0;33m⚠️  Database may not be fully ready yet, but continuing...\033[0m"
fi

echo -e "\033[0;32m✅ Database is ready!\033[0m"
echo ""
echo -e "\033[0;36m📊 Database connection info:\033[0m"
echo -e "\033[0;37m   Host: localhost\033[0m"
echo -e "\033[0;37m   Port: 5432\033[0m"
echo -e "\033[0;37m   Database: aichat\033[0m"
echo -e "\033[0;37m   Username: aichat\033[0m"
echo -e "\033[0;37m   Password: aichat123\033[0m"
echo ""
echo -e "\033[0;36m🌐 pgAdmin (Database GUI): http://localhost:5050\033[0m"
echo -e "\033[0;37m   Email: admin@example.com\033[0m"
echo -e "\033[0;37m   Password: admin123\033[0m"
echo ""

# 启动开发服务器
echo -e "\033[0;32m🚀 Starting Nuxt development server...\033[0m"
npm run dev
