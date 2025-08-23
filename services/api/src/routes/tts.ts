import { Router } from 'express';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { Storage } from '@google-cloud/storage';

const router = Router();
const tts = new TextToSpeechClient();
const storage = new Storage();
const bucketName = process.env.GCS_AUDIO_BUCKET || process.env.GCS_BUCKET || '';

router.post('/', async (req, res) => {
  try {
    const { text, voice = 'en-US-Wavenet-D', speakingRate = 1.0, pitch = 0 } = req.body || {};
    if (!text) return res.status(400).json({ error: 'text is required' });
    if (!bucketName) return res.status(500).json({ error: 'GCS_AUDIO_BUCKET not configured' });

  const [synth] = await tts.synthesizeSpeech({
      input: { text },
      voice: { languageCode: voice.split('-').slice(0, 2).join('-'), name: voice },
      audioConfig: { audioEncoding: 'MP3', speakingRate, pitch },
    });

  const content: any = synth.audioContent;
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content as Uint8Array);
    const objectName = `tts/${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`;
    await storage.bucket(bucketName).file(objectName).save(buffer, { contentType: 'audio/mpeg', public: false });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-GCS-Object', objectName);
    res.send(buffer);
  } catch (err: any) {
    console.error('TTS error', err);
    res.status(500).json({ error: 'TTS failed', details: err.message });
  }
});

export default router;
