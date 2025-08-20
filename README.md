# 🚀 Vision Platform - AI-Powered Multimodal Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)

A comprehensive, production-ready AI-powered platform for multimodal translation, OCR, accessibility, and analytics. Built with modern microservices architecture and Docker containerization.

## 🚀 Features

### Core Services
- **Translation Service** - Multi-provider translation (Azure, Google, OpenAI, Mock)
- **OCR Service** - Text extraction from images and PDFs (Tesseract, Google Vision, Azure Vision)
- **Authentication** - Microsoft OAuth with JWT tokens
- **Analytics** - Comprehensive event tracking and reporting
- **Document Processing** - File upload, storage, and management

### AI Capabilities
- **Multimodal AI** - Text, image, and document processing
- **Language Detection** - Automatic language identification
- **Accessibility Features** - Object detection, scene analysis, contrast checking
- **Voice Commands** - Speech-to-text and voice navigation

### Platform Features
- **Real-time Analytics** - Live user activity and platform metrics
- **Subscription Management** - Free, Pro, and Enterprise plans
- **API Management** - RESTful APIs with comprehensive documentation
- **Monitoring** - Health checks, logging, and error tracking

## 🏗️ Architecture

```
Vision Platform
├── Frontend (React + Vite)
├── Backend (Node.js + Express)
├── AI Service (Python + FastAPI)
├── Mobile App (React Native + Expo)
├── Infrastructure (Docker + MongoDB + Redis + MinIO)
└── Monitoring (Prometheus + Grafana)
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Primary database
- **Redis** - Caching and sessions
- **JWT** - Authentication tokens
- **Winston** - Logging

### AI Service
- **Python** - AI/ML processing
- **FastAPI** - High-performance API framework
- **Tesseract** - OCR engine
- **Azure/Google Vision** - Cloud OCR services
- **OpenAI** - Language models

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **MSAL** - Microsoft authentication

### Infrastructure
- **Docker** - Containerization
- **MongoDB** - Document database
- **Redis** - In-memory data store
- **MinIO** - Object storage
- **Nginx** - Reverse proxy

## 📋 Prerequisites

- **Node.js** 18+ and **npm** 8+
- **Python** 3.11+
- **Docker** and **Docker Compose**
- **MongoDB** (or Docker)
- **Redis** (or Docker)

## 🚀 Quick Start

[![CI](https://github.com/omshivarjun/vision-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/omshivarjun/vision-platform/actions/workflows/ci.yml)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/vision-platform.git
cd vision-platform
```

### 2. Environment Setup
```bash
# Copy the comprehensive environment configuration
cp env.comprehensive .env

# Edit .env with your API keys
# Required: OPENAI_API_KEY, GOOGLE_API_KEY, HUGGINGFACE_API_KEY
# Optional: GOOGLE_CLOUD_PROJECT, STRIPE_SECRET_KEY, etc.
nano .env
```

### 3. Start All Services
```bash
# Start all services with Docker Compose
docker-compose up -d

# Check service status
docker-compose ps
```

### 4. Access Your Platform
- **Main Platform**: http://localhost
- **Web App**: http://localhost:5173
- **API Backend**: http://localhost:3001
- **AI Service**: http://localhost:8000
- **Monitoring**: http://localhost:3002 (admin/admin123)

## 🔧 Configuration

### Environment Variables

#### Database
```bash
MONGODB_URI=mongodb://admin:password123@localhost:27017/vision_platform?authSource=admin
REDIS_URL=redis://localhost:6379
```

#### Authentication
```bash
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

#### AI Services
```bash
OPENAI_API_KEY=sk-your-openai-api-key
GOOGLE_API_KEY=your-google-api-key
AZURE_TRANSLATOR_KEY=your-azure-translator-key
AZURE_TRANSLATOR_REGION=your-azure-region
```

#### File Storage
```bash
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
```

## 📚 API Documentation

### Authentication Endpoints
- `GET /api/auth/microsoft/url` - Get Microsoft OAuth URL
- `GET /api/auth/microsoft/callback` - OAuth callback
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Translation Endpoints
- `POST /api/translation/text` - Translate text
- `POST /api/translation/batch` - Batch translation
- `GET /api/translation/languages` - Get supported languages
- `GET /api/translation/providers` - Get available providers

### OCR Endpoints
- `POST /api/ocr/extract` - Extract text from file
- `POST /api/ocr/batch` - Batch OCR processing
- `GET /api/ocr/providers` - Get OCR providers
- `GET /api/ocr/formats` - Get supported formats

### Analytics Endpoints
- `POST /api/analytics/event` - Track custom event
- `GET /api/analytics/user` - Get user analytics
- `GET /api/analytics/platform` - Get platform analytics
- `GET /api/analytics/export` - Export analytics data

### Health Endpoints
- `GET /health` - Basic health check
- `GET /api/health` - API health status
- `GET /api/health/detailed` - Detailed health info
- `GET /api/health/ready` - Readiness probe

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd apps/web && npm test

# Integration tests
npm run test:integration

# Performance tests
npm run test:performance
```

### Test Coverage
```bash
npm run test:coverage
```

## 📊 Monitoring

### Health Checks
- **Liveness**: `/health` - Basic service health
- **Readiness**: `/api/health/ready` - Service readiness
- **Detailed**: `/api/health/detailed` - Comprehensive health

### Logging
- **Log Level**: Configurable via `LOG_LEVEL` environment variable
- **Log Files**: Stored in `logs/` directory
- **Rotation**: Automatic log rotation with size limits

### Metrics
- **Prometheus**: Available at port 9090
- **Grafana**: Dashboard at port 3002
- **Custom Metrics**: Application-specific metrics via analytics service

## 🎯 **Current Status - FULLY OPERATIONAL!**

### ✅ **All Services Running Successfully**
- **Frontend**: React web app with TypeScript and Vite
- **Backend**: Node.js API with Express and MongoDB
- **AI Service**: Python FastAPI service with OCR and translation
- **Database**: MongoDB and Redis with proper connections
- **Storage**: MinIO S3-compatible object storage
- **Reverse Proxy**: Nginx with proper upstream configuration
- **Monitoring**: Prometheus and Grafana dashboards

### 🚀 **Ready for Development**
- All syntax errors have been resolved
- Services are communicating properly
- Environment configuration is consolidated
- Docker containers are healthy and stable

## 🚀 Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart specific service
docker-compose restart [service-name]
```

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment-Specific Configs
- `docker-compose.yml` - Development
- `docker-compose.prod.yml` - Production
- `docker-compose.override.yml` - Local overrides

## 🔒 Security Features

- **Helmet** - Security headers
- **Rate Limiting** - API request throttling
- **CORS** - Cross-origin resource sharing
- **JWT** - Secure token-based authentication
- **Input Validation** - Request sanitization
- **Error Handling** - Secure error responses

## 📈 Analytics & Monitoring

### Event Tracking
- User authentication and actions
- Document processing and OCR
- Translation requests and usage
- Feature usage and errors
- Performance metrics

### Reporting
- User activity summaries
- Platform-wide statistics
- Category-specific analytics
- Data export capabilities
- Real-time dashboards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Guidelines
- Follow ESLint configuration
- Write comprehensive tests
- Update documentation
- Use conventional commits
- Follow the project structure

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the development team

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core translation service
- ✅ OCR capabilities
- ✅ Authentication system
- ✅ Analytics framework
- ✅ Basic API structure

### Phase 2 (Next)
- 🔄 Advanced AI models
- 🔄 Real-time collaboration
- 🔄 Mobile app features
- 🔄 Advanced analytics
- 🔄 Performance optimization

### Phase 3 (Future)
- 📋 Enterprise features
- 📋 Advanced security
- 📋 Global deployment
- 📋 Machine learning pipeline
- 📋 API marketplace

---

**Built with ❤️ by the Vision Platform Team**
