import { Router } from 'express'
import axios from 'axios'

const router = Router()

// POST /api/sentiment/analyze
router.post('/analyze', async (req, res) => {
  const { text } = req.body
  try {
    // Proxy to AI service
    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/sentiment/analyze`,
      { text },
      { headers: { 'Content-Type': 'application/json' } }
    )
    res.json(aiResponse.data)
  } catch (error) {
    console.error('Sentiment analysis error:', error?.response?.data || error.message)
    res.status(500).json({ error: 'Failed to analyze sentiment', details: error?.response?.data || error.message })
  }
})

export default router
