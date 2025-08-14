@echo off
echo 🚀 Starting Vision Platform on Windows...

REM Check if Docker is running
echo Checking Docker status...
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)
echo ✅ Docker is running

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Creating from example...
    if exist "env.example" (
        copy "env.example" ".env" >nul
        echo ✅ .env file created from example
    ) else (
        echo ❌ env.example not found. Please create .env file manually.
        pause
        exit /b 1
    )
)

REM Build shared package first
echo Building shared package...
cd packages\shared
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build shared package
    pause
    exit /b 1
)
echo ✅ Shared package built successfully
cd ..\..

REM Start Docker services
echo Starting Docker services...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start Docker services
    echo Trying with Windows-specific configuration...
    docker-compose -f docker-compose.yml -f docker-compose.windows.yml up -d
    if %errorlevel% neq 0 (
        echo ❌ Failed to start Docker services even with Windows configuration
        pause
        exit /b 1
    )
)
echo ✅ Docker services started successfully

REM Wait a moment for services to start
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check service status
echo Checking service status...
docker-compose ps

REM Open platform in browser
echo Opening platform in browser...
start http://localhost:80
start http://localhost:3000
start http://localhost:3001
start http://localhost:8000

echo 🎉 Vision Platform is now running!
echo Main Platform: http://localhost:80
echo Web Frontend: http://localhost:3000
echo API Service: http://localhost:3001
echo AI Service: http://localhost:8000
echo.
echo Use 'npm run status' to check service status
echo Use 'npm run logs' to view logs
echo Use 'npm run stop' to stop the platform
pause
