// MongoDB connection helper with retry/backoff
const { MongoClient } = require('mongodb');

const DEFAULT_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vision_dev?authSource=admin';
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

let client;

async function connect(uri = DEFAULT_URI, retries = MAX_RETRIES) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      return client;
    } catch (err) {
      lastErr = err;
      console.warn(`MongoDB connection failed (attempt ${i + 1}/${retries}): ${err.message}`);
      await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
    }
  }
  throw lastErr;
}

module.exports = { connect, getClient: () => client };
