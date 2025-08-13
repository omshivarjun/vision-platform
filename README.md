# 🌟 Vision Platform

**Complete Vision Platform: Cross-language Multimodal Translator + Multimodal Accessibility Companion for the Visually Impaired**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org/)
[![Docker](https://img.shields.io/badge/Docker-20.10+-blue.svg)](https://docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://typescriptlang.org/)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/vision-platform.git
cd vision-platform

# Quick setup (recommended for first time)
make setup

# Start development environment
make dev
```

**Access your applications:**
- 🌐 **Web Frontend**: http://localhost:3000
- 📱 **Mobile Dev Server**: http://localhost:19000
- 🔌 **API Service**: http://localhost:3001
- 🤖 **AI Service**: http://localhost:8000
- 📊 **MinIO Console**: http://localhost:9001
- 📈 **Grafana**: http://localhost:3002
- 📊 **Prometheus**: http://localhost:9090

## 🎯 What is Vision Platform?

Vision Platform is a comprehensive, production-ready monorepo that bundles **two full projects in one platform**:

### 1. 🌍 Cross-language Multimodal Translator
- **Text-to-text translation** with auto language detection and 50+ language support
- **Speech-to-text** (batch & real-time) → translate → text-to-speech output
- **Image-to-text translation** via camera/upload → OCR → translate → read aloud
- **Conversation mode** with real-time translation between two languages
- **Translation memory** and user glossary for terminology preservation
- **Offline fallback** with on-device translation models for essential languages

### 2. 🦯 Multimodal Accessibility Companion for the Visually Impaired
- **Voice-first user experience** with natural language commands
- **OCR reader** for printed and handwritten text
- **Scene description** and object detection with spatial awareness
- **Navigation assistance** with voice guidance and obstacle warnings
- **WCAG 2.1 AA compliant** interface with high contrast and screen reader support
- **Privacy mode** with on-device processing options

## 🏗️ Architecture

```
Vision Platform
├── 📱 Apps
│   ├── Web (Next.js + React + TailwindCSS)
│   └── Mobile (React Native + Expo)
├── 🔌 Services
│   ├── API (Node.js + Express + TypeScript)
│   └── AI (Python + FastAPI + ML Models)
├── 📦 Packages
│   └── Shared (Types, Utilities, Models)
├── 🏗️ Infrastructure
│   ├── MongoDB + Redis + MinIO
│   ├── Nginx + Monitoring Stack
│   └── Docker + Docker Compose
└── 🧪 Tests + CI/CD
    ├── Unit + Integration + E2E Tests
    └── GitHub Actions + Docker Deployment
```

## ✨ Key Features

### 🌍 Translation Capabilities
- **50+ Languages** with native speaker quality
- **Multimodal Input**: Text, Speech, Images, Documents
- **Real-time Processing** with WebSocket support
- **Translation Memory** for consistent terminology
- **Offline Support** for essential languages
- **Batch Processing** for large documents

### 🦯 Accessibility Features
- **Voice Navigation** with natural language commands
- **Scene Understanding** via AI-powered image analysis
- **Text Recognition** for printed and handwritten content
- **Audio Descriptions** with customizable voice settings
- **Haptic Feedback** for mobile devices
- **High Contrast** and large text options

### 🚀 Technical Features
- **Monorepo Architecture** with shared code and types
- **Docker Containerization** for easy deployment
- **Real-time Communication** via WebSockets
- **Comprehensive Testing** with 80%+ coverage
- **CI/CD Pipeline** with automated deployment
- **Monitoring & Logging** with Prometheus + Grafana
- **Security First** with JWT, rate limiting, and CORS

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Next.js 13** with App Router
- **TailwindCSS** for styling
- **React Native** with Expo for mobile
- **Socket.IO Client** for real-time features

### Backend
- **Node.js 18+** with TypeScript
- **Express.js** with middleware stack
- **MongoDB** with Mongoose ODM
- **Redis** for caching and sessions
- **JWT** authentication with refresh tokens

### AI Services
- **Python 3.8+** with FastAPI
- **OpenAI GPT-4** integration
- **Google Cloud AI** services
- **Hugging Face** models
- **Local ML models** for offline use

### Infrastructure
- **Docker** and Docker Compose
- **MongoDB** for data persistence
- **Redis** for caching and queues
- **MinIO** for S3-compatible storage
- **Nginx** as reverse proxy
- **Prometheus + Grafana** for monitoring

## 📋 Prerequisites

- **Docker** 20.10+ and Docker Compose 2.0+
- **Node.js** 18+ and npm 8+
- **Python** 3.8+ and pip
- **Git** for version control
- **8GB RAM** minimum (16GB recommended)
- **20GB free disk space**

## 🚀 Installation & Setup

### Option 1: Quick Setup (Recommended)
```bash
# Clone and setup
git clone https://github.com/your-username/vision-platform.git
cd vision-platform
make setup

# Start development
make dev
```

### Option 2: Manual Setup
```bash
# 1. Clone repository
git clone https://github.com/your-username/vision-platform.git
cd vision-platform

# 2. Configure environment
cp env.example .env
# Edit .env with your configuration

# 3. Install dependencies
make install

# 4. Start Docker services
make docker-up

# 5. Start development environment
make dev
```

### Option 3: Production Deployment
```bash
# 1. Build production images
make build

# 2. Deploy to production
make deploy-prod

# 3. Create release package
make zip-release
```

## 🔧 Configuration

### Environment Variables
Copy `env.example` to `.env` and configure:

```bash
# Core Configuration
NODE_ENV=development
APP_PORT=3000
API_PORT=3001
AI_SERVICE_PORT=8000

# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/vision_platform
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=your_openai_key
GOOGLE_CLOUD_CREDENTIALS=your_google_credentials
HUGGINGFACE_API_KEY=your_huggingface_key

# Security
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Storage
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
```

### Feature Flags
Enable/disable features via environment variables:

```bash
# Core Features
ENABLE_REAL_TIME_TRANSLATION=true
ENABLE_OFFLINE_MODE=false
ENABLE_ADVANCED_OCR=true
ENABLE_VOICE_NAVIGATION=true

# Accessibility Features
ENABLE_VOICE_CONTROL=true
ENABLE_HAPTIC_FEEDBACK=true
ENABLE_HIGH_CONTRAST=true

# Privacy Features
ENABLE_CLOUD_PROCESSING=true
ENABLE_ANALYTICS=false
```

## 🧪 Testing

### Run All Tests
```bash
make test
```

### Specific Test Types
```bash
# Unit tests only
make test-unit

# Integration tests only
make test-integration

# End-to-end tests only
make test-e2e

# Generate coverage report
make coverage
```

### Test Coverage
- **Unit Tests**: 90%+ coverage
- **Integration Tests**: API and database testing
- **E2E Tests**: Full user workflow testing
- **Performance Tests**: Load and stress testing

## 🐳 Docker Commands

### Development
```bash
# Start all services
make docker-up

# View logs
make docker-logs

# Stop services
make docker-down

# Clean up
make docker-clean
```

### Production
```bash
# Start production stack
make prod-up

# View production logs
make prod-logs

# Stop production
make prod-down
```

## 📊 Monitoring & Health Checks

### Service Health
- **API Health**: http://localhost:3001/health
- **AI Service Health**: http://localhost:8000/health
- **Web Frontend**: http://localhost:3000

### Monitoring Dashboards
- **Grafana**: http://localhost:3002 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **MinIO Console**: http://localhost:9001

### Metrics
- **Application Metrics**: Response times, error rates
- **System Metrics**: CPU, memory, disk usage
- **Business Metrics**: Translation counts, user activity
- **AI Metrics**: Model performance, inference times

## 🚀 Deployment

### Development Deployment
```bash
make deploy-dev
```

### Production Deployment
```bash
make deploy-prod
```

### Create Release Package
```bash
make zip-release
```

### Deployment Targets
- **Local Development**: Docker Compose
- **Cloud Platforms**: AWS, Azure, GCP
- **Container Orchestration**: Kubernetes, Docker Swarm
- **Serverless**: Vercel (frontend), AWS Lambda (backend)

## 📱 Mobile App Development

### Expo Development
```bash
cd apps/mobile

# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Build for production
npm run build:android
npm run build:ios
```

### Mobile Features
- **Cross-platform** React Native app
- **Offline-first** architecture
- **Native device features** (camera, GPS, sensors)
- **Accessibility support** with VoiceOver/TalkBack
- **Push notifications** for real-time updates

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (user, moderator, admin)
- **Input validation** and sanitization
- **Rate limiting** and DDoS protection
- **CORS configuration** for cross-origin requests
- **Security headers** via Helmet middleware
- **Password hashing** with bcrypt
- **Session management** with Redis

## 📈 Performance Optimization

- **Redis caching** for translations and AI responses
- **Connection pooling** for database connections
- **CDN-ready** static assets
- **Image optimization** and compression
- **Lazy loading** for components and routes
- **Service worker** for offline functionality
- **Horizontal scaling** support

## 🌐 Internationalization

### Supported Languages
- **Primary**: English, Spanish, French, German, Italian
- **Extended**: Portuguese, Russian, Japanese, Korean, Chinese
- **Regional**: Arabic, Hindi, Turkish, Dutch, Polish, Swedish

### i18n Features
- **Automatic language detection**
- **RTL language support**
- **Cultural adaptations**
- **Localized content** and formatting
- **Accessibility translations**

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Conventional commits** for git messages
- **80%+ test coverage** requirement

### Testing Guidelines
- **Unit tests** for all functions
- **Integration tests** for APIs
- **E2E tests** for user workflows
- **Performance tests** for critical paths

## 📚 Documentation

### API Documentation
- **Swagger/OpenAPI**: http://localhost:3001/api-docs
- **Postman Collection**: Available in `/docs` folder
- **API Examples**: Comprehensive examples for all endpoints

### User Guides
- **Translation Guide**: How to use translation features
- **Accessibility Guide**: Accessibility features and settings
- **Mobile App Guide**: Mobile app usage and features
- **API Reference**: Complete API documentation

### Developer Guides
- **Architecture Overview**: System design and components
- **Development Setup**: Local development environment
- **Testing Guide**: Testing strategies and examples
- **Deployment Guide**: Production deployment steps

## 🐛 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :3000

# Stop conflicting services
sudo lsof -ti:3000 | xargs kill -9
```

#### Docker Issues
```bash
# Clean Docker resources
make docker-clean

# Rebuild images
make docker-build

# Check Docker logs
make docker-logs
```

#### Memory Issues
```bash
# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory: 8GB+

# Check memory usage
docker stats
```

### Getting Help
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Documentation**: Comprehensive guides and examples
- **Community**: Active developer community

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 integration
- **Google Cloud** for AI services
- **Hugging Face** for open-source models
- **Expo** for React Native development
- **Vercel** for Next.js hosting
- **Docker** for containerization

## 📞 Support

- **Documentation**: [docs.vision-platform.com](https://docs.vision-platform.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/vision-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/vision-platform/discussions)
- **Email**: support@vision-platform.com

---

**Made with ❤️ for accessibility and global communication**

*Vision Platform - Breaking barriers through technology*
