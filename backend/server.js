const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { GoogleGenerativeAI } = require('@google/generative-ai')
const OpenAI = require('openai')

const app = express()
const PORT = process.env.PORT || 3001

// Initialize AI services
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true)
  },
})

// In-memory storage (replace with database in production)
const documents = new Map()
const conversations = new Map()
const analytics = {
  events: [],
  realTime: {
    activeUsers: 0,
    pageViews: 0,
    events: [],
    topPages: [],
  },
}

// Helper functions
const generateMockData = () => {
  return {
    activeUsers: Math.floor(Math.random() * 100) + 50,
    pageViews: Math.floor(Math.random() * 1000) + 500,
    events: [
      { name: 'page_view', count: Math.floor(Math.random() * 100) + 20, timestamp: new Date().toISOString() },
      { name: 'translation', count: Math.floor(Math.random() * 50) + 10, timestamp: new Date().toISOString() },
      { name: 'document_upload', count: Math.floor(Math.random() * 30) + 5, timestamp: new Date().toISOString() },
    ],
    topPages: [
      { path: '/translation', views: Math.floor(Math.random() * 200) + 100 },
      { path: '/documents', views: Math.floor(Math.random() * 150) + 80 },
      { path: '/assistant', views: Math.floor(Math.random() * 120) + 60 },
    ],
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Payment routes
app.post('/api/payments/create-checkout-session', async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl, customerEmail } = req.body

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
    })

    res.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
})

app.post('/api/payments/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, customerId, metadata } = req.body

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      metadata,
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({ error: 'Failed to create payment intent' })
  }
})

app.post('/api/payments/confirm-payment-intent/:id', async (req, res) => {
  try {
    const { id } = req.params
    const paymentIntent = await stripe.paymentIntents.retrieve(id)
    
    res.json({ status: paymentIntent.status })
  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({ error: 'Failed to confirm payment intent' })
  }
})

app.get('/api/payments/payment-intent/:id', async (req, res) => {
  try {
    const { id } = req.params
    const paymentIntent = await stripe.paymentIntents.retrieve(id)
    
    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    })
  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({ error: 'Failed to retrieve payment intent' })
  }
})

// Subscription routes
app.get('/api/subscriptions/plans', (req, res) => {
  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 999,
      currency: 'usd',
      interval: 'month',
      features: ['Basic translation', 'Document processing', 'Email support'],
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 1999,
      currency: 'usd',
      interval: 'month',
      features: ['Advanced translation', 'Unlimited documents', 'Priority support', 'Analytics'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 4999,
      currency: 'usd',
      interval: 'month',
      features: ['Custom AI models', 'API access', 'Dedicated support', 'Advanced analytics'],
    },
  ]
  
  res.json(plans)
})

app.post('/api/subscriptions/create', async (req, res) => {
  try {
    const { planId, customerEmail, paymentMethodId } = req.body
    
    // In a real app, you'd create a customer and subscription in Stripe
    const subscriptionId = uuidv4()
    
    res.json({
      subscriptionId,
      status: 'active',
    })
  } catch (error) {
    console.error('Subscription error:', error)
    res.status(500).json({ error: 'Failed to create subscription' })
  }
})

app.post('/api/subscriptions/:id/cancel', (req, res) => {
  try {
    const { id } = req.params
    
    res.json({ status: 'cancelled' })
  } catch (error) {
    console.error('Subscription error:', error)
    res.status(500).json({ error: 'Failed to cancel subscription' })
  }
})

// Customer routes
app.get('/api/customers/:id', (req, res) => {
  try {
    const { id } = req.params
    
    // Mock customer data
    res.json({
      id,
      email: 'customer@example.com',
      name: 'John Doe',
      subscription: {
        id: 'sub_123',
        status: 'active',
        plan: 'pro',
      },
    })
  } catch (error) {
    console.error('Customer error:', error)
    res.status(500).json({ error: 'Failed to retrieve customer' })
  }
})

app.post('/api/customers/create', (req, res) => {
  try {
    const { email, name } = req.body
    const customerId = uuidv4()
    
    res.json({ customerId })
  } catch (error) {
    console.error('Customer error:', error)
    res.status(500).json({ error: 'Failed to create customer' })
  }
})

app.post('/api/customers/billing-portal', (req, res) => {
  try {
    const { customerId } = req.body
    
    // In a real app, you'd create a billing portal session
    const url = `https://billing.stripe.com/session/${uuidv4()}`
    
    res.json({ url })
  } catch (error) {
    console.error('Billing portal error:', error)
    res.status(500).json({ error: 'Failed to create billing portal session' })
  }
})

// Document routes
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    const { language, extractText, extractStructure } = req.body
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    
    const documentId = uuidv4()
    const document = {
      id: documentId,
      status: 'uploaded',
      metadata: {
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        language: language || 'en',
      },
      filePath: file.path,
      createdAt: new Date().toISOString(),
    }
    
    documents.set(documentId, document)
    
    // Process document if requested
    if (extractText === 'true' || extractStructure === 'true') {
      document.status = 'processing'
      
      // Simulate processing
      setTimeout(() => {
        document.status = 'completed'
        document.text = `Extracted text from ${file.originalname}`
        document.structure = {
          sections: [
            { title: 'Introduction', content: 'Sample content' },
            { title: 'Main Content', content: 'More sample content' },
          ],
        }
      }, 2000)
    }
    
    res.json({
      documentId,
      status: document.status,
      text: document.text,
      structure: document.structure,
      metadata: document.metadata,
    })
  } catch (error) {
    console.error('Document upload error:', error)
    res.status(500).json({ error: 'Failed to upload document' })
  }
})

app.post('/api/documents/:id/process', async (req, res) => {
  try {
    const { id } = req.params
    const { extractText, extractStructure, performOCR } = req.body
    
    const document = documents.get(id)
    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }
    
    document.status = 'processing'
    
    // Simulate processing
    setTimeout(() => {
      document.status = 'completed'
      if (extractText === 'true') {
        document.text = `Processed text from ${document.metadata.fileName}`
      }
      if (extractStructure === 'true') {
        document.structure = {
          sections: [
            { title: 'Processed Section', content: 'Processed content' },
          ],
        }
      }
      if (performOCR === 'true') {
        document.ocrResults = {
          text: 'OCR extracted text',
          confidence: 0.95,
        }
      }
    }, 3000)
    
    res.json({
      status: document.status,
      text: document.text,
      structure: document.structure,
      ocrResults: document.ocrResults,
    })
  } catch (error) {
    console.error('Document processing error:', error)
    res.status(500).json({ error: 'Failed to process document' })
  }
})

app.get('/api/documents/:id', (req, res) => {
  try {
    const { id } = req.params
    const document = documents.get(id)
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }
    
    res.json(document)
  } catch (error) {
    console.error('Document retrieval error:', error)
    res.status(500).json({ error: 'Failed to retrieve document' })
  }
})

app.get('/api/documents', (req, res) => {
  try {
    const { status, fileType, limit = 10, offset = 0 } = req.query
    
    let filteredDocs = Array.from(documents.values())
    
    if (status) {
      filteredDocs = filteredDocs.filter(doc => doc.status === status)
    }
    
    if (fileType) {
      filteredDocs = filteredDocs.filter(doc => doc.metadata.fileType.includes(fileType))
    }
    
    const total = filteredDocs.length
    const paginatedDocs = filteredDocs.slice(offset, offset + limit)
    
    res.json({
      documents: paginatedDocs,
      total,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error('Documents retrieval error:', error)
    res.status(500).json({ error: 'Failed to retrieve documents' })
  }
})

app.delete('/api/documents/:id', (req, res) => {
  try {
    const { id } = req.params
    const document = documents.get(id)
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }
    
    // Delete file from disk
    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath)
    }
    
    documents.delete(id)
    
    res.json({ success: true })
  } catch (error) {
    console.error('Document deletion error:', error)
    res.status(500).json({ error: 'Failed to delete document' })
  }
})

// Assistant routes
app.post('/api/assistant/message', upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 5 },
  { name: 'audio', maxCount: 1 },
]), async (req, res) => {
  try {
    const { text, context, language, conversationId } = req.body
    const files = req.files
    
    if (!text && (!files || Object.keys(files).length === 0)) {
      return res.status(400).json({ error: 'No input provided' })
    }
    
    // Process files
    let fileAnalysis = ''
    if (files) {
      if (files.images) {
        fileAnalysis += `\nImages uploaded: ${files.images.length}`
      }
      if (files.documents) {
        fileAnalysis += `\nDocuments uploaded: ${files.documents.length}`
      }
      if (files.audio) {
        fileAnalysis += `\nAudio uploaded: 1`
      }
    }
    
    // Generate AI response
    let aiResponse = ''
    try {
      if (process.env.GOOGLE_API_KEY) {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
        const prompt = `User message: ${text}\nContext: ${context || 'No context'}\nLanguage: ${language || 'en'}\nFiles: ${fileAnalysis}\n\nPlease provide a helpful response.`
        const result = await model.generateContent(prompt)
        aiResponse = result.response.text()
      } else if (process.env.OPENAI_API_KEY) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant for the Vision Platform.',
            },
            {
              role: 'user',
              content: `User message: ${text}\nContext: ${context || 'No context'}\nLanguage: ${language || 'en'}\nFiles: ${fileAnalysis}`,
            },
          ],
        })
        aiResponse = completion.choices[0].message.content
      } else {
        aiResponse = `I understand your message: "${text}". ${fileAnalysis}\n\nThis is a mock response. Please configure your AI API keys for real responses.`
      }
    } catch (aiError) {
      console.error('AI error:', aiError)
      aiResponse = 'I apologize, but I encountered an error processing your request. Please try again.'
    }
    
    const messageId = uuidv4()
    const response = {
      messageId,
      content: aiResponse,
      suggestions: [
        'Can you explain this in more detail?',
        'What are the next steps?',
        'Can you provide an example?',
      ],
      actions: [
        {
          type: 'translate',
          description: 'Translate this response',
          parameters: { targetLanguage: 'es' },
        },
        {
          type: 'summarize',
          description: 'Summarize this response',
          parameters: { maxLength: 100 },
        },
      ],
      confidence: 0.9,
      processingTime: Date.now() - Date.now(),
    }
    
    res.json(response)
  } catch (error) {
    console.error('Assistant error:', error)
    res.status(500).json({ error: 'Failed to process message' })
  }
})

app.get('/api/assistant/conversations', (req, res) => {
  try {
    const { limit = 10, offset = 0, search } = req.query
    
    let filteredConversations = Array.from(conversations.values())
    
    if (search) {
      filteredConversations = filteredConversations.filter(conv => 
        conv.title.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    const total = filteredConversations.length
    const paginatedConversations = filteredConversations.slice(offset, offset + limit)
    
    res.json({
      conversations: paginatedConversations,
      total,
    })
  } catch (error) {
    console.error('Conversations retrieval error:', error)
    res.status(500).json({ error: 'Failed to retrieve conversations' })
  }
})

app.get('/api/assistant/conversations/:id', (req, res) => {
  try {
    const { id } = req.params
    const conversation = conversations.get(id)
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }
    
    res.json(conversation)
  } catch (error) {
    console.error('Conversation retrieval error:', error)
    res.status(500).json({ error: 'Failed to retrieve conversation' })
  }
})

app.delete('/api/assistant/conversations/:id', (req, res) => {
  try {
    const { id } = req.params
    const conversation = conversations.get(id)
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }
    
    conversations.delete(id)
    
    res.json({ success: true })
  } catch (error) {
    console.error('Conversation deletion error:', error)
    res.status(500).json({ error: 'Failed to delete conversation' })
  }
})

// Analytics routes
app.post('/api/analytics/events', (req, res) => {
  try {
    const { name, properties, userId, sessionId } = req.body
    
    const event = {
      id: uuidv4(),
      name,
      properties,
      userId,
      sessionId,
      timestamp: new Date().toISOString(),
    }
    
    analytics.events.push(event)
    
    // Update real-time data
    analytics.realTime.events.push({
      name,
      count: 1,
      timestamp: new Date().toISOString(),
    })
    
    // Keep only recent events
    if (analytics.realTime.events.length > 100) {
      analytics.realTime.events = analytics.realTime.events.slice(-100)
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Analytics event error:', error)
    res.status(500).json({ error: 'Failed to track event' })
  }
})

app.get('/api/analytics/realtime', (req, res) => {
  try {
    // Generate mock real-time data
    const realTimeData = generateMockData()
    
    res.json(realTimeData)
  } catch (error) {
    console.error('Real-time analytics error:', error)
    res.status(500).json({ error: 'Failed to retrieve real-time data' })
  }
})

app.get('/api/analytics/metrics', (req, res) => {
  try {
    const { metric, timeRange, interval } = req.query
    
    // Generate mock historical data
    const data = []
    const now = new Date()
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 24
    
    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
      data.push({
        timestamp: timestamp.toISOString(),
        value: Math.floor(Math.random() * 100) + 10,
      })
    }
    
    const values = data.map(d => d.value)
    const summary = {
      total: values.reduce((sum, val) => sum + val, 0),
      average: Math.round(values.reduce((sum, val) => sum + val, 0) / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
    }
    
    res.json({ data, summary })
  } catch (error) {
    console.error('Historical metrics error:', error)
    res.status(500).json({ error: 'Failed to retrieve historical metrics' })
  }
})

app.get('/api/analytics/users/:userId', (req, res) => {
  try {
    const { userId } = req.params
    const { timeRange } = req.query
    
    // Mock user analytics
    res.json({
      userId,
      pageViews: Math.floor(Math.random() * 100) + 20,
      events: Math.floor(Math.random() * 50) + 10,
      sessions: Math.floor(Math.random() * 10) + 2,
      averageSessionDuration: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
      topActions: [
        { action: 'translation', count: Math.floor(Math.random() * 20) + 5 },
        { action: 'document_upload', count: Math.floor(Math.random() * 10) + 2 },
        { action: 'assistant_chat', count: Math.floor(Math.random() * 15) + 3 },
      ],
    })
  } catch (error) {
    console.error('User analytics error:', error)
    res.status(500).json({ error: 'Failed to retrieve user analytics' })
  }
})

app.get('/api/analytics/export', (req, res) => {
  try {
    const { format, startDate, endDate, metrics } = req.query
    
    // Mock export
    const downloadUrl = `/api/analytics/download/${uuidv4()}.${format}`
    
    res.json({ downloadUrl })
  } catch (error) {
    console.error('Analytics export error:', error)
    res.status(500).json({ error: 'Failed to export analytics' })
  }
})

// Translation routes
app.post('/api/translation/translate', async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage, context } = req.body
    
    if (!text || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    // Mock translation (replace with real AI translation)
    let translatedText = text
    if (targetLanguage === 'es') {
      translatedText = `[ES] ${text}`
    } else if (targetLanguage === 'fr') {
      translatedText = `[FR] ${text}`
    } else if (targetLanguage === 'de') {
      translatedText = `[DE] ${text}`
    }
    
    res.json({
      translatedText,
      confidence: 0.95,
      detectedLanguage: sourceLanguage,
      alternatives: [translatedText],
    })
  } catch (error) {
    console.error('Translation error:', error)
    res.status(500).json({ error: 'Failed to translate text' })
  }
})

app.post('/api/translation/detect', (req, res) => {
  try {
    const { text } = req.body
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' })
    }
    
    // Mock language detection
    const detectedLanguage = 'en'
    const confidence = 0.9
    
    res.json({
      detectedLanguage,
      confidence,
      alternatives: [
        { language: 'en', confidence: 0.9 },
        { language: 'es', confidence: 0.05 },
        { language: 'fr', confidence: 0.03 },
      ],
    })
  } catch (error) {
    console.error('Language detection error:', error)
    res.status(500).json({ error: 'Failed to detect language' })
  }
})

app.get('/api/translation/languages', (req, res) => {
  try {
    const languages = [
      { code: 'en', name: 'English', nativeName: 'English', supportsTranslation: true, supportsDetection: true },
      { code: 'es', name: 'Spanish', nativeName: 'Español', supportsTranslation: true, supportsDetection: true },
      { code: 'fr', name: 'French', nativeName: 'Français', supportsTranslation: true, supportsDetection: true },
      { code: 'de', name: 'German', nativeName: 'Deutsch', supportsTranslation: true, supportsDetection: true },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', supportsTranslation: true, supportsDetection: true },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', supportsTranslation: true, supportsDetection: true },
      { code: 'ru', name: 'Russian', nativeName: 'Русский', supportsTranslation: true, supportsDetection: true },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', supportsTranslation: true, supportsDetection: true },
      { code: 'ko', name: 'Korean', nativeName: '한국어', supportsTranslation: true, supportsDetection: true },
      { code: 'zh', name: 'Chinese', nativeName: '中文', supportsTranslation: true, supportsDetection: true },
    ]
    
    res.json(languages)
  } catch (error) {
    console.error('Languages retrieval error:', error)
    res.status(500).json({ error: 'Failed to retrieve languages' })
  }
})

// OCR routes
app.post('/api/ocr/extract', upload.single('image'), async (req, res) => {
  try {
    const image = req.file
    const { language, confidence } = req.body
    
    if (!image) {
      return res.status(400).json({ error: 'No image uploaded' })
    }
    
    // Mock OCR processing
    const text = `Sample OCR text extracted from ${image.originalname}`
    
    res.json({
      text,
      confidence: confidence || 0.95,
      language: language || 'en',
      regions: [
        {
          text: 'Sample',
          confidence: 0.98,
          boundingBox: [10, 10, 100, 30],
        },
        {
          text: 'OCR',
          confidence: 0.95,
          boundingBox: [110, 10, 180, 30],
        },
      ],
    })
  } catch (error) {
    console.error('OCR error:', error)
    res.status(500).json({ error: 'Failed to extract text from image' })
  }
})

app.post('/api/ocr/batch-extract', upload.array('images', 10), async (req, res) => {
  try {
    const images = req.files
    const { language, confidence } = req.body
    
    if (!images || images.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' })
    }
    
    const results = images.map((image, index) => ({
      imageId: uuidv4(),
      text: `Batch OCR text ${index + 1} from ${image.originalname}`,
      confidence: confidence || 0.95,
      language: language || 'en',
      regions: [
        {
          text: `Batch ${index + 1}`,
          confidence: 0.98,
          boundingBox: [10, 10, 100, 30],
        },
      ],
    }))
    
    res.json(results)
  } catch (error) {
    console.error('Batch OCR error:', error)
    res.status(500).json({ error: 'Failed to extract text from images' })
  }
})

// Accessibility routes
app.post('/api/accessibility/analyze-scene', upload.single('image'), async (req, res) => {
  try {
    const image = req.file
    const { includeObjects, includeText, includeColors } = req.body
    
    if (!image) {
      return res.status(400).json({ error: 'No image uploaded' })
    }
    
    // Mock scene analysis
    const description = `This image shows a sample scene with various elements that can be analyzed for accessibility purposes.`
    
    const objects = includeObjects === 'true' ? [
      {
        name: 'sample object',
        confidence: 0.95,
        boundingBox: [50, 50, 200, 150],
      },
    ] : []
    
    const colors = includeColors === 'true' ? [
      { color: '#ffffff', percentage: 60 },
      { color: '#000000', percentage: 30 },
      { color: '#cccccc', percentage: 10 },
    ] : []
    
    res.json({
      description,
      objects,
      colors,
      accessibility: {
        hasText: includeText === 'true',
        hasHighContrast: true,
        isColorBlindFriendly: true,
        recommendations: [
          'Ensure sufficient color contrast',
          'Add alt text for important elements',
          'Use clear, readable fonts',
        ],
      },
    })
  } catch (error) {
    console.error('Scene analysis error:', error)
    res.status(500).json({ error: 'Failed to analyze scene' })
  }
})

app.post('/api/accessibility/detect-objects', upload.single('image'), async (req, res) => {
  try {
    const image = req.file
    const { confidence, maxObjects } = req.body
    
    if (!image) {
      return res.status(400).json({ error: 'No image uploaded' })
    }
    
    // Mock object detection
    const objects = [
      {
        name: 'detected object 1',
        confidence: confidence || 0.95,
        boundingBox: [10, 10, 100, 100],
        attributes: { type: 'sample', size: 'medium' },
      },
      {
        name: 'detected object 2',
        confidence: 0.88,
        boundingBox: [150, 50, 250, 150],
        attributes: { type: 'sample', size: 'large' },
      },
    ]
    
    res.json({
      objects: maxObjects ? objects.slice(0, parseInt(maxObjects)) : objects,
      totalObjects: objects.length,
    })
  } catch (error) {
    console.error('Object detection error:', error)
    res.status(500).json({ error: 'Failed to detect objects' })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Vision Platform Backend Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔧 API Base: http://localhost:${PORT}/api`)
})

module.exports = app
