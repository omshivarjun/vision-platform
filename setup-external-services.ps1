# Vision Platform - External Services Setup Script
# This script helps you set up all external services in priority order

Write-Host "🌐 Vision Platform - External Services Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Phase 1: Essential Services (MUST HAVE)
Write-Host "`n🔴 PHASE 1: ESSENTIAL SERVICES (MUST HAVE)" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Red

Write-Host "`n1. Microsoft Azure AD (OAuth)" -ForegroundColor Yellow
Write-Host "   Purpose: User authentication and login" -ForegroundColor White
Write-Host "   Setup:" -ForegroundColor White
Write-Host "   - Go to: https://portal.azure.com/" -ForegroundColor Cyan
Write-Host "   - Create App Registration" -ForegroundColor Gray
Write-Host "   - Get Client ID and Secret" -ForegroundColor Gray
Write-Host "   Required Environment Variables:" -ForegroundColor White
Write-Host "     MICROSOFT_CLIENT_ID=your-microsoft-client-id" -ForegroundColor Green
Write-Host "     MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret" -ForegroundColor Green

Write-Host "`n2. OpenAI API" -ForegroundColor Yellow
Write-Host "   Purpose: GPT models, DALL-E, Whisper, TTS" -ForegroundColor White
Write-Host "   Setup:" -ForegroundColor White
Write-Host "   - Go to: https://platform.openai.com/" -ForegroundColor Cyan
Write-Host "   - Create account and get API key" -ForegroundColor Gray
Write-Host "   Required Environment Variables:" -ForegroundColor White
Write-Host "     OPENAI_API_KEY=sk-your-actual-openai-api-key-here" -ForegroundColor Green

Write-Host "`n3. Google AI Services" -ForegroundColor Yellow
Write-Host "   Purpose: GEMINI models, Google Vision, Google Speech" -ForegroundColor White
Write-Host "   Setup:" -ForegroundColor White
Write-Host "   - Go to: https://aistudio.google.com/" -ForegroundColor Cyan
Write-Host "   - Get API key for GEMINI" -ForegroundColor Gray
Write-Host "   - Go to: https://console.cloud.google.com/" -ForegroundColor Cyan
Write-Host "   - Enable Vision and Speech APIs" -ForegroundColor Gray
Write-Host "   Required Environment Variables:" -ForegroundColor White
Write-Host "     GOOGLE_API_KEY=your-google-gemini-api-key-here" -ForegroundColor Green

Write-Host "`n4. Stripe" -ForegroundColor Yellow
Write-Host "   Purpose: Payment processing and subscriptions" -ForegroundColor White
Write-Host "   Setup:" -ForegroundColor White
Write-Host "   - Go to: https://dashboard.stripe.com/" -ForegroundColor Cyan
Write-Host "   - Create account and get API keys" -ForegroundColor Gray
Write-Host "   Required Environment Variables:" -ForegroundColor White
Write-Host "     STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key" -ForegroundColor Green
Write-Host "     STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key" -ForegroundColor Green
Write-Host "     STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret" -ForegroundColor Green

Write-Host "`n5. SMTP Email Service" -ForegroundColor Yellow
Write-Host "   Purpose: User notifications and emails" -ForegroundColor White
Write-Host "   Setup:" -ForegroundColor White
Write-Host "   - Use Gmail, Outlook, or other SMTP provider" -ForegroundColor Gray
Write-Host "   - Get SMTP credentials" -ForegroundColor Gray
Write-Host "   Required Environment Variables:" -ForegroundColor White
Write-Host "     SMTP_HOST=smtp.gmail.com" -ForegroundColor Green
Write-Host "     SMTP_USER=your-email@gmail.com" -ForegroundColor Green
Write-Host "     SMTP_PASS=your-app-password" -ForegroundColor Green

Write-Host "`n6. JWT Configuration" -ForegroundColor Yellow
Write-Host "   Purpose: Secure token-based authentication" -ForegroundColor White
Write-Host "   Setup: Generate secure random strings" -ForegroundColor Gray
Write-Host "   Required Environment Variables:" -ForegroundColor White
Write-Host "     JWT_SECRET=your-super-secret-jwt-key-change-in-production" -ForegroundColor Green
Write-Host "     JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production" -ForegroundColor Green

# Phase 2: Enhanced AI (RECOMMENDED)
Write-Host "`n🟡 PHASE 2: ENHANCED AI (RECOMMENDED)" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow

Write-Host "`n7. Azure Cognitive Services" -ForegroundColor Yellow
Write-Host "   Purpose: Translator, Computer Vision, Speech Services" -ForegroundColor White
Write-Host "   Setup:" -ForegroundColor White
Write-Host "   - Go to: https://portal.azure.com/" -ForegroundColor Cyan
Write-Host "   - Create Cognitive Services resource" -ForegroundColor Gray
Write-Host "   - Get keys and endpoints" -ForegroundColor Gray
Write-Host "   Environment Variables:" -ForegroundColor White
Write-Host "     AZURE_TRANSLATOR_KEY=your-azure-translator-key" -ForegroundColor Green
Write-Host "     AZURE_TRANSLATOR_REGION=your-azure-region" -ForegroundColor Green

Write-Host "`n8. Hugging Face" -ForegroundColor Yellow
Write-Host "   Purpose: Open-source AI models" -ForegroundColor White
Write-Host "   Setup:" -ForegroundColor White
Write-Host "   - Go to: https://huggingface.co/" -ForegroundColor Cyan
Write-Host "   - Create account and get API token" -ForegroundColor Gray
Write-Host "   Environment Variables:" -ForegroundColor White
Write-Host "     HUGGINGFACE_API_KEY=hf_your_huggingface_key" -ForegroundColor Green

Write-Host "`n9. ElevenLabs (TTS)" -ForegroundColor Yellow
Write-Host "   Purpose: High-quality text-to-speech" -ForegroundColor White
Write-Host "   Setup:" -ForegroundColor White
Write-Host "   - Go to: https://elevenlabs.io/" -ForegroundColor Cyan
Write-Host "   - Create account and get API key" -ForegroundColor Gray
Write-Host "   Environment Variables:" -ForegroundColor White
Write-Host "     ELEVENLABS_API_KEY=your-elevenlabs-key" -ForegroundColor Green

# Phase 3: Production Ready (OPTIONAL)
Write-Host "`n🟢 PHASE 3: PRODUCTION READY (OPTIONAL)" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host "`n10. AWS Services" -ForegroundColor Yellow
Write-Host "    Purpose: S3 storage, EKS deployment, ECS" -ForegroundColor White
Write-Host "    Setup:" -ForegroundColor White
Write-Host "    - Go to: https://aws.amazon.com/" -ForegroundColor Cyan
Write-Host "    - Create IAM user with appropriate permissions" -ForegroundColor Gray
Write-Host "    Environment Variables:" -ForegroundColor White
Write-Host "      AWS_ACCESS_KEY_ID=your_aws_access_key" -ForegroundColor Green
Write-Host "      AWS_SECRET_ACCESS_KEY=your_aws_secret_key" -ForegroundColor Green

Write-Host "`n11. Sentry (Error Tracking)" -ForegroundColor Yellow
Write-Host "    Purpose: Error monitoring and performance tracking" -ForegroundColor White
Write-Host "    Setup:" -ForegroundColor White
Write-Host "    - Go to: https://sentry.io/" -ForegroundColor Cyan
Write-Host "    - Create project and get DSN" -ForegroundColor Gray
Write-Host "    Environment Variables:" -ForegroundColor White
Write-Host "      SENTRY_DSN=your_sentry_dsn" -ForegroundColor Green

Write-Host "`n12. Twilio (SMS)" -ForegroundColor Yellow
Write-Host "    Purpose: SMS notifications" -ForegroundColor White
Write-Host "    Setup:" -ForegroundColor White
Write-Host "    - Go to: https://www.twilio.com/" -ForegroundColor Cyan
Write-Host "    - Create account and get credentials" -ForegroundColor Gray
Write-Host "    Environment Variables:" -ForegroundColor White
Write-Host "      TWILIO_ACCOUNT_SID=your_twilio_account_sid" -ForegroundColor Green
Write-Host "      TWILIO_AUTH_TOKEN=your_twilio_auth_token" -ForegroundColor Green

# Setup Instructions
Write-Host "`n📝 SETUP INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

Write-Host "`n1. Start with Phase 1 services (MUST HAVE)" -ForegroundColor White
Write-Host "2. Add Phase 2 services as needed" -ForegroundColor White
Write-Host "3. Consider Phase 3 for production" -ForegroundColor White

Write-Host "`n🔧 QUICK SETUP COMMANDS" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

Write-Host "`n# Copy environment template" -ForegroundColor Gray
Write-Host "cp env.example .env" -ForegroundColor Green

Write-Host "`n# Edit with your actual values" -ForegroundColor Gray
Write-Host "nano .env" -ForegroundColor Green

Write-Host "`n# Install dependencies" -ForegroundColor Gray
Write-Host "npm install" -ForegroundColor Green

Write-Host "`n# Start services" -ForegroundColor Gray
Write-Host "docker-compose up -d" -ForegroundColor Green

Write-Host "`n# Test GEMINI service" -ForegroundColor Gray
Write-Host "node test-gemini.js" -ForegroundColor Green

# Cost Estimates
Write-Host "`n💰 ESTIMATED MONTHLY COSTS" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

Write-Host "`n🔴 High Priority:" -ForegroundColor Red
Write-Host "   OpenAI API: $10-100+" -ForegroundColor White
Write-Host "   Google AI: $5-50+" -ForegroundColor White
Write-Host "   Stripe: 2.9% + $0.30 per transaction" -ForegroundColor White

Write-Host "`n🟡 Medium Priority:" -ForegroundColor Yellow
Write-Host "   Azure Cognitive: $1-20+" -ForegroundColor White
Write-Host "   ElevenLabs: $5-22+" -ForegroundColor White
Write-Host "   Midjourney: $10-30+" -ForegroundColor White

Write-Host "`n🟢 Low Priority:" -ForegroundColor Green
Write-Host "   AWS: $5-50+" -ForegroundColor White
Write-Host "   Sentry: $0-26+" -ForegroundColor White

# Security Tips
Write-Host "`n🔐 SECURITY BEST PRACTICES" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

Write-Host "`n1. Never commit API keys to version control" -ForegroundColor White
Write-Host "2. Use environment variables for all secrets" -ForegroundColor White
Write-Host "3. Rotate keys regularly (every 90 days)" -ForegroundColor White
Write-Host "4. Use least privilege access for all services" -ForegroundColor White
Write-Host "5. Monitor usage and set spending limits" -ForegroundColor White
Write-Host "6. Enable 2FA on all service accounts" -ForegroundColor White

Write-Host "`n🎯 NEXT STEPS" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan

Write-Host "`n1. Set up Phase 1 services first" -ForegroundColor White
Write-Host "2. Test your Vision Platform with basic functionality" -ForegroundColor White
Write-Host "3. Gradually add Phase 2 and 3 services" -ForegroundColor White
Write-Host "4. Monitor costs and usage" -ForegroundColor White

Write-Host "`n✅ Setup complete! Check EXTERNAL_SERVICES_SETUP.md for detailed instructions." -ForegroundColor Green

