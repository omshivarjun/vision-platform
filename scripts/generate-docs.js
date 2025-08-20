#!/usr/bin/env node

/**
 * Documentation Generation Script
 * Generates documentation for the Vision Platform
 */

const fs = require('fs');
const path = require('path');

console.log('📚 Generating Vision Platform Documentation...');

// Create docs directory if it doesn't exist
const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Generate basic documentation
const generateDocs = () => {
  const timestamp = new Date().toISOString();
  
  // Generate README for docs
  const docsReadme = `# Vision Platform Documentation

Generated on: ${timestamp}

## Overview
The Vision Platform is an AI-powered platform for multimodal translation and accessibility.

## Architecture
- **Frontend**: React-based web application (apps/web)
- **Backend**: Node.js API server (backend/)
- **AI Service**: Python FastAPI service (services/ai/)
- **Shared**: Common types and utilities (packages/shared/)

## API Endpoints
- Health: \`/health\`, \`/api/health\`
- Translation: \`/api/translation/*\`
- OCR: \`/api/ocr/*\`
- Authentication: \`/api/auth/*\`
- Documents: \`/api/documents/*\`

## Development
\`\`\`bash
# Install dependencies
npm run install:all

# Start development environment
npm run dev

# Run tests
npm run test

# Build all packages
npm run build:all
\`\`\`

## Testing
- Unit tests: \`npm run test\`
- Integration tests: \`npm run test:integration\`
- Performance tests: \`npm run test:performance\`
- Coverage: \`npm run test:coverage\`

## Deployment
The platform uses Docker containers and can be deployed using:
- Docker Compose for local development
- Kubernetes for production deployment
- AWS ECS/EKS for cloud deployment

## Monitoring
- Health checks for all services
- Logging with Winston
- Metrics collection
- Error tracking

---
*This documentation is auto-generated. Please update the source code for permanent changes.*
`;

  fs.writeFileSync(path.join(docsDir, 'README.md'), docsReadme);
  
  // Generate API documentation
  const apiDocs = `# API Documentation

## Authentication
\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
\`\`\`

## Translation
\`\`\`http
POST /api/translation/text
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Hello world",
  "sourceLanguage": "en",
  "targetLanguage": "es"
}
\`\`\`

## OCR
\`\`\`http
POST /api/ocr/extract
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
\`\`\`

## Health Check
\`\`\`http
GET /health
\`\`\`
`;

  fs.writeFileSync(path.join(docsDir, 'API.md'), apiDocs);
  
  // Generate deployment guide
  const deploymentGuide = `# Deployment Guide

## Prerequisites
- Docker and Docker Compose
- Node.js 18+
- Python 3.11+
- MongoDB
- Redis
- MinIO (for file storage)

## Local Development
\`\`\`bash
# Clone repository
git clone <repository-url>
cd vision-platform

# Install dependencies
npm run install:all

# Start services
npm run dev

# Access applications
# Web: http://localhost:3000
# Backend: http://localhost:5000
# AI Service: http://localhost:8000
\`\`\`

## Production Deployment
\`\`\`bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
\`\`\`

## Environment Variables
\`\`\`bash
# Copy example environment file
cp env.example .env

# Configure your environment variables
MONGODB_URI=mongodb://localhost:27017/vision
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=your-stripe-key
\`\`\`
`;

  fs.writeFileSync(path.join(docsDir, 'DEPLOYMENT.md'), deploymentGuide);
  
  console.log('✅ Documentation generated successfully!');
  console.log(`📁 Documentation saved to: ${docsDir}`);
};

// Run documentation generation
try {
  generateDocs();
} catch (error) {
  console.error('❌ Error generating documentation:', error);
  process.exit(1);
}


