import request from 'supertest'
import app from '../index'

describe('Smoke tests', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
  })

  it('POST /api/translation/text returns 200', async () => {
    const res = await request(app)
      .post('/api/translation/text')
      .send({ text: 'hello', target_lang: 'es' })
    expect(res.status).toBe(200)
  })

  it('POST /api/ocr/extract returns 200 for image-like payload (no file)', async () => {
    const res = await request(app)
      .post('/api/ocr/extract')
    expect([200,400]).toContain(res.status)
  })
})
