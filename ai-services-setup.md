# 🔧 Vision Platform - Additional AI Services Setup

## 📋 **Overview**

This guide helps you configure additional AI services beyond OpenAI for redundancy, cost optimization, and feature diversity.

## 🚀 **Available AI Services**

### **1. OpenAI (Already Configured)**
- ✅ **Status**: Active
- ✅ **Provider**: openai
- ✅ **Features**: Translation, text generation, function calling
- ✅ **Cost**: Pay-per-use

### **2. Azure Translator**
- 🔧 **Status**: Ready to configure
- 🔧 **Provider**: azure
- 🔧 **Features**: Translation, language detection
- 🔧 **Cost**: Pay-per-use with Azure credits

### **3. Google Translate**
- 🔧 **Status**: Ready to configure
- 🔧 **Provider**: google
- 🔧 **Features**: Translation, language detection
- 🔧 **Cost**: Pay-per-use with Google Cloud credits

### **4. Hugging Face (Local Models)**
- 🔧 **Status**: Ready to configure
- 🔧 **Provider**: huggingface
- 🔧 **Features**: Local AI models, offline capability
- 🔧 **Cost**: Free (local processing)

## 🔑 **Azure Translator Setup**

### **Step 1: Get Azure Translator Key**
1. Go to [Azure Portal](https://portal.azure.com/)
2. Search for "Translator"
3. Create a new Translator resource
4. Copy the **Key** and **Region**

### **Step 2: Add to .env File**
```bash
# Azure Translator Configuration
AZURE_TRANSLATOR_KEY=your-azure-translator-key-here
AZURE_TRANSLATOR_REGION=your-azure-region-here
```

### **Step 3: Test Azure Translation**
```bash
# Change provider to Azure
DEFAULT_TRANSLATION_PROVIDER=azure

# Restart services
docker-compose down
docker-compose up -d
```

## 🌐 **Google Translate Setup**

### **Step 1: Get Google API Key**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the "Cloud Translation API"
3. Create credentials (API Key)
4. Copy the API key

### **Step 2: Add to .env File**
```bash
# Google Translate Configuration
GOOGLE_API_KEY=your-google-api-key-here
```

### **Step 3: Test Google Translation**
```bash
# Change provider to Google
DEFAULT_TRANSLATION_PROVIDER=google

# Restart services
docker-compose down
docker-compose up -d
```

## 🤗 **Hugging Face Setup**

### **Step 1: Get Hugging Face API Key**
1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account
3. Go to Settings > Access Tokens
4. Create a new token

### **Step 2: Add to .env File**
```bash
# Hugging Face Configuration
HUGGINGFACE_API_KEY=hf_your-huggingface-token-here
USE_LOCAL_MODELS=true
MODEL_CACHE_DIR=/app/models
```

### **Step 3: Test Hugging Face**
```bash
# Change provider to Hugging Face
DEFAULT_TRANSLATION_PROVIDER=huggingface

# Restart services
docker-compose down
docker-compose up -d
```

## 🔄 **Provider Fallback Configuration**

### **Automatic Fallback Setup**
```bash
# Enable automatic fallback
ENABLE_PROVIDER_FALLBACK=true
TRANSLATION_PROVIDER_PRIORITY=openai,azure,google,huggingface,mock

# Fallback conditions
FALLBACK_ON_ERROR=true
FALLBACK_ON_RATE_LIMIT=true
FALLBACK_ON_QUOTA_EXCEEDED=true
```

### **Manual Provider Selection**
```bash
# Force specific provider
DEFAULT_TRANSLATION_PROVIDER=openai

# Or use environment variable
TRANSLATION_PROVIDER=azure
```

## 📊 **Cost Comparison**

| Provider | Cost per 1M chars | Features | Reliability |
|----------|-------------------|----------|-------------|
| **OpenAI** | $0.0020 | High quality, function calling | Excellent |
| **Azure** | $0.0010 | Good quality, enterprise | Excellent |
| **Google** | $0.0020 | Good quality, many languages | Excellent |
| **Hugging Face** | Free | Local processing, offline | Good |
| **Mock** | Free | Development/testing | Poor |

## 🧪 **Testing Different Providers**

### **Test Script**
```bash
# Test all providers
curl -X POST http://localhost:3001/api/translation/text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"text":"Hello world","targetLanguage":"es","provider":"openai"}'

curl -X POST http://localhost:3001/api/translation/text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"text":"Hello world","targetLanguage":"es","provider":"azure"}'

curl -X POST http://localhost:3001/api/translation/text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"text":"Hello world","targetLanguage":"es","provider":"google"}'
```

## 🔧 **Advanced Configuration**

### **Provider-Specific Settings**
```bash
# OpenAI specific
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.3

# Azure specific
AZURE_TRANSLATOR_API_VERSION=3.0
AZURE_TRANSLATOR_CATEGORY=general

# Google specific
GOOGLE_TRANSLATE_MODEL=base
GOOGLE_TRANSLATE_FORMAT=text

# Hugging Face specific
HUGGINGFACE_MODEL_NAME=Helsinki-NLP/opus-mt-en-es
HUGGINGFACE_CACHE_SIZE=5GB
```

### **Load Balancing**
```bash
# Enable load balancing
ENABLE_LOAD_BALANCING=true
LOAD_BALANCING_STRATEGY=round_robin

# Weight-based routing
PROVIDER_WEIGHTS=openai:0.4,azure:0.3,google:0.2,huggingface:0.1
```

## 📈 **Monitoring and Analytics**

### **Provider Performance Metrics**
```bash
# Enable provider monitoring
ENABLE_PROVIDER_MONITORING=true
MONITOR_RESPONSE_TIME=true
MONITOR_SUCCESS_RATE=true
MONITOR_COST_PER_REQUEST=true
```

### **Grafana Dashboard Queries**
```promql
# Translation success rate by provider
rate(translation_success_total{provider=~".*"}[5m])

# Response time by provider
histogram_quantile(0.95, rate(translation_duration_seconds_bucket{provider=~".*"}[5m]))

# Cost per request by provider
rate(translation_cost_total{provider=~".*"}[5m])
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Azure Translator Issues**
```bash
# Check Azure configuration
docker exec vision-backend node -e "console.log('Azure Key:', process.env.AZURE_TRANSLATOR_KEY ? 'Set' : 'Missing'); console.log('Azure Region:', process.env.AZURE_TRANSLATOR_REGION);"
```

#### **Google Translate Issues**
```bash
# Check Google configuration
docker exec vision-backend node -e "console.log('Google Key:', process.env.GOOGLE_API_KEY ? 'Set' : 'Missing');"
```

#### **Hugging Face Issues**
```bash
# Check Hugging Face configuration
docker exec vision-backend node -e "console.log('HF Key:', process.env.HUGGINGFACE_API_KEY ? 'Set' : 'Missing'); console.log('Local Models:', process.env.USE_LOCAL_MODELS);"
```

### **Provider Health Checks**
```bash
# Check all provider statuses
docker logs vision-backend | Select-String -Pattern "Translation service initialized|provider:|fallback"
```

## 🎯 **Recommended Setup**

### **Development Environment**
```bash
DEFAULT_TRANSLATION_PROVIDER=mock
ENABLE_PROVIDER_FALLBACK=false
```

### **Production Environment**
```bash
DEFAULT_TRANSLATION_PROVIDER=openai
ENABLE_PROVIDER_FALLBACK=true
TRANSLATION_PROVIDER_PRIORITY=openai,azure,google,mock
```

### **Enterprise Environment**
```bash
DEFAULT_TRANSLATION_PROVIDER=azure
ENABLE_PROVIDER_FALLBACK=true
TRANSLATION_PROVIDER_PRIORITY=azure,openai,google,mock
ENABLE_LOAD_BALANCING=true
```

## 📚 **Next Steps**

1. **Choose your preferred providers** based on cost and features
2. **Get API keys** for the services you want to use
3. **Update your .env file** with the new configurations
4. **Test each provider** to ensure they're working correctly
5. **Set up monitoring** to track performance and costs
6. **Configure fallback** for reliability

## 🔗 **Useful Links**

- [Azure Translator Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/)
- [Google Cloud Translation API](https://cloud.google.com/translate/docs)
- [Hugging Face Models](https://huggingface.co/models)
- [OpenAI API Documentation](https://platform.openai.com/docs/)

---

**🎉 With multiple AI providers configured, your Vision Platform will be more reliable, cost-effective, and feature-rich!**

