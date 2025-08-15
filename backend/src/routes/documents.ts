import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents')
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
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ]
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'), false)
    }
  }
})

// Upload document
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { language, extractText, extractStructure } = req.body
    
    const documentId = Date.now().toString()
    
    // Mock document processing
    const mockText = extractText === 'true' ? 'This is extracted text from the document.' : undefined
    const mockStructure = extractStructure === 'true' ? { sections: ['Introduction', 'Main Content', 'Conclusion'] } : undefined

    res.json({
      documentId,
      status: 'processed',
      text: mockText,
      structure: mockStructure,
      metadata: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        language: language || 'en'
      }
    })
  } catch (error) {
    console.error('Document upload error:', error)
    res.status(500).json({ error: 'Document upload failed' })
  }
})

// Process document
router.post('/:documentId/process', async (req, res) => {
  try {
    const { documentId } = req.params
    const { extractText, extractStructure, performOCR } = req.body

    // Mock processing
    const mockText = extractText ? 'Processed text from document.' : undefined
    const mockStructure = extractStructure ? { processed: true, sections: ['Section 1', 'Section 2'] } : undefined
    const mockOCR = performOCR ? { text: 'OCR extracted text', confidence: 0.95 } : undefined

    res.json({
      status: 'completed',
      text: mockText,
      structure: mockStructure,
      ocrResults: mockOCR
    })
  } catch (error) {
    console.error('Document processing error:', error)
    res.status(500).json({ error: 'Document processing failed' })
  }
})

// Get document
router.get('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params

    // Mock document data
    res.json({
      id: documentId,
      status: 'processed',
      text: 'Sample document text',
      structure: { sections: ['Introduction', 'Content'] },
      metadata: {
        fileName: 'sample.pdf',
        fileSize: 1024,
        fileType: 'application/pdf',
        language: 'en'
      },
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Document retrieval error:', error)
    res.status(500).json({ error: 'Document retrieval failed' })
  }
})

// Get documents list
router.get('/', async (req, res) => {
  try {
    const { status, fileType, limit = 10, offset = 0 } = req.query

    // Mock documents list
    const mockDocuments = [
      {
        id: '1',
        status: 'processed',
        metadata: {
          fileName: 'document1.pdf',
          fileType: 'application/pdf',
          fileSize: 1024
        }
      },
      {
        id: '2',
        status: 'processing',
        metadata: {
          fileName: 'document2.docx',
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          fileSize: 2048
        }
      }
    ]

    res.json({
      documents: mockDocuments,
      total: mockDocuments.length,
      hasMore: false
    })
  } catch (error) {
    console.error('Documents list error:', error)
    res.status(500).json({ error: 'Documents list retrieval failed' })
  }
})

// Delete document
router.delete('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params

    // Mock deletion
    res.json({ success: true })
  } catch (error) {
    console.error('Document deletion error:', error)
    res.status(500).json({ error: 'Document deletion failed' })
  }
})

export default router
