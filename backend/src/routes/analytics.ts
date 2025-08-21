
import express from 'express';
import { AnalyticsEvent } from '../models/analytics';

const router = express.Router();

// Track event (persist to Mongo)
router.post('/events', async (req, res) => {
  try {
    const { name, properties, userId, sessionId } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const doc = new AnalyticsEvent({ name, properties, userId, sessionId, timestamp: new Date() });
    await doc.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Event tracking error:', error);
    res.status(500).json({ error: 'Event tracking failed' });
  }
});

// Get real-time data (last minute aggregate)
router.get('/realtime', async (req, res) => {
  try {
    const since = new Date(Date.now() - 60_000);
    const agg = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: '$name', count: { $sum: 1 } } },
    ]);
    const counts = Object.fromEntries(agg.map((r: any) => [r._id, r.count]));
    res.json({
      activeUsers: 0,
      pageViews: counts['page_view'] || 0,
      events: Object.entries(counts).map(([name, count]) => ({ name, count, timestamp: new Date().toISOString() })),
      topPages: [],
    });
  } catch (error) {
    console.error('Real-time analytics error:', error);
    res.status(500).json({ error: 'Real-time analytics retrieval failed' });
  }
});

// Get historical metrics (hourly aggregate)
router.get('/metrics', async (req, res) => {
  try {
    const rows = await AnalyticsEvent.aggregate([
      { $group: { _id: { $dateTrunc: { date: '$timestamp', unit: 'hour' } }, value: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const data = rows.map((r: any) => ({ timestamp: new Date(r._id).toISOString(), value: r.value }));
    const total = data.reduce((s: number, d: any) => s + d.value, 0);
    const values = data.map((d: any) => d.value);
    const summary = { total, average: values.length ? total / values.length : 0, min: Math.min(...values, 0), max: Math.max(...values, 0) };
    res.json({ data, summary });
  } catch (error) {
    console.error('Historical metrics error:', error);
    res.status(500).json({ error: 'Historical metrics retrieval failed' });
  }
});

export default router
