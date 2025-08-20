# 🌐 **Vision Platform - Complete External Services Setup Guide**

## 📋 **Overview**
This guide lists **ALL** external services, API keys, and configurations you need to set up for every feature in your Vision Platform to work completely.

## 🔑 **Authentication & Identity Services**

### **1. Microsoft Azure AD (OAuth)**
- **Purpose**: User authentication and login
- **Required**: ✅ **MANDATORY** for user login
- **Setup**: 
  1. Go to [Azure Portal](https://portal.azure.com/)
  2. Create App Registration
  3. Get Client ID and Secret
- **Environment Variables**:
  ```bash
  MICROSOFT_CLIENT_ID=your-microsoft-client-id
  MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
  OAUTH_CALLBACK_URL=http://localhost:3000/auth/callback
  ```

### **2. JWT Configuration**
- **Purpose**: Secure token-based authentication
- **Required**: ✅ **MANDATORY** for API security
- **Setup**: Generate secure random strings
- **Environment Variables**:
  ```bash
  JWT_SECRET=your-super-secret-jwt-key-change-in-production
  JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
  JWT_EXPIRES_IN=15m
  JWT_REFRESH_EXPIRES_IN=7d
  ```

## 🤖 **AI & Machine Learning Services**

### **3. OpenAI API**
- **Purpose**: GPT models, DALL-E, Whisper, TTS
- **Required**: ✅ **MANDATORY** for AI features
- **Setup**: 
  1. Go to [OpenAI Platform](https://platform.openai.com/)
  2. Create account and get API key
- **Environment Variables**:
  ```bash
  OPENAI_API_KEY=sk-your-actual-openai-api-key-here
  OPENAI_ORGANIZATION=your-openai-org-id  # Optional
  ```

### **4. Google AI Services**
- **Purpose**: GEMINI models, Google Vision, Google Speech
- **Required**: ✅ **MANDATORY** for AI features
- **Setup**: 
  1. Go to [Google AI Studio](https://aistudio.google.com/)
  2. Get API key for GEMINI
  3. Go to [Google Cloud Console](https://console.cloud.google.com/)
  4. Enable Vision and Speech APIs
- **Environment Variables**:
  ```bash
  GOOGLE_API_KEY=your-google-gemini-api-key-here
  GOOGLE_CLOUD_CREDENTIALS=path/to/google-credentials.json
  ```

### **5. Azure Cognitive Services**
- **Purpose**: Translator, Computer Vision, Speech Services
- **Required**: 🔶 **RECOMMENDED** for enterprise features
- **Setup**: 
  1. Go to [Azure Portal](https://portal.azure.com/)
  2. Create Cognitive Services resource
  3. Get keys and endpoints
- **Environment Variables**:
  ```bash
  AZURE_TRANSLATOR_KEY=your-azure-translator-key
  AZURE_TRANSLATOR_REGION=your-azure-region
  AZURE_VISION_KEY=your-azure-vision-key
  AZURE_VISION_ENDPOINT=your-azure-vision-endpoint
  AZURE_SPEECH_KEY=your-azure-speech-key
  AZURE_SPEECH_REGION=your-azure-speech-region
  ```

### **6. Hugging Face**
- **Purpose**: Open-source AI models
- **Required**: 🔶 **OPTIONAL** for offline AI
- **Setup**: 
  1. Go to [Hugging Face](https://huggingface.co/)
  2. Create account and get API token
- **Environment Variables**:
  ```bash
  HUGGINGFACE_API_KEY=hf_your_huggingface_key
  ```

### **7. ElevenLabs (TTS)**
- **Purpose**: High-quality text-to-speech
- **Required**: 🔶 **OPTIONAL** for premium TTS
- **Setup**: 
  1. Go to [ElevenLabs](https://elevenlabs.io/)
  2. Create account and get API key
- **Environment Variables**:
  ```bash
  ELEVENLABS_API_KEY=your-elevenlabs-key
  ```

### **8. Midjourney API**
- **Purpose**: AI image generation
- **Required**: 🔶 **OPTIONAL** for image creation
- **Setup**: 
  1. Go to [Midjourney](https://docs.midjourney.com/)
  2. Get API access
- **Environment Variables**:
  ```bash
  MIDJOURNEY_API_KEY=your-midjourney-key
  ```

## 💳 **Payment & Subscription Services**

### **9. Stripe**
- **Purpose**: Payment processing and subscriptions
- **Required**: ✅ **MANDATORY** for payments
- **Setup**: 
  1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
  2. Create account and get API keys
- **Environment Variables**:
  ```bash
  STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
  STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
  STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
  ```

### **10. Razorpay (Alternative)**
- **Purpose**: Payment processing (India-focused)
- **Required**: 🔶 **OPTIONAL** alternative to Stripe
- **Setup**: 
  1. Go to [Razorpay](https://razorpay.com/)
  2. Create account and get API keys
- **Environment Variables**:
  ```bash
  RAZORPAY_KEY_ID=your_razorpay_key_id
  RAZORPAY_KEY_SECRET=your_razorpay_key_secret
  ```

## 📧 **Email & Communication Services**

### **11. SMTP Email Service**
- **Purpose**: User notifications and emails
- **Required**: ✅ **MANDATORY** for user communication
- **Setup**: 
  1. Use Gmail, Outlook, or other SMTP provider
  2. Get SMTP credentials
- **Environment Variables**:
  ```bash
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password
  FROM_EMAIL=noreply@visionplatform.com
  ```

### **12. Twilio (SMS)**
- **Purpose**: SMS notifications
- **Required**: 🔶 **OPTIONAL** for SMS alerts
- **Setup**: 
  1. Go to [Twilio](https://www.twilio.com/)
  2. Create account and get credentials
- **Environment Variables**:
  ```bash
  TWILIO_ACCOUNT_SID=your_twilio_account_sid
  TWILIO_AUTH_TOKEN=your_twilio_auth_token
  TWILIO_PHONE_NUMBER=your_twilio_phone_number
  ```

## ☁️ **Cloud & Infrastructure Services**

### **13. AWS Services**
- **Purpose**: S3 storage, EKS deployment, ECS
- **Required**: 🔶 **OPTIONAL** for cloud deployment
- **Setup**: 
  1. Go to [AWS Console](https://aws.amazon.com/)
  2. Create IAM user with appropriate permissions
- **Environment Variables**:
  ```bash
  AWS_ACCESS_KEY_ID=your_aws_access_key
  AWS_SECRET_ACCESS_KEY=your_aws_secret_key
  AWS_REGION=us-east-1
  AWS_S3_BUCKET=vision-platform-uploads
  ```

### **14. MinIO (Local Alternative)**
- **Purpose**: Object storage (S3-compatible)
- **Required**: ✅ **MANDATORY** for file storage
- **Setup**: Runs locally with Docker
- **Environment Variables**:
  ```bash
  MINIO_ENDPOINT=localhost:9000
  MINIO_ACCESS_KEY=minioadmin
  MINIO_SECRET_KEY=minioadmin123
  ```

## 📊 **Monitoring & Analytics Services**

### **15. Sentry (Error Tracking)**
- **Purpose**: Error monitoring and performance tracking
- **Required**: 🔶 **OPTIONAL** for production monitoring
- **Setup**: 
  1. Go to [Sentry](https://sentry.io/)
  2. Create project and get DSN
- **Environment Variables**:
  ```bash
  SENTRY_DSN=your_sentry_dsn
  ```

### **16. Prometheus & Grafana**
- **Purpose**: Metrics collection and visualization
- **Required**: 🔶 **OPTIONAL** for monitoring
- **Setup**: Runs locally with Docker
- **Environment Variables**:
  ```bash
  PROMETHEUS_PORT=9090
  GRAFANA_PORT=3002
  GRAFANA_ADMIN_PASSWORD=your_grafana_password
  ```

## 🔧 **Development & Testing Services**

### **17. GitHub (CI/CD)**
- **Purpose**: Source control and automated deployments
- **Required**: 🔶 **OPTIONAL** for development workflow
- **Setup**: 
  1. Go to [GitHub](https://github.com/)
  2. Create repository and set up actions
- **Environment Variables**:
  ```bash
  GITHUB_TOKEN=your_github_token
  ```

## 📱 **Mobile & Web Services**

### **18. Expo (Mobile Development)**
- **Purpose**: React Native development and testing
- **Required**: 🔶 **OPTIONAL** for mobile app
- **Setup**: 
  1. Go to [Expo](https://expo.dev/)
  2. Create account for push notifications
- **Environment Variables**:
  ```bash
  EXPO_ACCESS_TOKEN=your_expo_access_token
  ```

## 🚀 **Complete Setup Checklist**

### **Phase 1: Essential Services (MUST HAVE)**
- [ ] **Microsoft Azure AD** - User authentication
- [ ] **OpenAI API** - Core AI functionality
- [ ] **Google AI** - GEMINI and Vision services
- [ ] **Stripe** - Payment processing
- [ ] **SMTP Email** - User notifications
- [ ] **JWT Secrets** - Security tokens

### **Phase 2: Enhanced AI (RECOMMENDED)**
- [ ] **Azure Cognitive Services** - Enterprise AI
- [ ] **Hugging Face** - Open-source models
- [ ] **ElevenLabs** - Premium TTS
- [ ] **Midjourney** - Image generation

### **Phase 3: Production Ready (OPTIONAL)**
- [ ] **AWS Services** - Cloud deployment
- [ ] **Sentry** - Error monitoring
- [ ] **Twilio** - SMS notifications
- [ ] **GitHub Actions** - CI/CD pipeline

## 💰 **Estimated Monthly Costs**

| Service | Cost Range | Priority |
|---------|------------|----------|
| **OpenAI API** | $10-100+ | 🔴 High |
| **Google AI** | $5-50+ | 🔴 High |
| **Stripe** | 2.9% + $0.30 per transaction | 🔴 High |
| **Azure Cognitive** | $1-20+ | 🟡 Medium |
| **ElevenLabs** | $5-22+ | 🟡 Medium |
| **Midjourney** | $10-30+ | 🟡 Medium |
| **AWS** | $5-50+ | 🟢 Low |
| **Sentry** | $0-26+ | 🟢 Low |

## 🔐 **Security Best Practices**

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate keys regularly** (every 90 days)
4. **Use least privilege** access for all services
5. **Monitor usage** and set spending limits
6. **Enable 2FA** on all service accounts

## 📝 **Quick Setup Commands**

```bash
# 1. Copy environment template
cp env.example .env

# 2. Edit with your actual values
nano .env

# 3. Install dependencies
npm install

# 4. Start services
docker-compose up -d

# 5. Verify configuration
node test-gemini.js
```

## 🆘 **Getting Help**

- **OpenAI Issues**: [OpenAI Help Center](https://help.openai.com/)
- **Google AI Issues**: [Google AI Support](https://ai.google/support/)
- **Azure Issues**: [Azure Support](https://azure.microsoft.com/support/)
- **Stripe Issues**: [Stripe Support](https://support.stripe.com/)
- **Project Issues**: Check project documentation and GitHub issues

---

**🎯 This covers ALL external services needed for your Vision Platform!**

**Start with Phase 1 services, then gradually add Phase 2 and 3 as needed.**

