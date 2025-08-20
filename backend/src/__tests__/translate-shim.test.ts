import request from 'supertest'
import app from '../index'

describe('/api/translate', () => {
  it('translates with stub', async () => {
    const res = await request(app).post('/api/translate').send({ text: 'hello', targetLang: 'es' })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('translatedText')
    expect(res.body).toHaveProperty('provider')
  })
})
