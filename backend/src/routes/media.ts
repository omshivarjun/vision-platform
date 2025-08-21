
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { extractAudioFromMedia } from '../services/ffmpegService';
import { transcribeAudio } from '../services/asrService';

const router = express.Router();

// Configure multer for media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/media');
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

const upload = multer({ storage });

// Upload media file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Step 1: Extract audio from uploaded media
    const uploadDir = path.join(__dirname, '../../uploads/media');
    const mediaPath = req.file.path;
    let audioPath = null;
    let transcript = null;
    try {
      audioPath = await extractAudioFromMedia(mediaPath, uploadDir);
      // Step 2: Transcribe audio using ASR
      transcript = await transcribeAudio(audioPath);
    } catch (processingError) {
      console.error('Media processing error:', processingError);
    }
    res.json({
      mediaId: Date.now().toString(),
      status: 'processed',
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      audioPath: audioPath ? path.basename(audioPath) : null,
      transcript: transcript || null
    });
  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({ error: 'Media upload failed' });
  }
});

export default router;
