# 🪟 Windows Setup Guide for Vision Platform

This guide will help you set up and run the Vision Platform on Windows.

## Prerequisites

Before you begin, make sure you have the following installed:

1. **Docker Desktop for Windows**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Make sure Docker Desktop is running before proceeding

2. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

3. **Git**
   - Download from: https://git-scm.com/download/win
   - Verify installation: `git --version`

4. **Python** (version 3.8 or higher)
   - Download from: https://www.python.org/downloads/
   - Verify installation: `python --version`

## Quick Start (Recommended)

### Method 1: Using PowerShell Scripts

1. **Open PowerShell as Administrator** in the project directory
2. **Run the setup script:**
   ```powershell
   npm run setup
   ```
3. **Start the platform:**
   ```powershell
   npm run start
   ```

### Method 2: Using Batch File

1. **Double-click** `start-windows.bat` in the project directory
2. **Or run from Command Prompt:**
   ```cmd
   start-windows.bat
   ```

### Method 3: Manual Setup

If the automated scripts don't work, follow these manual steps:

1. **Install dependencies:**
   ```powershell
   npm run install:all
   ```

2. **Build shared package:**
   ```powershell
   cd packages/shared
   npm run build
   cd ../..
   ```

3. **Start Docker services:**
   ```powershell
   docker-compose up -d
   ```

4. **Open platform in browser:**
   ```powershell
   npm run platform
   ```

## Troubleshooting

### Common Issues and Solutions

#### 1. "make is not recognized" Error
**Problem:** The `make` command is not available on Windows by default.

**Solution:** Use the Windows-specific scripts instead:
```powershell
npm run setup    # Instead of make setup
npm run start    # Instead of make dev
```

#### 2. "workspace:*" Protocol Error
**Problem:** npm doesn't support workspace protocol on older versions.

**Solution:** The project has been updated to use file paths instead of workspace protocol. If you still get this error, try:
```powershell
npm install --legacy-peer-deps
```

#### 3. Docker Build Failures
**Problem:** Docker containers fail to build due to npm install issues.

**Solution:** Use the Windows-specific Docker configuration:
```powershell
docker-compose -f docker-compose.yml -f docker-compose.windows.yml up -d
```

#### 4. Permission Errors
**Problem:** PowerShell execution policy prevents running scripts.

**Solution:** Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 5. Port Conflicts
**Problem:** Services can't start because ports are already in use.

**Solution:** Check what's using the ports and stop those services:
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :8000
```

### Docker Issues

#### Docker Desktop Not Running
- Make sure Docker Desktop is installed and running
- Check the Docker Desktop icon in the system tray
- Restart Docker Desktop if needed

#### Docker Build Timeout
- Increase Docker Desktop memory allocation (Settings > Resources > Memory)
- Try building with the Windows-specific configuration

#### Volume Mount Issues
- Make sure the project path doesn't contain special characters
- Use the Windows-specific Docker Compose override file

## Access Points

Once the platform is running, you can access it at:

- **🌐 Main Platform**: http://localhost:80
- **🌐 Web Frontend**: http://localhost:3000
- **📱 Mobile Dev Server**: http://localhost:19000
- **🔌 API Service**: http://localhost:3001
- **🤖 AI Service**: http://localhost:8000
- **📊 AI Service Docs**: http://localhost:8000/docs
- **📊 MinIO Console**: http://localhost:9001
- **📈 Grafana**: http://localhost:3002
- **📊 Prometheus**: http://localhost:9090

## Useful Commands

```powershell
# Check service status
npm run status

# View logs
npm run logs

# Stop all services
npm run stop

# Restart services
npm run restart

# Clean up everything
npm run clean

# Build specific components
npm run build:web
npm run build:shared
```

## Environment Configuration

1. **Create environment file:**
   ```powershell
   copy env.example .env
   ```

2. **Edit `.env` file** with your specific configuration:
   - API keys for AI services
   - Database credentials
   - Other environment-specific settings

## Getting Help

If you encounter issues:

1. **Check the logs:**
   ```powershell
   npm run logs
   ```

2. **Verify Docker status:**
   ```powershell
   docker-compose ps
   ```

3. **Check individual service logs:**
   ```powershell
   docker-compose logs web
   docker-compose logs api
   docker-compose logs ai-service
   ```

4. **Restart from scratch:**
   ```powershell
   npm run clean
   npm run setup
   npm run start
   ```

## Performance Tips

1. **Increase Docker Desktop resources:**
   - Memory: 8GB or more
   - CPUs: 4 or more
   - Disk: 60GB or more

2. **Use SSD storage** for better performance

3. **Close unnecessary applications** to free up system resources

4. **Use the Windows-specific configuration** for better compatibility

## Support

If you continue to have issues:

1. Check the main README.md for general troubleshooting
2. Review the Docker logs for specific error messages
3. Ensure all prerequisites are properly installed
4. Try running the platform on a clean system

---

**Note:** This guide is specifically for Windows users. For other operating systems, refer to the main README.md file.
