# Multimodal AI Service

A comprehensive AI microservice for translation, OCR, and accessibility features.

## Features

- **Translation**: Multi-language text translation with online/offline support
- **OCR**: Optical Character Recognition for extracting text from images
- **Speech**: Text-to-speech and speech-to-text capabilities
- **Accessibility**: Content analysis and enhancement for accessibility compliance
- **Health Checks**: Service monitoring and health endpoints

## Quick Start

### 1. Install Dependencies

```bash
cd services/ai
pip install -r requirements.txt
```

### 2. Run the Service

```bash
python main.py
```

The service will start on `http://localhost:8000`

### 3. Test the Service

```bash
python test_app.py
```

### 4. API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Translation
- `POST /api/translation/translate` - Translate text
- `GET /api/translation/languages` - Get supported languages
- `POST /api/translation/detect-language` - Detect text language

### OCR
- `POST /api/ocr/extract` - Extract text from image
- `POST /api/ocr/batch-extract` - Extract text from multiple images
- `GET /api/ocr/languages` - Get supported OCR languages

### Health
- `GET /health/` - Health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

## Environment Variables

Create a `.env` file with:
```
DEBUG=true
LOG_LEVEL=INFO
HOST=0.0.0.0
PORT=8000
```

## Docker Support

```bash
docker build -t ai-service .
docker run -p 8000:8000 ai-service
