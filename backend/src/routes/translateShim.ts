import express, { Request, Response } from 'express'
import { translateText } from '../services/translate'

const router = express.Router()

/**
 * POST /api/translate
 * Body: { text: string, targetLang: string, sourceLang?: string }
 * Returns: { translatedText, sourceLanguage, targetLanguage, confidence, provider }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { text, targetLang, sourceLang } = req.body || {}
    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Missing required fields: text, targetLang' })
    }
    const result = await translateText({ text, targetLang, sourceLang })
    return res.json(result)
  } catch (error) {
    console.error('Translate error:', error)
    return res.status(500).json({ error: 'Translation failed' })
  }
})

export default router
