# Vision Platform - Push to GitHub Script
# This script initializes git and pushes the project to GitHub

Write-Host "🚀 Pushing Vision Platform to GitHub..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan

# Check if git is available
Write-Host "🔍 Checking Git availability..." -ForegroundColor Yellow
try {
    git --version | Out-Null
    Write-Host "✅ Git is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not available. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
if (Test-Path ".git") {
    Write-Host "✅ Already in a git repository" -ForegroundColor Green
} else {
    Write-Host "🔧 Initializing git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

# Add all files
Write-Host "📁 Adding all files to git..." -ForegroundColor Yellow
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Committing changes..." -ForegroundColor Yellow
    git commit -m "Initial commit: Vision Platform - Multimodal Translation & Accessibility Platform

Features:
- Next.js frontend with TypeScript and Tailwind CSS
- Express.js backend API with MongoDB and Redis
- FastAPI AI service with ML models
- Docker containerization with Docker Compose
- Comprehensive testing and CI/CD setup
- Accessibility features and WCAG compliance
- Real-time communication with WebSockets
- Progressive Web App support"
    
    Write-Host "✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No changes to commit" -ForegroundColor Cyan
}

# Check if remote origin exists
$remote = git remote get-url origin 2>$null
if ($remote) {
    Write-Host "✅ Remote origin already exists: $remote" -ForegroundColor Green
} else {
    Write-Host "🔧 Setting up remote origin..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please enter your GitHub repository URL:" -ForegroundColor Cyan
    Write-Host "Example: https://github.com/yourusername/vision-platform.git" -ForegroundColor White
    Write-Host ""
    
    $repoUrl = Read-Host "GitHub Repository URL"
    
    if ($repoUrl) {
        git remote add origin $repoUrl
        Write-Host "✅ Remote origin added: $repoUrl" -ForegroundColor Green
    } else {
        Write-Host "❌ No repository URL provided. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

# Set main branch
Write-Host "🌿 Setting main branch..." -ForegroundColor Yellow
git branch -M main

# Push to GitHub
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push -u origin main
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to push to GitHub. Please check your credentials and try again." -ForegroundColor Red
    Write-Host "💡 You may need to authenticate with GitHub first." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 Vision Platform has been successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "📚 Repository: $remote" -ForegroundColor White
Write-Host "🌿 Branch: main" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Visit your GitHub repository" -ForegroundColor White
Write-Host "   2. Set up GitHub Pages (optional)" -ForegroundColor White
Write-Host "   3. Configure branch protection rules" -ForegroundColor White
Write-Host "   4. Set up GitHub Actions secrets" -ForegroundColor White
Write-Host "   5. Invite collaborators" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Happy coding!" -ForegroundColor Green
