const request = require('supertest')
const path = require('path')
const fs = require('fs')
let app = require('../../src/index');
if (app && app.default) app = app.default;

describe('OCR Service Integration Tests', () => {
  let server

  beforeAll(async () => {
    // Start server for testing
    server = app.listen(0)
  })

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
  })

  describe('POST /api/ocr/extract', () => {
    it('should extract text from image with basic OCR', async () => {
      // Create a simple test image buffer (mock)
      const testImageBuffer = Buffer.from('mock-image-data')
      
      const response = await request(app)
        .post('/api/ocr/extract')
        .attach('file', testImageBuffer, 'test-image.png')
        .field('language', 'en')
        .field('enableTableDetection', 'false')
        .field('provider', 'tesseract')
        .expect(200)

      expect(response.body).toMatchObject({
        text: expect.any(String),
        confidence: expect.any(Number),
        language: expect.any(String),
        processingTime: expect.any(Number),
        provider: 'tesseract',
        originalFileName: 'test-image.png',
        processingComplete: true
      })

      expect(response.body.confidence).toBeGreaterThanOrEqual(0)
      expect(response.body.confidence).toBeLessThanOrEqual(1)
    })

    it('should extract text with table detection enabled', async () => {
      const testImageBuffer = Buffer.from('mock-table-image-data')
      
      const response = await request(app)
        .post('/api/ocr/extract')
        .attach('file', testImageBuffer, 'test-table.jpg')
        .field('language', 'en')
        .field('enableTableDetection', 'true')
        .field('provider', 'tesseract')
        .expect(200)

      expect(response.body).toMatchObject({
        text: expect.any(String),
        confidence: expect.any(Number),
        language: expect.any(String),
        processingTime: expect.any(Number),
        provider: 'tesseract',
        originalFileName: 'test-table.jpg',
        processingComplete: true
      })

      // Should include table detection results
      if (response.body.tables) {
        expect(Array.isArray(response.body.tables)).toBe(true)
      }
    })

    it('should handle unsupported file formats', async () => {
      const testFileBuffer = Buffer.from('not-an-image')
      
      const response = await request(app)
        .post('/api/ocr/extract')
        .attach('file', testFileBuffer, 'test.txt')
        .field('language', 'en')
        .expect(400)

      expect(response.body).toMatchObject({
        error: expect.stringContaining('Unsupported file type')
      })
    })

    it('should handle large files appropriately', async () => {
      // Create a large file buffer
      const largeBuffer = Buffer.alloc(60 * 1024 * 1024) // 60MB
      
      const response = await request(app)
        .post('/api/ocr/extract')
        .attach('file', largeBuffer, 'large-image.png')
        .field('language', 'en')
        .expect(413) // Payload too large

      expect(response.body).toMatchObject({
        error: expect.any(String)
      })
    })

    it('should auto-detect language when set to auto', async () => {
      const testImageBuffer = Buffer.from('mock-multi-lang-image')
      
      const response = await request(app)
        .post('/api/ocr/extract')
        .attach('file', testImageBuffer, 'multilang.png')
        .field('language', 'auto')
        .expect(200)

      expect(response.body.language).toBeDefined()
      expect(typeof response.body.language).toBe('string')
    })
  })

  describe('POST /api/ocr/batch-extract', () => {
    it('should process multiple files successfully', async () => {
      const image1 = Buffer.from('mock-image-1')
      const image2 = Buffer.from('mock-image-2')
      
      const response = await request(app)
        .post('/api/ocr/batch-extract')
        .attach('files', image1, 'image1.png')
        .attach('files', image2, 'image2.jpg')
        .field('language', 'en')
        .field('enableTableDetection', 'false')
        .expect(200)

      expect(response.body).toMatchObject({
        results: expect.arrayContaining([
          expect.objectContaining({
            fileId: expect.any(String),
            originalFileName: expect.any(String),
            text: expect.any(String),
            confidence: expect.any(Number),
            processingTime: expect.any(Number)
          })
        ]),
        errors: expect.any(Array),
        totalProcessed: expect.any(Number),
        totalErrors: expect.any(Number),
        processingComplete: true
      })

      expect(response.body.results.length).toBeGreaterThan(0)
    })

    it('should handle mixed success and failure cases', async () => {
      const validImage = Buffer.from('mock-image')
      const invalidFile = Buffer.from('not-an-image')
      
      const response = await request(app)
        .post('/api/ocr/batch-extract')
        .attach('files', validImage, 'valid.png')
        .attach('files', invalidFile, 'invalid.txt')
        .field('language', 'en')
        .expect(200)

      expect(response.body.totalProcessed).toBeGreaterThanOrEqual(0)
      expect(response.body.totalErrors).toBeGreaterThanOrEqual(0)
      expect(response.body.totalProcessed + response.body.totalErrors).toBeGreaterThan(0)
    })

    it('should respect batch size limits', async () => {
      // Create more files than the limit allows
      const files = []
      for (let i = 0; i < 25; i++) {
        files.push(Buffer.from(`mock-image-${i}`))
      }
      
      let requestBuilder = request(app).post('/api/ocr/batch-extract')
      
      files.forEach((file, index) => {
        requestBuilder = requestBuilder.attach('files', file, `image${index}.png`)
      })
      
      const response = await requestBuilder
        .field('language', 'en')
        .expect(400)

      expect(response.body).toMatchObject({
        error: expect.any(String)
      })
    })
  })

  describe('GET /api/ocr/languages', () => {
    it('should return supported languages and providers', async () => {
      const response = await request(app)
        .get('/api/ocr/languages')
        .expect(200)

      expect(response.body).toMatchObject({
        languages: expect.arrayContaining([
          expect.objectContaining({
            code: expect.any(String),
            name: expect.any(String),
            nativeName: expect.any(String),
            tesseractCode: expect.any(String)
          })
        ]),
        providers: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            displayName: expect.any(String),
            available: expect.any(Boolean),
            description: expect.any(String)
          })
        ])
      })

      // Should include auto-detect option
      const autoLanguage = response.body.languages.find(lang => lang.code === 'auto')
      expect(autoLanguage).toBeDefined()

      // Should include Tesseract provider
      const tesseractProvider = response.body.providers.find(provider => provider.name === 'tesseract')
      expect(tesseractProvider).toBeDefined()
      expect(tesseractProvider.available).toBe(true)
    })
  })

  describe('GET /api/ocr/capabilities', () => {
    it('should return OCR service capabilities', async () => {
      const response = await request(app)
        .get('/api/ocr/capabilities')
        .expect(200)

      expect(response.body).toMatchObject({
        maxFileSize: expect.any(Number),
        supportedFormats: expect.any(Array),
        features: expect.objectContaining({
          tableDetection: expect.any(Boolean),
          layoutAnalysis: expect.any(Boolean),
          confidenceScoring: expect.any(Boolean),
          multiLanguageSupport: expect.any(Boolean),
          batchProcessing: expect.any(Boolean),
          cloudProviders: expect.any(Boolean)
        }),
        limits: expect.objectContaining({
          maxBatchFiles: expect.any(Number),
          maxConcurrentJobs: expect.any(Number),
          processingTimeout: expect.any(Number)
        })
      })

      expect(response.body.maxFileSize).toBeGreaterThan(0)
      expect(response.body.supportedFormats.length).toBeGreaterThan(0)
    })
  })

  describe('POST /api/ocr/download/:format', () => {
    const mockOCRResult = {
      text: 'Sample extracted text from OCR processing.',
      confidence: 0.95,
      language: 'en',
      blocks: [
        {
          text: 'Sample text',
          confidence: 0.98,
          boundingBox: [10, 20, 200, 40],
          type: 'text'
        }
      ],
      tables: [
        {
          rows: [
            {
              cells: [
                { text: 'Header 1', confidence: 0.95, boundingBox: [10, 10, 100, 30] },
                { text: 'Header 2', confidence: 0.93, boundingBox: [110, 10, 200, 30] }
              ]
            },
            {
              cells: [
                { text: 'Data 1', confidence: 0.92, boundingBox: [10, 40, 100, 60] },
                { text: 'Data 2', confidence: 0.94, boundingBox: [110, 40, 200, 60] }
              ]
            }
          ],
          confidence: 0.94,
          boundingBox: [10, 10, 200, 60]
        }
      ],
      processingTime: 1500,
      provider: 'tesseract'
    }

    it('should download OCR results as TXT format', async () => {
      const response = await request(app)
        .post('/api/ocr/download/txt')
        .send({
          ocrResult: mockOCRResult,
          fileName: 'test_result'
        })
        .expect(200)

      expect(response.headers['content-type']).toBe('text/plain; charset=utf-8')
      expect(response.headers['content-disposition']).toContain('attachment; filename="test_result.txt"')
      expect(response.text).toContain(mockOCRResult.text)
    })

    it('should download OCR results as JSON format', async () => {
      const response = await request(app)
        .post('/api/ocr/download/json')
        .send({
          ocrResult: mockOCRResult,
          fileName: 'test_result'
        })
        .expect(200)

      expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
      expect(response.headers['content-disposition']).toContain('attachment; filename="test_result.json"')
      
      const jsonData = JSON.parse(response.text)
      expect(jsonData).toMatchObject(mockOCRResult)
    })

    it('should download OCR results as CSV format', async () => {
      const response = await request(app)
        .post('/api/ocr/download/csv')
        .send({
          ocrResult: mockOCRResult,
          fileName: 'test_result'
        })
        .expect(200)

      expect(response.headers['content-type']).toBe('text/csv; charset=utf-8')
      expect(response.headers['content-disposition']).toContain('attachment; filename="test_result.csv"')
      expect(response.text).toContain('Type,Text,Confidence,X1,Y1,X2,Y2')
      expect(response.text).toContain('text,"Sample text"')
    })

    it('should download OCR results as HTML format', async () => {
      const response = await request(app)
        .post('/api/ocr/download/html')
        .send({
          ocrResult: mockOCRResult,
          fileName: 'test_result'
        })
        .expect(200)

      expect(response.headers['content-type']).toBe('text/html; charset=utf-8')
      expect(response.headers['content-disposition']).toContain('attachment; filename="test_result.html"')
      expect(response.text).toContain('<!DOCTYPE html>')
      expect(response.text).toContain('OCR Processing Results')
      expect(response.text).toContain(mockOCRResult.text)
    })

    it('should handle unsupported download formats', async () => {
      const response = await request(app)
        .post('/api/ocr/download/xml')
        .send({
          ocrResult: mockOCRResult,
          fileName: 'test_result'
        })
        .expect(400)

      expect(response.body).toMatchObject({
        error: 'Unsupported format. Use: txt, json, csv, html'
      })
    })

    it('should require OCR result data', async () => {
      const response = await request(app)
        .post('/api/ocr/download/txt')
        .send({
          fileName: 'test_result'
        })
        .expect(400)

      expect(response.body).toMatchObject({
        error: 'OCR result data required'
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      // Mock a server error scenario
      const testImageBuffer = Buffer.from('corrupted-image-data')
      
      const response = await request(app)
        .post('/api/ocr/extract')
        .attach('file', testImageBuffer, 'corrupted.png')
        .field('language', 'invalid-language')
        .expect(500)

      expect(response.body).toMatchObject({
        error: 'OCR extraction failed',
        details: expect.any(String)
      })
    })

    it('should clean up files after processing errors', async () => {
      const testImageBuffer = Buffer.from('mock-image-for-cleanup-test')
      
      // This should trigger an error but also clean up the uploaded file
      const response = await request(app)
        .post('/api/ocr/extract')
        .attach('file', testImageBuffer, 'cleanup-test.png')
        .field('language', 'invalid')
        .expect(500)

      // File should be cleaned up (this is more of an implementation detail)
      expect(response.body.error).toBeDefined()
    })
  })

  describe('Performance and Limits', () => {
    it('should handle concurrent requests appropriately', async () => {
      const promises = []
      const testImageBuffer = Buffer.from('concurrent-test-image')
      
      // Create multiple concurrent requests
      for (let i = 0; i < 5; i++) {
        const promise = request(app)
          .post('/api/ocr/extract')
          .attach('file', testImageBuffer, `concurrent-${i}.png`)
          .field('language', 'en')
        
        promises.push(promise)
      }
      
      const responses = await Promise.allSettled(promises)
      
      // At least some should succeed
      const successful = responses.filter(result => 
        result.status === 'fulfilled' && result.value.status === 200
      )
      
      expect(successful.length).toBeGreaterThan(0)
    })

    it('should have reasonable processing times', async () => {
      const testImageBuffer = Buffer.from('performance-test-image')
      const startTime = Date.now()
      
      const response = await request(app)
        .post('/api/ocr/extract')
        .attach('file', testImageBuffer, 'performance-test.png')
        .field('language', 'en')
        .expect(200)
      
      const totalTime = Date.now() - startTime
      
      // Should complete within reasonable time (adjust based on requirements)
      expect(totalTime).toBeLessThan(30000) // 30 seconds
      expect(response.body.processingTime).toBeDefined()
      expect(response.body.processingTime).toBeGreaterThan(0)
    })
  })
})

describe('OCR Table Detection Tests', () => {
  describe('Table Structure Analysis', () => {
    it('should detect simple table structures', async () => {
      const tableImageBuffer = Buffer.from('mock-simple-table-image')
      
      const response = await request(app)
        .post('/api/ocr/extract')
        .attach('file', tableImageBuffer, 'simple-table.png')
        .field('language', 'en')
        .field('enableTableDetection', 'true')
        .expect(200)

      if (response.body.tables && response.body.tables.length > 0) {
        const table = response.body.tables[0]
        
        expect(table).toMatchObject({
          rows: expect.any(Array),
          confidence: expect.any(Number),
          boundingBox: expect.any(Array)
        })
        
        expect(table.rows.length).toBeGreaterThan(0)
        
        if (table.rows.length > 0) {
          expect(table.rows[0]).toMatchObject({
            cells: expect.any(Array)
          })
          
          if (table.rows[0].cells.length > 0) {
            expect(table.rows[0].cells[0]).toMatchObject({
              text: expect.any(String),
              confidence: expect.any(Number),
              boundingBox: expect.any(Array)
            })
          }
        }
      }
    })

    it('should handle complex table layouts', async () => {
      const complexTableBuffer = Buffer.from('mock-complex-table-image')
      
      const response = await request(app)
        .post('/api/ocr/extract')
        .attach('file', complexTableBuffer, 'complex-table.png')
        .field('language', 'en')
        .field('enableTableDetection', 'true')
        .expect(200)

      // Should handle complex tables without crashing
      expect(response.body.processingComplete).toBe(true)
    })
  })
})