#!/usr/bin/env bash
set -euo pipefail
echo "Installing dependencies..."
npm install --no-audit --no-fund

echo "Checking MongoDB connectivity..."
node -e "const { MongoClient } = require('mongodb'); const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/multimodal?authSource=admin'; new MongoClient(uri).connect().then(() => { console.log('MongoDB connection successful'); process.exit(0); }).catch(e => { console.error('MongoDB connection failed:', e.message); process.exit(1); });"
