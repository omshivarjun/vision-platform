// Idempotent Mongo init: collections & basic indexes
// NOTE: Run this with a node runner connected to Mongo if needed

module.exports = async function init(db) {
  const collections = ['users', 'documents', 'translations', 'analytics', 'subscriptions']
  for (const name of collections) {
    const exists = await db.listCollections({ name }).hasNext()
    if (!exists) {
      await db.createCollection(name)
    }
  }
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('documents').createIndex({ createdAt: 1 })
  await db.collection('translations').createIndex({ createdAt: 1 })
  await db.collection('analytics').createIndex({ timestamp: 1 })
  await db.collection('subscriptions').createIndex({ userId: 1 })
}
