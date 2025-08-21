import { Router } from 'express';
import axios from 'axios';

const router = Router();

// POST /api/image-generation/generate-image
router.post('/generate-image', async (req, res) => {
  const { prompt, size, provider } = req.body;
  try {
    // Proxy to AI service
    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/image-generation/generate-image`,
      { prompt, size, provider },
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(aiResponse.data);
  } catch (error) {
    console.error('Image generation error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate image', details: error?.response?.data || error.message });
  }
});

export default router;
