import request from 'supertest';
import app from '../src/index';

describe('Analytics API', () => {
  it('should track an event', async () => {
    const res = await request(app)
      .post('/api/analytics/events')
      .send({ name: 'test_event', properties: { foo: 'bar' }, userId: 'test_user', sessionId: 'test_session' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should get real-time data', async () => {
    const res = await request(app)
      .get('/api/analytics/realtime');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('activeUsers');
    expect(res.body).toHaveProperty('pageViews');
    expect(res.body).toHaveProperty('events');
  });

  it('should get historical metrics', async () => {
    const res = await request(app)
      .get('/api/analytics/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('summary');
  });
});
