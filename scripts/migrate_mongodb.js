// Migration script: create initial collections and indexes for vision platform
const { MongoClient } = require('mongodb');

const collections = [
  { name: 'users', indexes: [{ key: { email: 1 }, unique: true }] },
  { name: 'documents', indexes: [{ key: { ownerId: 1 } }, { key: { createdAt: -1 } }] },
  { name: 'translations', indexes: [{ key: { userId: 1 } }, { key: { createdAt: -1 } }] },
  { name: 'usage_analytics', indexes: [{ key: { userId: 1 } }, { key: { event: 1 } }, { key: { ts: -1 } }] },
  { name: 'ocr_jobs', indexes: [{ key: { status: 1 } }, { key: { createdAt: -1 } }] },
  { name: 'ocr_pages', indexes: [{ key: { jobId: 1 } }, { key: { page: 1 } }] },
];

async function connectWithBackoff(uri, maxRetries = 5) {
  let attempt = 0;
  let delay = 500; // ms
  while (attempt < maxRetries) {
    try {
      const client = new MongoClient(uri, { maxPoolSize: 10 });
      await client.connect();
      return client;
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

async function migrate(uri) {
  const client = await connectWithBackoff(uri);
  const dbNameFromUri = new URL(uri).pathname.replace('/', '') || 'test';
  const db = client.db(dbNameFromUri);
  for (const col of collections) {
    const collection = db.collection(col.name);
    // Ensure collection exists by creating a trivial index
    await collection.createIndex({ _id: 1 });
    for (const idx of col.indexes) {
      await collection.createIndex(idx.key, { unique: !!idx.unique });
    }
    console.log(`Ensured collection and indexes for: ${col.name}`);
  }
  await client.close();
}

if (require.main === module) {
  const uriArg = process.argv.find((a) => a.startsWith('mongodb'));
  const uri = uriArg || process.env.MONGODB_URI;
  if (!uri) {
    console.error('Usage: node scripts/migrate_mongodb.js <mongodb-uri>');
    process.exit(1);
  }
  migrate(uri)
    .then(() => {
      console.log('Migration complete');
      process.exit(0);
    })
    .catch((e) => {
      console.error('Migration failed:', e);
      process.exit(1);
    });
}
