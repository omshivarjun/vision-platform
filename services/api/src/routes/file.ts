import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Allow images, audio, and documents
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4',
    'application/pdf', 'text/plain', 'application/msword'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *                 enum: [image, audio, document]
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/upload',
  authenticateToken,
  upload.single('file'),
  [
    body('type').isIn(['image', 'audio', 'document']),
    body('description').optional().isString().trim(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No file uploaded',
        },
      });
    }

    try {
      const { type, description } = req.body;
      
      const fileInfo = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        type,
        description,
        uploadedBy: req.user?.id,
        uploadedAt: new Date(),
      };

      logger.info('File uploaded successfully', {
        userId: req.user?.id,
        filename: req.file.filename,
        type,
        size: req.file.size,
      });

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: fileInfo,
      });
    } catch (error) {
      logger.error('File upload failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: {
          message: 'File upload failed',
        },
      });
    }
  })
);

/**
 * @swagger
 * /api/files/{filename}:
 *   get:
 *     summary: Download a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:filename',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../../uploads', filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'File not found',
          },
        });
      }

      const stat = fs.statSync(filePath);
      const fileStream = fs.createReadStream(filePath);
      
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      fileStream.pipe(res);
      
      logger.info('File downloaded', {
        userId: req.user?.id,
        filename,
      });
    } catch (error) {
      logger.error('File download failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: {
          message: 'File download failed',
        },
      });
    }
  })
);

/**
 * @swagger
 * /api/files/{filename}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/:filename',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../../uploads', filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'File not found',
          },
        });
      }

      fs.unlinkSync(filePath);
      
      logger.info('File deleted', {
        userId: req.user?.id,
        filename,
      });

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      logger.error('File deletion failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: {
          message: 'File deletion failed',
        },
      });
    }
  })
);

/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: List user's uploaded files
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [image, audio, document]
 *         description: Filter by file type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of files to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of files to skip
 *     responses:
 *       200:
 *         description: Files listed successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const { type, limit = 20, offset = 0 } = req.query;
      const uploadDir = path.join(__dirname, '../../uploads');
      
      if (!fs.existsSync(uploadDir)) {
        return res.json({
          success: true,
          data: {
            files: [],
            total: 0,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
          },
        });
      }

      const files = fs.readdirSync(uploadDir)
        .filter(filename => {
          if (type) {
            const filePath = path.join(uploadDir, filename);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              // Simple type detection based on extension
              const ext = path.extname(filename).toLowerCase();
              if (type === 'image' && ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return true;
              if (type === 'audio' && ['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) return true;
              if (type === 'document' && ['.pdf', '.txt', '.doc', '.docx'].includes(ext)) return true;
              return false;
            }
          }
          return true;
        })
        .map(filename => {
          const filePath = path.join(uploadDir, filename);
          const stats = fs.statSync(filePath);
          return {
            filename,
            size: stats.size,
            uploadedAt: stats.birthtime,
            type: path.extname(filename).toLowerCase(),
          };
        })
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

      const paginatedFiles = files.slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));

      res.json({
        success: true,
        data: {
          files: paginatedFiles,
          total: files.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      });
    } catch (error) {
      logger.error('File listing failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: {
          message: 'File listing failed',
        },
      });
    }
  })
);

export default router;
