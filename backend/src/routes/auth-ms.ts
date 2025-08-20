import { Router } from 'express'

const router = Router()

// Microsoft OAuth callback (stub)
router.get('/callback', async (req, res) => {
  // TODO: Exchange code for token, fetch profile, upsert user, issue session/JWT
  return res.redirect('/')
})

export default router
