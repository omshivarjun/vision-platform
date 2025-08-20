# 🚀 **GEMINI AI Service - Usage Guide**

## 📋 **What This Solves**

✅ **Eliminates function calling errors** that were blocking your GEMINI CLI  
✅ **Supports long context prompts** without API limitations  
✅ **Handles file attachments** for document analysis  
✅ **Uses latest GEMINI models** (1.5-flash, 1.5-pro, etc.)  
✅ **Built-in error handling** and fallback mechanisms  

## 🔧 **Setup Instructions**

### **Step 1: Add Environment Variables**
Add these to your `.env` file:

```bash
# GEMINI Configuration
GOOGLE_API_KEY=your-actual-google-api-key-here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS=8192
ENABLE_GEMINI_FUNCTION_CALLING=false
```

### **Step 2: Install Dependencies**
```bash
npm install @google/generative-ai
```

### **Step 3: Test the Service**
```bash
node test-gemini.js
```

## 🎯 **API Endpoints**

### **1. Generate Content**
```bash
POST /api/gemini/generate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "prompt": "Your question here",
  "context": "Optional long context",
  "model": "gemini-1.5-flash",
  "options": {
    "temperature": 0.7,
    "maxTokens": 1000
  }
}
```

### **2. Generate with Files**
```bash
POST /api/gemini/generate-with-files
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "prompt": "Analyze this document",
  "files": [
    {
      "mimeType": "text/plain",
      "data": "base64-encoded-file-content"
    }
  ],
  "model": "gemini-1.5-pro"
}
```

### **3. Get Available Models**
```bash
GET /api/gemini/models
Authorization: Bearer YOUR_JWT_TOKEN
```

### **4. Check Service Status**
```bash
GET /api/gemini/status
Authorization: Bearer YOUR_JWT_TOKEN
```

## 💡 **Usage Examples**

### **Example 1: Simple Query**
```javascript
const response = await fetch('/api/gemini/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    prompt: "What is quantum computing?"
  })
});

const result = await response.json();
console.log(result.data.text);
```

### **Example 2: Long Context**
```javascript
const response = await fetch('/api/gemini/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    prompt: "Summarize the key points",
    context: "Very long context text here...",
    model: "gemini-1.5-pro"
  })
});
```

### **Example 3: File Analysis**
```javascript
const response = await fetch('/api/gemini/generate-with-files', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    prompt: "Analyze this document and extract key insights",
    files: [
      {
        mimeType: "text/plain",
        data: btoa("Document content here...")
      }
    ]
  })
});
```

## 🔍 **Error Handling**

The service automatically handles common errors:

- **Function Calling Errors**: Automatically disabled and handled
- **API Key Issues**: Clear error messages for configuration problems
- **Rate Limiting**: Built-in retry logic
- **Invalid Inputs**: Validation and helpful error messages

## 📊 **Response Format**

### **Success Response**
```json
{
  "success": true,
  "data": {
    "text": "Generated response text",
    "model": "gemini-1.5-flash",
    "usage": {
      "promptTokens": 150,
      "responseTokens": 300,
      "totalTokens": 450
    },
    "timestamp": "2025-08-20T03:45:00.000Z"
  }
}
```

### **Error Response**
```json
{
  "success": false,
  "error": "Error description",
  "errorType": "FUNCTION_CALLING_ERROR",
  "timestamp": "2025-08-20T03:45:00.000Z"
}
```

## 🚀 **Advanced Features**

### **Custom Models**
```javascript
// Use different models
{
  "model": "gemini-1.5-pro",
  "options": {
    "temperature": 0.3,
    "maxTokens": 2048
  }
}
```

### **Safety Settings**
```javascript
// Customize safety filters
{
  "options": {
    "safetySettings": [
      {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_LOW_AND_ABOVE"
      }
    ]
  }
}
```

## 🧪 **Testing Your Setup**

### **Quick Test Commands**
```bash
# Test 1: Simple generation
curl -X POST http://localhost:3001/api/gemini/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"prompt":"Hello, how are you?"}'

# Test 2: Long context
curl -X POST http://localhost:3001/api/gemini/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"prompt":"Summarize this","context":"Very long text..."}'
```

## 🎉 **Benefits Over GEMINI CLI**

- ✅ **No function calling errors**
- ✅ **Integrated with your Vision Platform**
- ✅ **Proper error handling and logging**
- ✅ **Authentication and rate limiting**
- ✅ **File attachment support**
- ✅ **Long context handling**
- ✅ **Multiple model support**

---

**🎯 You now have a robust GEMINI service that handles long context prompts without the function calling errors!**

**Get your Google API key, add it to .env, and start using the latest GEMINI models in your Vision Platform!** 🚀

