# Vision Platform

A comprehensive, production-ready monorepo for **Cross-language Multimodal Translator** and **Multimodal Accessibility Companion for the Visually Impaired**.

## 🚀 Features

### Core Capabilities
- **Multimodal Translation**: Text, speech, and image translation between 50+ languages
- **AI-Powered Accessibility**: Real-time scene description, object detection, and navigation assistance
- **Cross-Platform**: Web (React + Vite), Mobile (React Native + Expo), and API services
- **WCAG 2.1 AA Compliant**: Built with accessibility as a first-class concern

### Technical Features
- **Monorepo Architecture**: Yarn workspaces with shared packages
- **Dockerized Services**: Complete containerization for development and production
- **Real-time Communication**: Socket.io for live translations and accessibility features
- **Comprehensive Testing**: Unit, integration, and E2E tests with 80%+ coverage
- **CI/CD Pipeline**: GitHub Actions for automated testing and deployment

## 🏗️ Architecture

```
Vision/
├── apps/
│   ├── web/                 # React + Vite web application
│   └── mobile/             # React Native + Expo mobile app
├── services/
│   ├── api/                # Node.js + Express API service
│   └── ai/                 # Python + FastAPI AI microservice
├── packages/
│   └── shared/             # Shared types and utilities
├── infrastructure/          # Docker, deployment configs
├── scripts/                 # Build and deployment scripts
└── tests/                   # E2E and integration tests
```

## 🛠️ Tech Stack

### Frontend
- **Web**: React 18, TypeScript, Vite, TailwindCSS
- **Mobile**: React Native, Expo, TypeScript
- **State Management**: Zustand, React Query
- **UI Components**: Custom accessible component library

### Backend
- **API Service**: Node.js, Express, TypeScript, MongoDB
- **AI Service**: Python, FastAPI, PyTorch, Transformers
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Storage**: AWS S3 (with MinIO for local dev)

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry, Winston, Prometheus
- **Deployment**: AWS ECS/Fargate, Vercel, Render

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Yarn or npm

### 1. Clone and Setup
```bash
git clone <repository-url>
cd Vision
yarn install
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start All Services
```bash
# Start all services with Docker
docker-compose up -d

# Or use the convenience script
./scripts/dev.sh
```

### 4. Access Applications
- **Web App**: http://localhost:5173
- **Mobile App**: Expo Go app (scan QR code)
- **API**: http://localhost:3001
- **AI Service**: http://localhost:8000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **MinIO**: http://localhost:9000

## 📱 Mobile App Development

### Start Mobile App
```bash
cd apps/mobile
yarn start
```

### Run on Device
1. Install Expo Go on your device
2. Scan the QR code from the terminal
3. The app will load on your device

## 🌐 Web App Development

### Start Web App
```bash
cd apps/web
yarn dev
```

### Build for Production
```bash
yarn build
yarn preview
```

## 🔧 Development Commands

### Root Level Commands
```bash
yarn dev          # Start all services
yarn build        # Build all packages
yarn test         # Run all tests
yarn lint         # Lint all packages
yarn format       # Format all code
```

### Individual Service Commands
```bash
# API Service
cd services/api
yarn dev          # Start API in development mode
yarn test         # Run API tests

# AI Service
cd services/ai
yarn dev          # Start AI service
yarn test         # Run AI tests

# Web App
cd apps/web
yarn dev          # Start web app
yarn build        # Build web app

# Mobile App
cd apps/mobile
yarn start        # Start Expo development server
yarn android      # Run on Android emulator
yarn ios          # Run on iOS simulator
```

## 🐳 Docker Commands

### Development
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d api
docker-compose up -d ai-service

# View logs
docker-compose logs -f api
docker-compose logs -f ai-service

# Rebuild and restart
docker-compose up -d --build api
```

### Production
```bash
# Use production compose file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🧪 Testing

### Run All Tests
```bash
yarn test
```

### Test Coverage
```bash
yarn test:coverage
```

### E2E Tests
```bash
yarn test:e2e
```

## 📊 API Documentation

### Swagger/OpenAPI
- **API Service**: http://localhost:3001/api-docs
- **AI Service**: http://localhost:8000/docs

### Health Checks
- **API Service**: http://localhost:3001/health
- **AI Service**: http://localhost:8000/health

## 🔐 Authentication & Security

- **JWT-based authentication** with refresh tokens
- **OAuth2** integration for social login
- **Role-based access control** (RBAC)
- **Rate limiting** and request validation
- **Input sanitization** and XSS protection
- **CORS** configuration
- **Helmet.js** security headers

## 🌍 Internationalization

- **Multi-language support** (50+ languages)
- **Sample translations** for 10 languages
- **RTL language support**
- **Localized content** and formatting

## ♿ Accessibility Features

- **WCAG 2.1 AA compliance**
- **Screen reader support**
- **Keyboard navigation**
- **High contrast mode**
- **Large text options**
- **Voice commands**
- **Audio feedback**

## 📈 Monitoring & Logging

- **Structured logging** with Winston
- **Error tracking** with Sentry
- **Performance monitoring** with Prometheus
- **Health checks** for all services
- **Request/response logging**

## 🚀 Deployment

### Production Deployment
```bash
# Build and package
yarn build
./scripts/zip_release.sh

# Deploy to cloud
./scripts/deploy.sh
```

### Cloud Platforms
- **AWS**: ECS/Fargate with Application Load Balancer
- **Vercel**: Web app deployment
- **Render**: API and AI service deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint and Prettier
- Write comprehensive tests
- Follow accessibility guidelines
- Document new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)
- **Discussions**: [GitHub Discussions](link-to-discussions)
- **Email**: support@visionplatform.com

## 🙏 Acknowledgments

- OpenAI for language models
- Hugging Face for transformer models
- Expo team for React Native tooling
- MongoDB team for database technology
- All contributors and maintainers

---

**Vision Platform** - Breaking down language barriers and enhancing accessibility through AI-powered technology.
