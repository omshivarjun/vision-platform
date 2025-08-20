// Document processing service for handling various file types
export interface DocumentParseResult {
  text: string
  metadata: {
    fileName: string
    fileSize: number
    fileType: string
    language?: string
    pageCount?: number
    processingTime: number
  }
  structure?: {
    sections: Array<{
      title: string
      content: string
      level: number
    }>
    headings: string[]
    paragraph  ocrResults?: {
    confidence: number
    language: string
    provider: string
    processingTime: number
    textBlocks: Array<{
      text: string
      confidence: number
      boundingBox: {
        x: number
        y: number
        width: number
        height: number
      }
      type?: 'text' | 'title' | 'heading' | 'caption'
    }>
    tables?: Array<{
      rows: Array<{
        cells: Array<{
          text: string
          confidence: number
          boundingBox: {
            x: number
            y: number
            width: number
            height: number
          }
        }>
      }>
      confidence: number
      boundingBox: {
        x: number
        y: number
        width: number
        height: number
      }
    }>
    layout?: {
      orientation: number
      textAngle: number
      handwriting: boolean
      readingOrder: 'ltr' | 'rtl' | 'ttb'
    }
  }
}

export interface DocumentUploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
}

// Enhanced OCR result interface
interface EnhancedOCRResult {
  text: string
  confidence: number
  language: string
  blocks?: Array<{
    text: string
    confidence: number
    boundingBox: [number, number, number, number]
    type?: 'text' | 'title' | 'heading' | 'caption'
  }>
  tables?: Array<{
    rows: Array<{
      cells: Array<{
        text: string
        confidence: number
        boundingBox: [number, number, number, number]
      }>
    }>
    confidence: number
    boundingBox: [number, number, number, number]
  }>
  layout?: {
    orientation: number
    textAngle: number
    handwriting: boolean
    readingOrder: 'ltr' | 'rtl' | 'ttb'
  }
  processingTime: number
  provider: string
}

// Document processing service
export const documentService = {
  // Process document with enhanced OCR
  async processDocumentWithOCR(file: File, ocrResult: EnhancedOCRResult): Promise<DocumentParseResult> {
    const startTime = Date.now()
    
    try {
      // Convert OCR result to document format
      const textBlocks = ocrResult.blocks?.map(block => ({
        text: block.text,
        confidence: block.confidence,
        boundingBox: {
          x: block.boundingBox[0],
          y: block.boundingBox[1],
          width: block.boundingBox[2] - block.boundingBox[0],
          height: block.boundingBox[3] - block.boundingBox[1]
        },
        type: block.type
      })) || []

      const tables = ocrResult.tables?.map(table => ({
        rows: table.rows.map(row => ({
          cells: row.cells.map(cell => ({
            text: cell.text,
            confidence: cell.confidence,
            boundingBox: {
              x: cell.boundingBox[0],
              y: cell.boundingBox[1],
              width: cell.boundingBox[2] - cell.boundingBox[0],
              height: cell.boundingBox[3] - cell.boundingBox[1]
            }
          }))
        })),
        confidence: table.confidence,
        boundingBox: {
          x: table.boundingBox[0],
          y: table.boundingBox[1],
          width: table.boundingBox[2] - table.boundingBox[0],
          height: table.boundingBox[3] - table.boundingBox[1]
        }
      })) || []

      // Analyze document structure
      const structure = this.analyzeDocumentStructure(ocrResult.text)

      const result: DocumentParseResult = {
        text: ocrResult.text,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          language: ocrResult.language,
          processingTime: Date.now() - startTime
        },
        structure,
        ocrResults: {
          confidence: ocrResult.confidence,
          language: ocrResult.language,
          provider: ocrResult.provider,
          processingTime: ocrResult.processingTime,
          textBlocks,
          tables,
          layout: ocrResult.layout
        }
      }

      return result
    } catch (error) {
      console.error('Document processing with OCR failed:', error)
      throw new Error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  // Process uploaded file
  async processDocument(file: File): Promise<DocumentParseResult> {romise<DocumentParseResult> {
    const startTime = Date.now()
    
    try {
      // Validate file type
      const allowedTypes = [
        'text/plain',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}`)
      }

      // Process based on file type
      let result: DocumentParseResult
      
      if (file.type === 'text/plain') {
        result = await this.processTextFile(file)
      } else if (file.type === 'application/pdf') {
        result = await this.processPDFFile(file)
      } else if (file.type.includes('wordprocessingml.document') || file.type === 'application/msword') {
        result = await this.processWordFile(file)
      } else if (file.type.startsWith('image/')) {
        result = await this.processImageFile(file)
      } else {
        throw new Error('Unsupported file type')
      }

      // Add metadata
      result.metadata = {
        ...result.metadata,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        processingTime: Date.now() - startTime,
      }

      return result
    } catch (error) {
      console.error('Document processing error:', error)
      throw error
    }
  },

  // Process plain text files
  async processTextFile(file: File): Promise<DocumentParseResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const sections = this.parseTextStructure(text)
          
          resolve({
            text,
            metadata: {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              language: this.detectLanguage(text),
              pageCount: 1,
              processingTime: 0,
            },
            structure: sections,
          })
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read text file'))
      reader.readAsText(file)
    })
  },

  // Process PDF files (simulated for now)
  async processPDFFile(file: File): Promise<DocumentParseResult> {
    // Simulate PDF processing
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockText = `This is a simulated PDF document extracted from ${file.name}.

The document contains multiple paragraphs and sections that would normally be extracted from a PDF file.

In a real implementation, this would use pdf.js or a backend service to extract text content, maintain formatting, and preserve document structure.

Key features of PDF processing:
- Text extraction with positioning
- Page layout preservation
- Image and table detection
- Metadata extraction
- Searchable text generation`

        const sections = this.parseTextStructure(mockText)
        
        resolve({
          text: mockText,
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            language: 'en',
            pageCount: 3,
            processingTime: 0,
          },
          structure: sections,
        })
      }, 2000) // Simulate processing time
    })
  },

  // Process Word documents (simulated for now)
  async processWordFile(file: File): Promise<DocumentParseResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockText = `This is a simulated Word document extracted from ${file.name}.

Document Structure:
1. Introduction
   This section introduces the main topic and provides context for the reader.

2. Main Content
   The body of the document contains the primary information, arguments, or narrative.

3. Conclusion
   A summary of key points and final thoughts.

In a real implementation, this would use mammoth.js or a backend service to convert DOCX to HTML/text while preserving formatting, styles, and document structure.`

        const sections = this.parseTextStructure(mockText)
        
        resolve({
          text: mockText,
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            language: 'en',
            pageCount: 2,
            processingTime: 0,
          },
          structure: sections,
        })
      }, 1500) // Simulate processing time
    })
  },

  // Process image files with OCR
  async processImageFile(file: File): Promise<DocumentParseResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const imageData = e.target?.result as string
          
          // Simulate OCR processing
          setTimeout(() => {
            const mockOCRText = `This is simulated OCR text extracted from the image ${file.name}.

The OCR system would normally:
- Analyze the image for text regions
- Extract text with confidence scores
- Preserve spatial positioning
- Handle different fonts and orientations
- Provide bounding boxes for text blocks

In a real implementation, this would use Tesseract.js, Google Vision API, or AWS Textract for high-quality text extraction.`

            const ocrResults = {
              confidence: 0.89,
              textBlocks: [
                {
                  text: 'This is simulated OCR text',
                  confidence: 0.95,
                  boundingBox: { x: 10, y: 20, width: 200, height: 30 }
                },
                {
                  text: 'extracted from the image',
                  confidence: 0.87,
                  boundingBox: { x: 10, y: 60, width: 180, height: 25 }
                }
              ]
            }

            const sections = this.parseTextStructure(mockOCRText)
            
            resolve({
              text: mockOCRText,
              metadata: {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                language: 'en',
                pageCount: 1,
                processingTime: 0,
              },
              structure: sections,
              ocrResults,
            })
          }, 3000) // Simulate OCR processing time
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read image file'))
      reader.readAsDataURL(file)
    })
  },

  // Parse text structure into sections
  parseTextStructure(text: string) {
    const lines = text.split('\n').filter(line => line.trim())
    const sections: Array<{ title: string; content: string; level: number }> = []
    const headings: string[] = []
    const paragraphs: string[] = []
    
    let currentSection = { title: '', content: '', level: 0 }
    let currentContent: string[] = []
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Detect headings (lines that are short and end with numbers or are all caps)
      if (trimmedLine.length < 100 && 
          (trimmedLine.match(/^\d+\./) || 
           trimmedLine.match(/^[A-Z][A-Z\s]+$/) ||
           trimmedLine.match(/^[A-Z][a-z]+:/))) {
        
        // Save previous section if exists
        if (currentSection.title) {
          currentSection.content = currentContent.join('\n')
          sections.push({ ...currentSection })
        }
        
        // Start new section
        const level = trimmedLine.match(/^\d+\./) ? 1 : 
                     trimmedLine.match(/^[A-Z][A-Z\s]+$/) ? 2 : 3
        currentSection = { title: trimmedLine, content: '', level }
        currentContent = []
        headings.push(trimmedLine)
      } else {
        currentContent.push(trimmedLine)
        if (trimmedLine.length > 20) {
          paragraphs.push(trimmedLine)
        }
      }
    }
    
    // Add final section
    if (currentSection.title) {
      currentSection.content = currentContent.join('\n')
      sections.push(currentSection)
    }
    
    return { sections, headings, paragraphs }
  },

  // Detect language from text
  detectLanguage(text: string): string {
    const sample = text.toLowerCase().substring(0, 1000)
    
    // Simple language detection based on common words
    const languages = {
      en: ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'],
      es: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le'],
      fr: ['le', 'la', 'de', 'et', 'en', 'un', 'est', 'que', 'pour', 'dans', 'sur', 'avec'],
      de: ['der', 'die', 'das', 'und', 'in', 'den', 'von', 'zu', 'mit', 'sich', 'auf', 'für'],
      it: ['il', 'la', 'di', 'e', 'in', 'un', 'è', 'che', 'per', 'con', 'su', 'da'],
      pt: ['o', 'a', 'de', 'e', 'em', 'um', 'é', 'que', 'para', 'com', 'na', 'por'],
      ru: ['и', 'в', 'не', 'на', 'я', 'быть', 'тот', 'он', 'что', 'о', 'с', 'как'],
      zh: ['的', '了', '在', '是', '我', '有', '和', '人', '这', '中', '大', '为'],
      ja: ['の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ'],
      ko: ['의', '에', '는', '을', '가', '이', '다', '고', '하', '지', '것', '수']
    }
    
    let maxScore = 0
    let detectedLang = 'en'
    
    for (const [lang, words] of Object.entries(languages)) {
      let score = 0
      for (const word of words) {
        if (sample.includes(word)) score++
      }
      if (score > maxScore) {
        maxScore = score
        detectedLang = lang
      }
    }
    
    return detectedLang
  },

  // Get file icon based on type
  getFileIcon(fileType: string): string {
    const icons = {
      'text/plain': '📄',
      'application/pdf': '📕',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📘',
      'application/msword': '📘',
      'image/jpeg': '🖼️',
      'image/png': '🖼️',
      'image/gif': '🖼️',
      'image/webp': '🖼️',
    }
    
    return icons[fileType as keyof typeof icons] || '📁'
  },

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Validate file size
  validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
  },

  // Get supported file types
  getSupportedFileTypes(): string[] {
    return [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
  }
}
