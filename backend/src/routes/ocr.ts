import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = express.Router()

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/ocr')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/tiff',
      'image/bmp'
    ]
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid image type'), false)
    }
  }
})

// Extract text from single image
router.post('/extract', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' })
    }

    const { language, confidence } = req.body

    // Mock OCR processing
    const mockOCRResult = {
      text: 'This is sample text extracted from the uploaded image. It contains multiple lines and various characters.',
      confidence: confidence ? parseFloat(confidence) : 0.95,
      language: language || 'en',
      regions: [
        {
          text: 'This is sample text',
          confidence: 0.98,
          boundingBox: [10, 20, 200, 40]
        },
        {
          text: 'extracted from the uploaded image',
          confidence: 0.92,
          boundingBox: [10, 50, 300, 70]
        },
        {
          text: 'It contains multiple lines',
          confidence: 0.94,
          boundingBox: [10, 80, 250, 100]
        }
      ]
    }

    res.json(mockOCRResult)
  } catch (error) {
    console.error('OCR extraction error:', error)
    res.status(500).json({ error: 'OCR extraction failed' })
  }
})

// Batch extract text from multiple images
router.post('/batch-extract', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' })
    }

    const { language, confidence } = req.body
    const files = req.files as Express.Multer.File[]

    // Mock batch OCR processing
    const mockBatchResults = files.map((file, index) => ({
      imageId: `img_${Date.now()}_${index}`,
      text: `Sample text extracted from image ${index + 1}: ${file.originalname}`,
      confidence: confidence ? parseFloat(confidence) : 0.90 + (Math.random() * 0.08),
      language: language || 'en',
      regions: [
        {
          text: `Sample text from image ${index + 1}`,
          confidence: 0.95,
          boundingBox: [10, 20, 200, 40]
        }
      ]
    }))

    res.json(mockBatchResults)
  } catch (error) {
    console.error('Batch OCR extraction error:', error)
    res.status(500).json({ error: 'Batch OCR extraction failed' })
  }
})

// Get OCR processing status
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params

    // Mock status response
    const mockStatus = {
      jobId,
      status: 'completed',
      progress: 100,
      result: {
        text: 'Sample OCR result',
        confidence: 0.95,
        language: 'en'
      },
      createdAt: new Date(Date.now() - 5000).toISOString(),
      completedAt: new Date().toISOString()
    }

    res.json(mockStatus)
  } catch (error) {
    console.error('OCR status error:', error)
    res.status(500).json({ error: 'OCR status retrieval failed' })
  }
})

// Get supported languages for OCR
router.get('/languages', async (req, res) => {
  try {
    // Mock supported languages
    const supportedLanguages = [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'ko', name: 'Korean', nativeName: '한국어' }
    ]

    res.json(supportedLanguages)
  } catch (error) {
    console.error('OCR languages error:', error)
    res.status(500).json({ error: 'OCR languages retrieval failed' })
  }
})

export default router
