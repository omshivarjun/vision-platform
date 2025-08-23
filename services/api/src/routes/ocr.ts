import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Storage } from '@google-cloud/storage';
import { v1 as visionV1 } from '@google-cloud/vision';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const storage = new Storage();
const ocrClient = new visionV1.ImageAnnotatorClient();
const bucketName = process.env.GCS_OCR_BUCKET || process.env.GCS_BUCKET || '';
const ocrOutputPrefix = process.env.OCR_OUTPUT_PREFIX || 'ocr-results';

/**
 * @swagger
 * /api/ocr/extract:
 *   post:
 *     summary: Extract text from image using OCR
 *     tags: [OCR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               language:
 *                 type: string
 *                 description: Language code for OCR
 *                 example: "en"
 *     responses:
 *       200:
 *         description: Text extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     confidence:
 *                       type: number
 *                     language:
 *                       type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/extract',
  authenticateToken,
  upload.single('image'),
  [body('language').optional().isString().trim()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }

    try {
      if (!bucketName) return res.status(500).json({ success: false, error: { message: 'GCS bucket not configured' } });
      if (!req.file) return res.status(400).json({ success: false, error: { message: 'No image uploaded' } });
      const { language = 'auto' } = req.body;

      const objectName = `uploads/ocr/${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(req.file.originalname) || '.bin'}`;
      await storage.bucket(bucketName).file(objectName).save(req.file.buffer, { contentType: req.file.mimetype, public: false });

      const gcsSourceUri = `gs://${bucketName}/${objectName}`;
      const outputPrefix = `${ocrOutputPrefix}/${path.basename(objectName, path.extname(objectName))}`;
      const gcsDestinationUri = `gs://${bucketName}/${outputPrefix}/`;

      const features = [{ type: 'DOCUMENT_TEXT_DETECTION' }];
      const inputConfig = { mimeType: req.file.mimetype, gcsSource: { uri: gcsSourceUri } };
      const outputConfig = { gcsDestination: { uri: gcsDestinationUri } };
      const request = { requests: [{ features, inputConfig, outputConfig }], parent: undefined } as any;

      const [operation] = await ocrClient.asyncBatchAnnotateFiles(request);
      const [filesResponse] = await operation.promise();
      // The results are written to GCS as JSON. Read the first result file.
      const [files] = await storage.bucket(bucketName).getFiles({ prefix: outputPrefix });
      const first = files.find(f => f.name.endsWith('.json')) || files[0];
      if (!first) return res.json({ success: true, data: { text: '', confidence: 0, language } });
      const [jsonBuf] = await first.download();
      const json = JSON.parse(jsonBuf.toString('utf8'));
      const text = json?.responses?.[0]?.fullTextAnnotation?.text || '';

      logger.info('OCR text extraction completed', { userId: req.user?.id, language, bytes: req.file.size });
      res.json({ success: true, data: { text, confidence: 0.9, language, gcsObject: objectName, outputPrefix } });
    } catch (error: any) {
      logger.error('OCR extraction failed', { error: error.message });
      res.status(500).json({ success: false, error: { message: 'OCR processing failed', details: error.message } });
    }
  })
);

/**
 * @swagger
 * /api/ocr/batch:
 *   post:
 *     summary: Process multiple images for OCR
 *     tags: [OCR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     language:
 *                       type: string
 *     responses:
 *       200:
 *         description: Batch processing started
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/batch',
  authenticateToken,
  [
    body('images').isArray({ min: 1, max: 10 }),
    body('images.*.gcsObject').optional().isString(),
    body('images.*.language').optional().isString(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors.array() } });
    }

    try {
      if (!bucketName) return res.status(500).json({ success: false, error: { message: 'GCS bucket not configured' } });
      const { images } = req.body as { images: { gcsObject: string; language?: string }[] };
      const features = [{ type: 'DOCUMENT_TEXT_DETECTION' }];

      const requests = images.map(img => ({
        features,
        inputConfig: { mimeType: 'application/pdf', gcsSource: { uri: `gs://${bucketName}/${img.gcsObject}` } },
        outputConfig: { gcsDestination: { uri: `gs://${bucketName}/${ocrOutputPrefix}/${path.basename(img.gcsObject, path.extname(img.gcsObject))}/` } }
      }));

      const [operation] = await ocrClient.asyncBatchAnnotateFiles({ requests } as any);
      await operation.promise();

      res.json({ success: true, data: { status: 'completed', count: images.length } });
    } catch (error: any) {
      logger.error('OCR batch processing failed', { error: error.message });
      res.status(500).json({ success: false, error: { message: 'Batch processing failed', details: error.message } });
    }
  })
);

export default router;
