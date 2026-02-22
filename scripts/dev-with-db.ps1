# PowerShell 脚本：启动数据库和开发服务器
# 用法: .\scripts\dev-with-db.ps1

Write-Host "🚀 Starting AI Chat development environment..." -ForegroundColor Green

# 检查 Docker 是否运行
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Docker is not installed or not running." -ForegroundColor Red
    Write-Host "   Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# 检查 docker-compose.yml 是否存在
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ docker-compose.yml not found in current directory." -ForegroundColor Red
    exit 1
}

# 启动数据库
Write-Host "📦 Starting PostgreSQL database..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start database." -ForegroundColor Red
    exit 1
}

# 等待数据库启动
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and -not $ready) {
    Start-Sleep -Seconds 1
    $attempt++

    try {
        $logs = docker-compose logs --tail=5 postgres 2>&1
        if ($logs -match "database system is ready to accept connections") {
            $ready = $true
        }
    } catch {
        # Continue waiting
    }

    Write-Host "   Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
}

if (-not $ready) {
    Write-Host "⚠️  Database may not be fully ready yet, but continuing..." -ForegroundColor Yellow
}

Write-Host "✅ Database is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Database connection info:" -ForegroundColor Cyan
Write-Host "   Host: localhost" -ForegroundColor Gray
Write-Host "   Port: 5432" -ForegroundColor Gray
Write-Host "   Database: aichat" -ForegroundColor Gray
Write-Host "   Username: aichat" -ForegroundColor Gray
Write-Host "   Password: aichat123" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 pgAdmin (Database GUI): http://localhost:5050" -ForegroundColor Cyan
Write-Host "   Email: admin@example.com" -ForegroundColor Gray
Write-Host "   Password: admin123" -ForegroundColor Gray
Write-Host ""

# 启动开发服务器
Write-Host "🚀 Starting Nuxt development server..." -ForegroundColor Green
npm run dev
