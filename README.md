# Vision Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org/)
[![Docker](https://img.shields.io/badge/Docker-20+-lightblue.svg)](https://docker.com/)

**Vision Platform** is a comprehensive AI-powered platform that combines **Cross-language Multimodal Translation** and **Multimodal Accessibility Companion** for visually impaired users. Built with modern technologies and following accessibility best practices.

## 🚀 Features

### 🌍 Multimodal Translation
- **Text-to-Text Translation** with auto language detection
- **Speech-to-Text** → Translate → **Text-to-Speech** pipeline
- **Image-to-Text Translation** using OCR technology
- **Real-time Conversation Mode** between languages
- **Translation Memory** and user glossary
- **50+ Language Support** with demo content for 10 languages
- **Offline Fallback** with lightweight on-device models

### ♿ Accessibility Features
- **Voice-first UX** with full voice control flows
- **OCR Reader** for printed & handwritten text
- **Scene Description** using AI vision models
- **Object Detection** with distance alerts
- **Navigation Assistance** with step-by-step voice guidance
- **Customizable Voice Speed** and verbosity
- **Privacy Mode** for on-device processing
- **WCAG 2.1 AA Compliance**

### 🔧 Technical Features
- **Real-time WebSocket** communication
- **Progressive Web App** support
- **Dark/Light Mode** with high contrast options
- **Offline Mode** with service worker
- **Push Notifications** for alerts
- **Analytics Dashboard** for usage metrics
- **Comprehensive Testing** (Unit, Integration, E2E)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AI Service    │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (FastAPI)     │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │    MongoDB      │    │      Redis      │
│   Reverse Proxy │    │   Database      │    │     Cache       │
│   Port: 80/443  │    │   Port: 27017   │    │   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│     MinIO       │
│   S3 Storage    │
│   Port: 9000    │
└─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for data fetching
- **Socket.io Client** for real-time
- **PWA** support with offline capabilities

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** ODM
- **Redis** for caching and sessions
- **JWT** authentication with refresh tokens
- **Passport.js** for OAuth strategies
- **Socket.io** for WebSocket support
- **Swagger/OpenAPI** documentation

### AI Service
- **Python 3.9+** with **FastAPI**
- **PyTorch** and **Transformers** for ML models
- **OpenCV** for computer vision
- **EasyOCR** and **PaddleOCR** for text recognition
- **Whisper** and **Vosk** for speech recognition
- **Coqui TTS** for text-to-speech
- **YOLOv8** for object detection
- **MarianMT** for translation models

### Infrastructure
- **Docker** and **Docker Compose**
- **Nginx** reverse proxy with SSL
- **MinIO** S3-compatible storage
- **Prometheus** and **Grafana** monitoring
- **GitHub Actions** CI/CD

## 📋 Prerequisites

- **Node.js** 18.0.0 or higher
- **Python** 3.9 or higher
- **Docker** 20.0.0 or higher
- **Docker Compose** 2.0.0 or higher
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/vision-platform.git
cd vision-platform
```

### 2. Environment Setup
```bash
# Copy environment file
cp env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Install Dependencies
```bash
# Install all dependencies
npm run install:all
```

### 4. Start the Platform
```bash
# Start all services with Docker
npm run setup

# Or start manually
npm run docker:up
```

### 5. Access the Platform
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Service**: http://localhost:8000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **MinIO Console**: http://localhost:9001
- **API Docs**: http://localhost:3001/api-docs

## 🧪 Development

### Start Development Environment
```bash
# Start all services in development mode
npm run dev

# Or start individual services
npm run dev:frontend    # Frontend on port 3000
npm run dev:backend     # Backend on port 3001
npm run dev:ai          # AI service on port 8000
```

### Testing
```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:frontend
npm run test:backend
npm run test:ai

# Run with coverage
npm run test:coverage
```

### Linting and Formatting
```bash
# Run linters
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🐳 Docker Commands

### Development
```bash
# Start development stack
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down

# Clean up
npm run docker:clean
```

### Production
```bash
# Start production stack
npm run prod:up

# Build production images
npm run prod:build

# Stop production services
npm run prod:down
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Translation Endpoints
- `POST /api/translation/text` - Text translation
- `POST /api/translation/speech` - Speech translation
- `POST /api/translation/image` - Image translation
- `GET /api/translation/history` - Translation history
- `POST /api/translation/glossary` - Manage glossary

### Accessibility Endpoints
- `POST /api/accessibility/ocr` - OCR text recognition
- `POST /api/accessibility/scene` - Scene description
- `POST /api/accessibility/objects` - Object detection
- `POST /api/accessibility/navigation` - Navigation assistance

### AI Service Endpoints
- `POST /ai/translate` - AI-powered translation
- `POST /ai/stt` - Speech-to-text conversion
- `POST /ai/tts` - Text-to-speech synthesis
- `POST /ai/ocr` - OCR processing
- `POST /ai/vision` - Computer vision tasks

## 🔐 Environment Variables

Key environment variables (see `env.example` for complete list):

```bash
# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
MONGO_DATABASE=vision_platform

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# AI Services
OPENAI_API_KEY=your-openai-api-key
HUGGINGFACE_API_KEY=your-huggingface-api-key
USE_LOCAL_MODELS=true

# Storage
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
```

## 🧪 Testing

### Test Coverage Requirements
- **Unit Tests**: 80% minimum coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Core user workflows
- **Accessibility Tests**: WCAG 2.1 AA compliance

### Running Tests
```bash
# Frontend tests (Jest + Testing Library)
cd frontend && npm run test

# Backend tests (Jest + Supertest)
cd backend && npm run test

# AI service tests (Pytest)
cd ai_service && python -m pytest

# E2E tests (Playwright)
cd frontend && npm run test:e2e
```

## 🚀 Deployment

### Local Production Build
```bash
# Build all services
npm run build

# Start production stack
npm run prod:up
```

### Cloud Deployment
The platform is designed for deployment on:
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**
- **Render**
- **Railway**

### Infrastructure as Code
- **Terraform** configurations for AWS
- **CloudFormation** templates
- **Docker Compose** for orchestration
- **Kubernetes** manifests (optional)

## 📱 Mobile App

A React Native mobile app is planned for future releases, sharing the same backend API and AI services.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow **TypeScript** strict mode
- Use **ESLint** and **Prettier** for code quality
- Write **comprehensive tests** for new features
- Follow **accessibility best practices**
- Update **documentation** for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.visionplatform.com](https://docs.visionplatform.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/vision-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/vision-platform/discussions)
- **Email**: support@visionplatform.com

## 🙏 Acknowledgments

- **OpenAI** for GPT and Whisper models
- **Hugging Face** for transformer models
- **Mozilla** for Common Voice dataset
- **Google** for accessibility guidelines
- **Open Source Community** for amazing tools and libraries

---

**Made with ❤️ by the Vision Platform Team**
