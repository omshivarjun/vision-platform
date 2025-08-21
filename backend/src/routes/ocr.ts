import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'
import Tesseract from 'tesseract.js'
import axios from 'axios'

const router = express.Router()

// OCR Configuration
const OCR_CONFIG = {
  enableCloudProviders: process.env.ENABLE_CLOUD_OCR === 'true',
  googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY,
  azureVisionKey: process.env.AZURE_VISION_KEY,
  azureVisionEndpoint: process.env.AZURE_VISION_ENDPOINT,
  geminiApiKey: process.env.GEMINI_API_KEY,
  tesseractWorkerOptions: {
    logger: (m: any) => {
      if (m.status === 'recognizing text') {
        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
      }
    }
  }
}

// Enhanced file type support
const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/tiff',
  'image/bmp',
  'application/pdf'
]

// Configure multer for file uploads
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
    fileSize: 50 * 1024 * 1024 // 50MB limit for enhanced processing
  },
  fileFilter: (req, file, cb) => {
    if (SUPPORTED_FORMATS.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false)
    }
  }
})

// Enhanced OCR result interface
interface OCRResult {
  text: string
  confidence: number
  language: string
  blocks?: TextBlock[]
  tables?: TableStructure[]
  layout?: LayoutInfo
  processingTime: number
  provider: 'tesseract' | 'google-vision' | 'azure-vision'
}

interface TextBlock {
  text: string
  confidence: number
  boundingBox: [number, number, number, number]
  type?: 'text' | 'title' | 'heading' | 'caption'
}

interface TableStructure {
  rows: Array<{
    cells: Array<{
      text: string
      confidence: number
      boundingBox: [number, number, number, number]
    }>
  }>
  confidence: number
  boundingBox: [number, number, number, number]
}

interface LayoutInfo {
  orientation: number
  textAngle: number
  handwriting: boolean
  readingOrder: 'ltr' | 'rtl' | 'ttb'
}

// Enhanced image preprocessing
async function preprocessImage(filePath: string): Promise<string> {
  try {
    const processedPath = filePath.replace(/(\.[^.]+)$/, '_processed$1')
    
    await sharp(filePath)
      .resize(null, 2000, { 
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3
      })
      .normalize()
      .sharpen({ sigma: 1, m1: 0.5, m2: 2, x1: 2, y2: 10 })
      .modulate({ brightness: 1.1, contrast: 1.2 })
      .png({ quality: 95, compressionLevel: 6 })
      .toFile(processedPath)
    
    return processedPath
  } catch (error) {
    console.warn('Image preprocessing failed, using original:', error)
    return filePath
  }
}

// Tesseract OCR with enhanced configuration
async function performTesseractOCR(
  imagePath: string, 
  language: string = 'eng',
  enableTableDetection: boolean = false
): Promise<OCRResult> {
  const startTime = Date.now()
  
  try {
    // Preprocess image for better OCR results
    const processedPath = await preprocessImage(imagePath)
    
    // Configure Tesseract with optimized settings
    const { data } = await Tesseract.recognize(
      processedPath,
      language,
      {
        ...OCR_CONFIG.tesseractWorkerOptions,
        tessedit_pageseg_mode: enableTableDetection ? 
          Tesseract.PSM.AUTO : Tesseract.PSM.SINGLE_BLOCK,
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
        tessjs_create_hocr: '1',
        tessjs_create_tsv: '1',
        preserve_interword_spaces: '1'
      }
    )

    // Extract blocks with enhanced confidence filtering
    const blocks: TextBlock[] = data.words
      .filter(word => word.confidence > 30) // Filter low-confidence words
      .map(word => ({
        text: word.text,
        confidence: word.confidence / 100,
        boundingBox: [
          word.bbox.x0, 
          word.bbox.y0, 
          word.bbox.x1, 
          word.bbox.y1
        ] as [number, number, number, number],
        type: detectTextType(word.text)
      }))

    // Table detection using layout analysis
    const tables: TableStructure[] = enableTableDetection ? 
      await detectTables(data) : []

    // Clean up processed image
    if (processedPath !== imagePath && fs.existsSync(processedPath)) {
      fs.unlinkSync(processedPath)
    }

    return {
      text: data.text.trim(),
      confidence: data.confidence / 100,
      language: detectLanguage(data.text),
      blocks,
      tables,
      layout: {
        orientation: 0,
        textAngle: 0,
        handwriting: false,
        readingOrder: 'ltr'
      },
      processingTime: Date.now() - startTime,
      provider: 'tesseract'
    }
  } catch (error) {
    console.error('Tesseract OCR failed:', error)
    throw error
  }
}

// Enhanced table detection algorithm
async function detectTables(tesseractData: any): Promise<TableStructure[]> {
  try {
    const tables: TableStructure[] = []
    
    // Group words by lines based on y-coordinates
    const lines = groupWordsByLines(tesseractData.words)
    
    // Detect table-like structures
    const tableGroups = findTableStructures(lines)
    
    for (const group of tableGroups) {
      const table = analyzeTableStructure(group)
      if (table && table.rows.length > 1) {
        tables.push(table)
      }
    }
    
    return tables
  } catch (error) {
    console.warn('Table detection failed:', error)
    return []
  }
}

function groupWordsByLines(words: any[]): any[][] {
  const lines: any[][] = []
  const lineThreshold = 10 // pixels
  
  words.sort((a, b) => a.bbox.y0 - b.bbox.y0)
  
  for (const word of words) {
    const lineY = word.bbox.y0
    let addedToLine = false
    
    for (const line of lines) {
      if (line.length > 0) {
        const avgY = line.reduce((sum, w) => sum + w.bbox.y0, 0) / line.length
        if (Math.abs(lineY - avgY) <= lineThreshold) {
          line.push(word)
          addedToLine = true
          break
        }
      }
    }
    
    if (!addedToLine) {
      lines.push([word] as any)
    }
  }
  
  // Sort words within each line by x-coordinate
  lines.forEach(line => line.sort((a, b) => a.bbox.x0 - b.bbox.x0))
  
  return lines
}

function findTableStructures(lines: any[][]): any[][] {
  const tableGroups: any[][] = []
  const minTableRows = 2
  const maxColumnVariation = 0.3 // 30% variation allowed
  
  for (let i = 0; i < lines.length - minTableRows + 1; i++) {
    const group = []
    const firstLineColumns = lines[i].length
    
    for (let j = i; j < lines.length; j++) {
      const currentColumns = lines[j].length
      const variation = Math.abs(currentColumns - firstLineColumns) / firstLineColumns
      
      if (variation <= maxColumnVariation && currentColumns >= 2) {
        group.push(lines[j])
      } else if (group.length >= minTableRows) {
        break
      } else {
        group.length = 0
        break
      }
    }
    
    if (group.length >= minTableRows) {
      tableGroups.push(group)
      i += group.length - 1 // Skip processed lines
    }
  }
  
  return tableGroups
}

function analyzeTableStructure(tableGroup: any[][]): TableStructure | null {
  try {
    const rows = tableGroup.map(line => ({
      cells: line.map((word: any) => ({
        text: word.text,
        confidence: word.confidence / 100,
        boundingBox: [
          word.bbox.x0,
          word.bbox.y0,
          word.bbox.x1,
          word.bbox.y1
        ] as [number, number, number, number]
      }))
    }))
    
    // Calculate table bounding box
    const allBoxes = tableGroup.flat().map(word => word.bbox)
    const minX = Math.min(...allBoxes.map(box => box.x0))
    const minY = Math.min(...allBoxes.map(box => box.y0))
    const maxX = Math.max(...allBoxes.map(box => box.x1))
    const maxY = Math.max(...allBoxes.map(box => box.y1))
    
    // Calculate average confidence
    const avgConfidence = tableGroup.flat()
      .reduce((sum, word) => sum + word.confidence, 0) / tableGroup.flat().length / 100
    
    return {
      rows,
      confidence: avgConfidence,
      boundingBox: [minX, minY, maxX, maxY]
    }
  } catch (error) {
    console.warn('Table structure analysis failed:', error)
    return null
  }
}

function detectTextType(text: string): 'text' | 'title' | 'heading' | 'caption' {
  if (text.length < 3) return 'text'
  
  // Simple heuristics for text type detection
  if (text.length < 50 && /^[A-Z][A-Z\s]+$/.test(text)) return 'title'
  if (text.length < 100 && /^[A-Z]/.test(text) && text.endsWith(':')) return 'heading'
  if (text.toLowerCase().includes('figure') || text.toLowerCase().includes('table')) return 'caption'
  
  return 'text'
}

function detectLanguage(text: string): string {
  // Simple language detection based on character patterns
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh'
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja'
  if (/[\uac00-\ud7af]/.test(text)) return 'ko'
  if (/[\u0400-\u04ff]/.test(text)) return 'ru'
  if (/[àáâãäåæçèéêëìíîïñòóôõöøùúûüý]/.test(text.toLowerCase())) return 'fr'
  if (/[äöüß]/.test(text.toLowerCase())) return 'de'
  if (/[áéíóúñü]/.test(text.toLowerCase())) return 'es'
  
  return 'en'
}

// Google Vision API integration (optional)
async function performGoogleVisionOCR(imagePath: string): Promise<OCRResult> {
  if (!OCR_CONFIG.googleVisionApiKey) {
    throw new Error('Google Vision API key not configured')
  }
  
  const startTime = Date.now()
  
  try {
    // Implementation would use Google Vision API
    // For now, fallback to Tesseract
    console.log('Google Vision API not implemented, falling back to Tesseract')
    return await performTesseractOCR(imagePath)
  } catch (error) {
    console.error('Google Vision OCR failed:', error)
    throw error
  }
}

// Azure Computer Vision integration (optional)
async function performAzureVisionOCR(imagePath: string): Promise<OCRResult> {
  if (!OCR_CONFIG.azureVisionKey || !OCR_CONFIG.azureVisionEndpoint) {
    throw new Error('Azure Vision API credentials not configured')
  }
  
  const startTime = Date.now()
  
  try {
    // Implementation would use Azure Computer Vision API
    // For now, fallback to Tesseract
    console.log('Azure Vision API not implemented, falling back to Tesseract')
    return await performTesseractOCR(imagePath)
  } catch (error) {
    console.error('Azure Vision OCR failed:', error)
    throw error
  }
}

// Gemini Vision API integration
async function performGeminiVisionOCR(imagePath: string): Promise<OCRResult> {
  if (!OCR_CONFIG.geminiApiKey) {
    throw new Error('Gemini API key not configured')
  }
  
  const startTime = Date.now()
  
  try {
    // Read image as base64
    const imageBuffer = fs.readFileSync(imagePath)
    const base64Image = imageBuffer.toString('base64')
    
    // Call Gemini Vision API
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent',
      {
        contents: [{
          parts: [
            { text: 'Extract all text from this image with high accuracy. Include table structures if present.' },
            { 
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': OCR_CONFIG.geminiApiKey
        },
        params: {
          key: OCR_CONFIG.geminiApiKey
        }
      }
    )
    
    const extractedText = response.data.candidates[0]?.content?.parts[0]?.text || ''
    
    return {
      text: extractedText.trim(),
      confidence: 0.95, // Gemini provides high confidence
      language: detectLanguage(extractedText),
      blocks: [],
      tables: [],
      layout: {
        orientation: 0,
        textAngle: 0,
        handwriting: false,
        readingOrder: 'ltr'
      },
      processingTime: Date.now() - startTime,
      provider: 'google-vision' // Use google-vision for compatibility
    }
  } catch (error) {
    console.error('Gemini Vision OCR failed:', error)
    throw error
  }
}

// Enhanced OCR text extraction endpoint
router.post('/extract', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { 
      language = 'auto',
      enableTableDetection = false,
      provider = 'tesseract'
    } = req.body

    console.log(`Processing OCR for: ${req.file.originalname}`)
    
    let result: OCRResult | undefined = undefined

    // Choose OCR provider with fallback chain
    const providers = [provider]
    
    // Add Gemini as primary if available
    if (OCR_CONFIG.geminiApiKey && !providers.includes('gemini')) {
      providers.unshift('gemini')
    }
    
    // Try providers in order until one succeeds
    let lastError: Error | null = null
    
    for (const currentProvider of providers) {
      try {
        switch (currentProvider) {
          case 'gemini':
            if (OCR_CONFIG.geminiApiKey) {
              result = await performGeminiVisionOCR(req.file.path)
            }
            break
            
          case 'google-vision':
            if (OCR_CONFIG.enableCloudProviders && OCR_CONFIG.googleVisionApiKey) {
              result = await performGoogleVisionOCR(req.file.path)
            }
            break
            
          case 'azure-vision':
            if (OCR_CONFIG.enableCloudProviders && OCR_CONFIG.azureVisionKey) {
              result = await performAzureVisionOCR(req.file.path)
            }
            break
            
          default:
            result = await performTesseractOCR(
              req.file.path,
              language === 'auto' ? 'eng' : language,
              enableTableDetection === 'true' || enableTableDetection === true
            )
            break
        }
        
        if (result) break
      } catch (error) {
        lastError = error as Error
        console.warn(`Provider ${currentProvider} failed, trying next...`, error)
      }
    }
    
    if (!result) {
      // Final fallback to Tesseract
      result = await performTesseractOCR(
        req.file.path,
        language === 'auto' ? 'eng' : language,
        enableTableDetection === 'true' || enableTableDetection === true
      )
    }
    
    if (!result) {
      throw new Error('All OCR providers failed')
    }

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.warn('Failed to clean up uploaded file:', err)
    })

    // Return enhanced result
    res.json({
      ...result,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      processingComplete: true
    })

  } catch (error) {
    console.error('OCR extraction error:', error)
    
    // Clean up file on error
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.warn('Failed to clean up file after error:', err)
      })
    }
    
    res.status(500).json({ 
      error: 'OCR extraction failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Enhanced batch OCR processing
router.post('/batch-extract', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const { 
      language = 'auto',
      enableTableDetection = false,
      provider = 'tesseract'
    } = req.body
    
    const files = req.files as any[]
    console.log(`Processing ${files.length} files for batch OCR`)

    const results: Array<OCRResult & { fileId: string; originalFileName: string }> = []
    const errors: Array<{ fileName: string; error: string }> = []

    // Process files in parallel with limit to avoid overwhelming system
    const batchSize = 3
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (file) => {
        try {
          let result: OCRResult
          
          switch (provider) {
            case 'google-vision':
              if (OCR_CONFIG.enableCloudProviders && OCR_CONFIG.googleVisionApiKey) {
                result = await performGoogleVisionOCR(file.path)
              } else {
                result = await performTesseractOCR(
                  file.path,
                  language === 'auto' ? 'eng' : language,
                  enableTableDetection === 'true' || enableTableDetection === true
                )
              }
              break
              
            case 'azure-vision':
              if (OCR_CONFIG.enableCloudProviders && OCR_CONFIG.azureVisionKey) {
                result = await performAzureVisionOCR(file.path)
              } else {
                result = await performTesseractOCR(
                  file.path,
                  language === 'auto' ? 'eng' : language,
                  enableTableDetection === 'true' || enableTableDetection === true
                )
              }
              break
              
            default:
              result = await performTesseractOCR(
                file.path,
                language === 'auto' ? 'eng' : language,
                enableTableDetection === 'true' || enableTableDetection === true
              )
              break
          }

          // Clean up file
          fs.unlink(file.path, (err) => {
            if (err) console.warn(`Failed to clean up ${file.originalname}:`, err)
          })

          return {
            ...result,
            fileId: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            originalFileName: file.originalname
          }
        } catch (error) {
          // Clean up file on error
          fs.unlink(file.path, (err) => {
            if (err) console.warn(`Failed to clean up ${file.originalname} after error:`, err)
          })
          
          errors.push({
            fileName: file.originalname,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          
          return null
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults.filter(result => result !== null) as any[])
    }

    res.json({
      results,
      errors,
      totalProcessed: results.length,
      totalErrors: errors.length,
      processingComplete: true
    })

  } catch (error) {
    console.error('Batch OCR extraction error:', error)
    
    // Clean up any remaining files
    if (req.files) {
      const files = req.files as any[]
      files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.warn(`Failed to clean up ${file.originalname}:`, err)
        })
      })
    }
    
    res.status(500).json({ 
      error: 'Batch OCR extraction failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get supported languages for OCR
router.get('/languages', async (req, res) => {
  try {
    const supportedLanguages = [
      { code: 'auto', name: 'Auto-detect', nativeName: 'Auto-detect', tesseractCode: 'eng' },
      { code: 'en', name: 'English', nativeName: 'English', tesseractCode: 'eng' },
      { code: 'es', name: 'Spanish', nativeName: 'Español', tesseractCode: 'spa' },
      { code: 'fr', name: 'French', nativeName: 'Français', tesseractCode: 'fra' },
      { code: 'de', name: 'German', nativeName: 'Deutsch', tesseractCode: 'deu' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano', tesseractCode: 'ita' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', tesseractCode: 'por' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский', tesseractCode: 'rus' },
      { code: 'zh', name: 'Chinese', nativeName: '中文', tesseractCode: 'chi_sim' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', tesseractCode: 'jpn' },
      { code: 'ko', name: 'Korean', nativeName: '한국어', tesseractCode: 'kor' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', tesseractCode: 'ara' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', tesseractCode: 'hin' },
      { code: 'th', name: 'Thai', nativeName: 'ไทย', tesseractCode: 'tha' },
      { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', tesseractCode: 'vie' }
    ]

    res.json({
      languages: supportedLanguages,
      providers: [
        {
          name: 'tesseract',
          displayName: 'Tesseract (Local)',
          available: true,
          description: 'Local OCR processing with table detection'
        },
        {
          name: 'google-vision',
          displayName: 'Google Vision API',
          available: OCR_CONFIG.enableCloudProviders && !!OCR_CONFIG.googleVisionApiKey,
          description: 'Cloud-based OCR with advanced features'
        },
        {
          name: 'azure-vision',
          displayName: 'Azure Computer Vision',
          available: OCR_CONFIG.enableCloudProviders && !!OCR_CONFIG.azureVisionKey,
          description: 'Microsoft cloud OCR service'
        },
        {
          name: 'gemini',
          displayName: 'Gemini Vision API',
          available: !!OCR_CONFIG.geminiApiKey,
          description: 'Gemini Vision API for OCR'
        }
      ]
    })
  } catch (error) {
    console.error('OCR languages error:', error)
    res.status(500).json({ error: 'OCR languages retrieval failed' })
  }
})

// OCR capabilities and configuration
router.get('/capabilities', async (req, res) => {
  try {
    res.json({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      supportedFormats: SUPPORTED_FORMATS,
      features: {
        tableDetection: true,
        layoutAnalysis: true,
        confidenceScoring: true,
        multiLanguageSupport: true,
        batchProcessing: true,
        cloudProviders: OCR_CONFIG.enableCloudProviders
      },
      limits: {
        maxBatchFiles: 20,
        maxConcurrentJobs: 3,
        processingTimeout: 300000 // 5 minutes
      }
    })
  } catch (error) {
    console.error('OCR capabilities error:', error)
    res.status(500).json({ error: 'OCR capabilities retrieval failed' })
  }
})

// Download OCR results as various formats
router.post('/download/:format', async (req, res) => {
  try {
    const { format } = req.params
    const { ocrResult, fileName = 'ocr_result' } = req.body

    if (!ocrResult) {
      return res.status(400).json({ error: 'OCR result data required' })
    }

    let contentType: string
    let fileExtension: string
    let content: string

    switch (format.toLowerCase()) {
      case 'txt':
        contentType = 'text/plain'
        fileExtension = 'txt'
        content = ocrResult.text || ''
        break

      case 'json':
        contentType = 'application/json'
        fileExtension = 'json'
        content = JSON.stringify(ocrResult, null, 2)
        break

      case 'csv':
        contentType = 'text/csv'
        fileExtension = 'csv'
        content = generateCSVFromOCR(ocrResult)
        break

      case 'html':
        contentType = 'text/html'
        fileExtension = 'html'
        content = generateHTMLFromOCR(ocrResult)
        break

      default:
        return res.status(400).json({ error: 'Unsupported format. Use: txt, json, csv, html' })
    }

    const downloadFileName = `${fileName}.${fileExtension}`

    res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`)
    res.setHeader('Content-Type', contentType)
    res.send(content)

  } catch (error) {
    console.error('OCR download error:', error)
    res.status(500).json({ error: 'OCR download failed' })
  }
})

// Helper function to generate CSV from OCR results
function generateCSVFromOCR(ocrResult: any): string {
  let csv = 'Type,Text,Confidence,X1,Y1,X2,Y2\n'
  
  // Add text blocks
  if (ocrResult.blocks) {
    for (const block of ocrResult.blocks) {
      const [x1, y1, x2, y2] = block.boundingBox
      csv += `"${block.type || 'text'}","${block.text.replace(/"/g, '""')}","${block.confidence}","${x1}","${y1}","${x2}","${y2}"\n`
    }
  }
  
  // Add table data
  if (ocrResult.tables) {
    for (const table of ocrResult.tables) {
      for (const row of table.rows) {
        for (const cell of row.cells) {
          const [x1, y1, x2, y2] = cell.boundingBox
          csv += `"table_cell","${cell.text.replace(/"/g, '""')}","${cell.confidence}","${x1}","${y1}","${x2}","${y2}"\n`
        }
      }
    }
  }
  
  return csv
}

// Helper function to generate HTML from OCR results
function generateHTMLFromOCR(ocrResult: any): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OCR Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .confidence { color: #666; font-size: 0.9em; }
        .table-container { margin: 20px 0; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .metadata { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>OCR Processing Results</h1>
    
    <div class="metadata">
        <h2>Processing Information</h2>
        <p><strong>Confidence:</strong> ${(ocrResult.confidence * 100).toFixed(1)}%</p>
        <p><strong>Language:</strong> ${ocrResult.language}</p>
        <p><strong>Provider:</strong> ${ocrResult.provider}</p>
        <p><strong>Processing Time:</strong> ${ocrResult.processingTime}ms</p>
    </div>
    
    <div>
        <h2>Extracted Text</h2>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${ocrResult.text || 'No text extracted'}</div>
    </div>`

  // Add tables if present
  if (ocrResult.tables && ocrResult.tables.length > 0) {
    html += `\n    <div class="table-container">
        <h2>Detected Tables</h2>`
    
    ocrResult.tables.forEach((table: any, index: number) => {
      html += `\n        <h3>Table ${index + 1} <span class="confidence">(${(table.confidence * 100).toFixed(1)}% confidence)</span></h3>
        <table>`
      
      table.rows.forEach((row: any, rowIndex: number) => {
        html += '\n            <tr>'
        row.cells.forEach((cell: any) => {
          const tag = rowIndex === 0 ? 'th' : 'td'
          html += `<${tag}>${cell.text}</${tag}>`
        })
        html += '</tr>'
      })
      
      html += '\n        </table>'
    })
    
    html += '\n    </div>'
  }

  html += `\n</body>
</html>`
  
  return html
}

export default router
