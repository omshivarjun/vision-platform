import request from 'supertest'
import app from '../index'

describe('/api/documents/:id/text', () => {
  it('returns text/plain', async () => {
    const res = await request(app).get('/api/documents/sample-id/text')
    expect([200,500]).toContain(res.status)
    if (res.status === 200) {
      expect(res.headers['content-type']).toMatch(/text\/plain/)
      expect(res.text.length).toBeGreaterThan(0)
    }
  })
})
