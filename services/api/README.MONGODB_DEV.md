# Vision Platform — MongoDB Local Dev Setup

## Quickstart

1. Copy environment template:
   ```sh
   cp .env.example .env
   # Edit .env and set MONGODB_URI, REDIS_URL, MINIO creds, etc.
   ```

2. Start local stack:
   ```sh
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. Run MongoDB migrations (collections/indexes):
   ```sh
   node scripts/migrate_mongodb.js "mongodb://admin:password@localhost:27017/vision_dev?authSource=admin"
   ```

4. Test DB connection:
   ```sh
   node -e "require('./services/api/lib/db').connect().then(()=>console.log('ok')).catch(e=>console.error(e))"
   ```

5. Start API:
   ```sh
   cd services/api
   npm run dev
   ```

## Acceptance
- `npm run dev` connects to MongoDB and collections exist.
- You can run the migration script and see collections in MongoDB.
