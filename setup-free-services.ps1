# Vision Platform - FREE Services Setup Script
# This script helps you set up ALL FREE external services

Write-Host "🆓 Vision Platform - FREE Services Setup" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "Total Cost: $0.00 per month!" -ForegroundColor Cyan

# Phase 1: Essential Services (100% FREE)
Write-Host "`n🔴 PHASE 1: ESSENTIAL SERVICES (100% FREE)" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Red

Write-Host "`n1. JWT Configuration (FREE)" -ForegroundColor Yellow
Write-Host "   Purpose: Secure token-based authentication" -ForegroundColor White
Write-Host "   Setup: Generate secure random strings locally" -ForegroundColor Gray
Write-Host "   Cost: $0.00 (Unlimited)" -ForegroundColor Green
Write-Host "   Environment Variables:" -ForegroundColor White
Write-Host "     JWT_SECRET=vision_platform_jwt_secret_key_2024_super_secure" -ForegroundColor Green
Write-Host "     JWT_REFRESH_SECRET=vision_platform_refresh_secret_key_2024_super_secure" -ForegroundColor Green

Write-Host "`n2. Microsoft Azure AD (FREE)" -ForegroundColor Yellow
Write-Host "   Purpose: User authentication and login" -ForegroundColor White
Write-Host "   Setup:" -ForegroundColor White
Write-Host "   - Go to: https://portal.azure.com/" -ForegroundColor Cyan
Write-Host "   - Create App Registration (FREE)" -ForegroundColor Gray
Write-Host "   - Get Client ID and Secret" -ForegroundColor Gray
Write-Host "   Cost: $0.00 (50,000 users/month)" -ForegroundColor Green
Write-Host "   Environment Variables:" -ForegroundColor White
Write-Host "     MICROSOFT_CLIENT_ID=your-microsoft-client-id" -ForegroundColor Green
Write-Host "     MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret" -ForegroundColor Green

Write-Host "`n3. Hugging Face (FREE)" -ForegroundColor Yellow
Write-Host "   Purpose: Open-source AI models, translation, OCR" -ForegroundColor White
Write-Host "   Setup:" -ForegroundColor White
Write-Host "   - Go to: https://huggingface.co/" -ForegroundColor Cyan
Write-Host "   - Create account (FREE)" -ForegroundColor Gray
Write-Host "   - Get API token" -ForegroundColor Gray
Write-Host "   Cost: $0.00 (30,000 requests/month)" -ForegroundColor Green
Write-Host "   Environment Variables:" -ForegroundColor White
Write-Host "     HUGGINGFACE_API_KEY=hf_your_huggingface_key" -ForegroundColor Green
Write-Host "     DEFAULT_TRANSLATION_PROVIDER=huggingface" -ForegroundColor Green

Write-Host "`n4. Stripe (FREE)" -ForegroundColor Yellow
Write-Host "   Purpose: Payment processing and subscriptions" -ForegroundColor White
Write-Host "   Setup:" -ForegroundColor White
Write-Host "   - Go to: https://dashboard.stripe.com/" -ForegroundColor Cyan
Write-Host "   - Create account (FREE)" -ForegroundColor Gray
Write-Host "   - Get test API keys (FREE)" -ForegroundColor Gray
Write-Host "   Cost: $0.00 (No monthly fees, only transaction fees)" -ForegroundColor Green
Write-Host "   Environment Variables:" -ForegroundColor White
Write-Host "     STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_key" -ForegroundColor Green
Write-Host "     STRIPE_SECRET_KEY=sk_test_your_stripe_test_key" -ForegroundColor Green

Write-Host "`n5. Gmail SMTP (FREE)" -ForegroundColor Yellow
Write-Host "   Purpose: User notifications and emails" -ForegroundColor White
Write-Host "   Setup:" -ForegroundColor White
Write-Host "   - Use your Gmail account" -ForegroundColor Gray
Write-Host "   - Enable 2-factor authentication" -ForegroundColor Gray
Write-Host "   - Generate App Password" -ForegroundColor Gray
Write-Host "   Cost: $0.00 (500 emails/day)" -ForegroundColor Green
Write-Host "   Environment Variables:" -ForegroundColor White
Write-Host "     SMTP_HOST=smtp.gmail.com" -ForegroundColor Green
Write-Host "     SMTP_USER=your-email@gmail.com" -ForegroundColor Green
Write-Host "     SMTP_PASS=your-app-password" -ForegroundColor Green

Write-Host "`n6. MinIO (FREE - Local)" -ForegroundColor Yellow
Write-Host "   Purpose: Object storage (S3-compatible)" -ForegroundColor White
Write-Host "   Setup: Runs locally with Docker (no external service)" -ForegroundColor Gray
Write-Host "   Cost: $0.00 (100% FREE, unlimited local storage)" -ForegroundColor Green
Write-Host "   Environment Variables:" -ForegroundColor White
Write-Host "     MINIO_ENDPOINT=localhost:9000" -ForegroundColor Green
Write-Host "     MINIO_ACCESS_KEY=minioadmin" -ForegroundColor Green
Write-Host "     MINIO_SECRET_KEY=minioadmin123" -ForegroundColor Green

# Phase 2: Enhanced Services (FREE Tiers)
Write-Host "`n🟡 PHASE 2: ENHANCED SERVICES (FREE Tiers)" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow

Write-Host "`n7. Google AI Studio (FREE)" -ForegroundColor Yellow
Write-Host "   Purpose: GEMINI models, limited usage" -ForegroundColor White
Write-Host "   Setup:" -ForegroundColor White
Write-Host "   - Go to: https://aistudio.google.com/" -ForegroundColor Cyan
Write-Host "   - Create account (FREE)" -ForegroundColor Gray
Write-Host "   - Get API key" -ForegroundColor Gray
Write-Host "   Cost: $0.00 (1,500 requests/day)" -ForegroundColor Green
Write-Host "   Environment Variables:" -ForegroundColor White
Write-Host "     GOOGLE_API_KEY=your-google-gemini-api-key" -ForegroundColor Green

Write-Host "`n8. OpenAI (FREE Credits)" -ForegroundColor Yellow
Write-Host "   Purpose: GPT models, DALL-E, Whisper" -ForegroundColor White
Write-Host "   Setup:" -ForegroundColor White
Write-Host "   - Go to: https://platform.openai.com/" -ForegroundColor Cyan
Write-Host "   - Create account (FREE)" -ForegroundColor Gray
Write-Host "   - Get $5 free credits" -ForegroundColor Gray
Write-Host "   Cost: $0.00 ($5 free credits for new users)" -ForegroundColor Green
Write-Host "   Environment Variables:" -ForegroundColor White
Write-Host "     OPENAI_API_KEY=sk-your-openai-api-key" -ForegroundColor Green

Write-Host "`n9. Azure Cognitive Services (FREE)" -ForegroundColor Yellow
Write-Host "   Purpose: Translator, Computer Vision, Speech" -ForegroundColor White
Write-Host "   Setup:" -ForegroundColor White
Write-Host "   - Go to: https://portal.azure.com/" -ForegroundColor Cyan
Write-Host "   - Create Cognitive Services (FREE tier)" -ForegroundColor Gray
Write-Host "   - Get keys and endpoints" -ForegroundColor Gray
Write-Host "   Cost: $0.00 (5,000 transactions/month)" -ForegroundColor Green
Write-Host "   Environment Variables:" -ForegroundColor White
Write-Host "     AZURE_TRANSLATOR_KEY=your-azure-translator-key" -ForegroundColor Green
Write-Host "     AZURE_TRANSLATOR_REGION=your-azure-region" -ForegroundColor Green

Write-Host "`n10. MongoDB Atlas (FREE)" -ForegroundColor Yellow
Write-Host "    Purpose: Cloud database" -ForegroundColor White
Write-Host "    Setup:" -ForegroundColor White
Write-Host "    - Go to: https://www.mongodb.com/atlas" -ForegroundColor Cyan
Write-Host "    - Create account (FREE)" -ForegroundColor Gray
Write-Host "    - Create free cluster" -ForegroundColor Gray
Write-Host "    Cost: $0.00 (512MB storage)" -ForegroundColor Green
Write-Host "    Environment Variables:" -ForegroundColor White
Write-Host "      MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vision_platform" -ForegroundColor Green

# Phase 3: Additional Services (FREE Tiers)
Write-Host "`n🟢 PHASE 3: ADDITIONAL SERVICES (FREE Tiers)" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host "`n11. Sentry (FREE)" -ForegroundColor Yellow
Write-Host "    Purpose: Error monitoring and performance tracking" -ForegroundColor White
Write-Host "    Setup:" -ForegroundColor White
Write-Host "    - Go to: https://sentry.io/" -ForegroundColor Cyan
Write-Host "    - Create account (FREE)" -ForegroundColor Gray
Write-Host "    - Create project and get DSN" -ForegroundColor Gray
Write-Host "    Cost: $0.00 (5,000 errors/month)" -ForegroundColor Green
Write-Host "    Environment Variables:" -ForegroundColor White
Write-Host "      SENTRY_DSN=your_sentry_dsn" -ForegroundColor Green

Write-Host "`n12. GitHub (FREE)" -ForegroundColor Yellow
Write-Host "    Purpose: Source control and CI/CD" -ForegroundColor White
Write-Host "    Setup:" -ForegroundColor White
Write-Host "    - Go to: https://github.com/" -ForegroundColor Cyan
Write-Host "    - Create account (FREE)" -ForegroundColor Gray
Write-Host "    - Set up repository and Actions" -ForegroundColor Gray
Write-Host "    Cost: $0.00 (Unlimited repos, 2,000 Actions minutes/month)" -ForegroundColor Green
Write-Host "    Environment Variables:" -ForegroundColor White
Write-Host "      GITHUB_TOKEN=your_github_token" -ForegroundColor Green

Write-Host "`n13. Netlify (FREE)" -ForegroundColor Yellow
Write-Host "    Purpose: Static site hosting and deployment" -ForegroundColor White
Write-Host "    Setup:" -ForegroundColor White
Write-Host "    - Go to: https://www.netlify.com/" -ForegroundColor Cyan
Write-Host "    - Create account (FREE)" -ForegroundColor Gray
Write-Host "    - Connect your GitHub repository" -ForegroundColor Gray
Write-Host "    Cost: $0.00 (100GB bandwidth/month)" -ForegroundColor Green

Write-Host "`n14. Vercel (FREE)" -ForegroundColor Yellow
Write-Host "    Purpose: Frontend hosting and deployment" -ForegroundColor White
Write-Host "    Setup:" -ForegroundColor White
Write-Host "    - Go to: https://vercel.com/" -ForegroundColor Cyan
Write-Host "    - Create account (FREE)" -ForegroundColor Gray
Write-Host "    - Import your project" -ForegroundColor Gray
Write-Host "    Cost: $0.00 (100GB bandwidth/month)" -ForegroundColor Green

Write-Host "`n15. Firebase (FREE)" -ForegroundColor Yellow
Write-Host "    Purpose: Backend services for mobile/web" -ForegroundColor White
Write-Host "    Setup:" -ForegroundColor White
Write-Host "    - Go to: https://firebase.google.com/" -ForegroundColor Cyan
Write-Host "    - Create account (FREE)" -ForegroundColor Gray
Write-Host "    - Create project" -ForegroundColor Gray
Write-Host "    Cost: $0.00 (1GB storage, 10GB transfer/month)" -ForegroundColor Green
Write-Host "    Environment Variables:" -ForegroundColor White
Write-Host "      FIREBASE_API_KEY=your_firebase_api_key" -ForegroundColor Green

# Cost Summary
Write-Host "`n💰 COST SUMMARY" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

Write-Host "`n🔴 Phase 1 (Essential): $0.00" -ForegroundColor Red
Write-Host "   - JWT: $0.00 (Unlimited)" -ForegroundColor White
Write-Host "   - Azure AD: $0.00 (50K users/month)" -ForegroundColor White
Write-Host "   - Hugging Face: $0.00 (30K requests/month)" -ForegroundColor White
Write-Host "   - Stripe: $0.00 (No monthly fees)" -ForegroundColor White
Write-Host "   - Gmail SMTP: $0.00 (500 emails/day)" -ForegroundColor White
Write-Host "   - MinIO: $0.00 (Unlimited local storage)" -ForegroundColor White

Write-Host "`n🟡 Phase 2 (Enhanced): $0.00" -ForegroundColor Yellow
Write-Host "   - Google AI: $0.00 (1.5K requests/day)" -ForegroundColor White
Write-Host "   - OpenAI: $0.00 ($5 free credits)" -ForegroundColor White
Write-Host "   - Azure Cognitive: $0.00 (5K transactions/month)" -ForegroundColor White
Write-Host "   - MongoDB Atlas: $0.00 (512MB storage)" -ForegroundColor White

Write-Host "`n🟢 Phase 3 (Additional): $0.00" -ForegroundColor Green
Write-Host "   - Sentry: $0.00 (5K errors/month)" -ForegroundColor White
Write-Host "   - GitHub: $0.00 (Unlimited repos)" -ForegroundColor White
Write-Host "   - Netlify: $0.00 (100GB bandwidth/month)" -ForegroundColor White
Write-Host "   - Vercel: $0.00 (100GB bandwidth/month)" -ForegroundColor White
Write-Host "   - Firebase: $0.00 (1GB storage)" -ForegroundColor White

Write-Host "`n🎯 TOTAL MONTHLY COST: $0.00" -ForegroundColor Green

# Setup Instructions
Write-Host "`n📝 SETUP INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

Write-Host "`n1. Start with Phase 1 services (100% FREE)" -ForegroundColor White
Write-Host "2. Add Phase 2 services as needed (FREE tiers)" -ForegroundColor White
Write-Host "3. Consider Phase 3 for additional features (FREE tiers)" -ForegroundColor White
Write-Host "4. Monitor usage to stay within free limits" -ForegroundColor White

Write-Host "`n🔧 QUICK FREE SETUP COMMANDS" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

Write-Host "`n# Copy environment template" -ForegroundColor Gray
Write-Host "cp env.example .env" -ForegroundColor Green

Write-Host "`n# Edit with FREE service credentials" -ForegroundColor Gray
Write-Host "nano .env" -ForegroundColor Green

Write-Host "`n# Install dependencies" -ForegroundColor Gray
Write-Host "npm install" -ForegroundColor Green

Write-Host "`n# Start services (all FREE)" -ForegroundColor Gray
Write-Host "docker-compose up -d" -ForegroundColor Green

Write-Host "`n# Test FREE GEMINI service" -ForegroundColor Gray
Write-Host "node test-gemini.js" -ForegroundColor Green

# Priority Order
Write-Host "`n🚀 PRIORITY ORDER FOR FREE SETUP" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

Write-Host "`n🔴 TODAY (Phase 1 - Essential):" -ForegroundColor Red
Write-Host "   1. Set up JWT secrets (local generation)" -ForegroundColor White
Write-Host "   2. Create Microsoft Azure AD app (FREE)" -ForegroundColor White
Write-Host "   3. Get Hugging Face API key (FREE)" -ForegroundColor White
Write-Host "   4. Set up Stripe test account (FREE)" -ForegroundColor White
Write-Host "   5. Configure Gmail SMTP (FREE)" -ForegroundColor White
Write-Host "   6. Start MinIO locally (FREE)" -ForegroundColor White

Write-Host "`n🟡 THIS WEEK (Phase 2 - Enhanced):" -ForegroundColor Yellow
Write-Host "   1. Get Google AI Studio API key (FREE)" -ForegroundColor White
Write-Host "   2. Create OpenAI account for $5 credits (FREE)" -ForegroundColor White
Write-Host "   3. Set up Azure Cognitive Services (FREE tier)" -ForegroundColor White
Write-Host "   4. Create MongoDB Atlas cluster (FREE)" -ForegroundColor White

Write-Host "`n🟢 NEXT WEEK (Phase 3 - Additional):" -ForegroundColor Green
Write-Host "   1. Set up Sentry for error monitoring (FREE)" -ForegroundColor White
Write-Host "   2. Configure GitHub repository and Actions (FREE)" -ForegroundColor White
Write-Host "   3. Deploy to Netlify/Vercel (FREE)" -ForegroundColor White
Write-Host "   4. Set up Firebase project (FREE)" -ForegroundColor White

# Benefits
Write-Host "`n✅ BENEFITS OF FREE SERVICES" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

Write-Host "`n💰 Cost: $0.00 per month" -ForegroundColor Green
Write-Host "🚀 Development: Start immediately" -ForegroundColor Green
Write-Host "🧪 Testing: Full functionality available" -ForegroundColor Green
Write-Host "📈 Scaling: Upgrade only when needed" -ForegroundColor Green
Write-Host "🔒 Security: Enterprise-grade services" -ForegroundColor Green
Write-Host "🌐 Global: Services available worldwide" -ForegroundColor Green

Write-Host "`n🎯 NEXT STEPS" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan

Write-Host "`n1. Start with Phase 1 services today" -ForegroundColor White
Write-Host "2. Test your Vision Platform with FREE services" -ForegroundColor White
Write-Host "3. Gradually add Phase 2 and 3 services" -ForegroundColor White
Write-Host "4. Monitor usage to stay within free limits" -ForegroundColor White
Write-Host "5. Upgrade to paid plans only when needed" -ForegroundColor White

Write-Host "`n✅ FREE setup complete! Check FREE_SERVICES_SETUP.md for detailed instructions." -ForegroundColor Green
Write-Host "🎉 Total cost: $0.00 per month. Start building your Vision Platform today!" -ForegroundColor Green

