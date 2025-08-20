# 📚 VISION PLATFORM - API DOCUMENTATION

## 📋 **Overview**

The Vision Platform provides comprehensive APIs for AI-powered document processing, translation, OCR, and analytics. The platform consists of two main API services:

- **Backend API** (Node.js/Express): Core platform functionality
- **AI Service API** (Python/FastAPI): AI and ML processing

## 🔐 **Authentication**

### **JWT Token Authentication**

Most API endpoints require authentication using JWT tokens.

#### **Login Flow**
```http
POST /api/auth/microsoft/url
```

#### **OAuth Callback**
```http
GET /api/auth/microsoft/callback?code={authorization_code}
```

#### **Token Refresh**
```http
POST /api/auth/refresh
Authorization: Bearer {refresh_token}
```

## 🔧 **Backend API**

**Base URL**: `http://localhost:3001/api`

### **Health Endpoints**

#### **Basic Health Check**
```http
GET /health
```

#### **API Health Status**
```http
GET /api/health
Authorization: Bearer {access_token}
```

### **Translation Endpoints**

#### **Translate Text**
```http
POST /api/translation/text
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### **Batch Translation**
```http
POST /api/translation/batch
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### **Get Supported Languages**
```http
GET /api/translation/languages
Authorization: Bearer {access_token}
```

### **Document Processing Endpoints**

#### **Upload Document**
```http
POST /api/documents/upload
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

#### **Process Document**
```http
POST /api/documents/{documentId}/process
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### **Get Document Status**
```http
GET /api/documents/{documentId}
Authorization: Bearer {access_token}
```

## 🤖 **AI Service API**

**Base URL**: `http://localhost:8000`

### **OCR Endpoints**

#### **Extract Text from Image**
```http
POST /ocr/extract
Content-Type: multipart/form-data
```

#### **Batch OCR Processing**
```http
POST /ocr/batch-extract
Content-Type: multipart/form-data
```

### **AI Assistant Endpoints**

#### **Send Message**
```http
POST /assistant/message
Content-Type: multipart/form-data
```

## ❌ **Error Handling**

All API endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "timestamp": "2025-08-20T12:00:00.000Z"
}
```

## 🚦 **Rate Limiting**

| Endpoint | Limit | Window |
|----------|-------|--------|
| Authentication | 5 requests | 1 minute |
| General API | 100 requests | 15 minutes |
| File Upload | 10 requests | 15 minutes |
| AI Processing | 20 requests | 15 minutes |

## 📚 **Additional Resources**

### **Interactive Documentation**
- **Backend API**: http://localhost:3001/api-docs
- **AI Service**: http://localhost:8000/docs

---

**API Version**: 1.0.0  
**Last Updated**: August 2025
