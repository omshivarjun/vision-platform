// Migration script: create initial collections and indexes for vision platform
const { connect } = require('../services/api/lib/db');

const collections = [
  { name: 'users', indexes: [{ key: { email: 1 }, unique: true }] },
  { name: 'documents', indexes: [{ key: { ownerId: 1 } }, { key: { createdAt: -1 } }] },
  { name: 'translations', indexes: [{ key: { userId: 1 } }, { key: { createdAt: -1 } }] },
  { name: 'usage_analytics', indexes: [{ key: { userId: 1 } }, { key: { event: 1 } }] },
];

async function migrate(uri) {
  const client = await connect(uri);
  const db = client.db();
  for (const col of collections) {
    const collection = db.collection(col.name);
    await collection.createIndex({ _id: 1 });
    for (const idx of col.indexes) {
      await collection.createIndex(idx.key, { unique: !!idx.unique });
    }
    console.log(`Ensured collection and indexes for: ${col.name}`);
  }
  await client.close();
}

if (require.main === module) {
  const uri = process.argv[2] || process.env.MONGODB_URI;
  if (!uri) {
    console.error('Usage: node scripts/migrate_mongodb.js <mongodb-uri>');
    process.exit(1);
  }
  migrate(uri).then(() => {
    console.log('Migration complete');
    process.exit(0);
  }).catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
  });
}
