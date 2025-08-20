#!/usr/bin/env node

/**
 * Database Migration Script for Vision Platform
 * Sets up MongoDB collections and indexes
 */

const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/vision_platform?authSource=admin';

console.log('🚀 Starting Vision Platform database migration...');
console.log(`📊 Connecting to: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);

async function runMigrations() {
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    
    // Run migrations
    await createCollections(db);
    await createIndexes(db);
    await seedInitialData(db);
    
    console.log('✅ Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

async function createCollections(db) {
  console.log('📚 Creating collections...');
  
  const collections = [
    'users',
    'documents', 
    'translations',
    'analytics',
    'conversations',
    'subscriptions'
  ];

  for (const collectionName of collections) {
    try {
      await db.createCollection(collectionName);
      console.log(`  ✅ Created collection: ${collectionName}`);
    } catch (error) {
      if (error.code === 48) { // Collection already exists
        console.log(`  ℹ️  Collection already exists: ${collectionName}`);
      } else {
        throw error;
      }
    }
  }
}

async function createIndexes(db) {
  console.log('🔍 Creating indexes...');
  
  // Users indexes
  await db.collection('users').createIndex({ 'email': 1 }, { unique: true });
  await db.collection('users').createIndex({ 'createdAt': -1 });
  console.log('  ✅ Users indexes created');

  // Documents indexes
  await db.collection('documents').createIndex({ 'userId': 1 });
  await db.collection('documents').createIndex({ 'status': 1 });
  await db.collection('documents').createIndex({ 'createdAt': -1 });
  console.log('  ✅ Documents indexes created');

  // Translations indexes
  await db.collection('translations').createIndex({ 'userId': 1 });
  await db.collection('translations').createIndex({ 'sourceLanguage': 1, 'targetLanguage': 1 });
  await db.collection('translations').createIndex({ 'createdAt': -1 });
  console.log('  ✅ Translations indexes created');

  // Analytics indexes
  await db.collection('analytics').createIndex({ 'userId': 1 });
  await db.collection('analytics').createIndex({ 'event': 1 });
  await db.collection('analytics').createIndex({ 'timestamp': -1 });
  await db.collection('analytics').createIndex({ 'userId': 1, 'event': 1, 'timestamp': -1 });
  console.log('  ✅ Analytics indexes created');

  // Conversations indexes
  await db.collection('conversations').createIndex({ 'userId': 1 });
  await db.collection('conversations').createIndex({ 'createdAt': -1 });
  console.log('  ✅ Conversations indexes created');

  // Subscriptions indexes
  await db.collection('subscriptions').createIndex({ 'userId': 1 });
  await db.collection('subscriptions').createIndex({ 'status': 1 });
  await db.collection('subscriptions').createIndex({ 'currentPeriodEnd': 1 });
  console.log('  ✅ Subscriptions indexes created');
}

async function seedInitialData(db) {
  console.log('🌱 Seeding initial data...');
  
  // Check if we already have users
  const userCount = await db.collection('users').countDocuments();
  if (userCount > 0) {
    console.log('  ℹ️  Users already exist, skipping seed data');
    return;
  }

  // Create a default admin user
  const adminUser = {
    email: 'admin@visionplatform.com',
    name: 'Vision Platform Admin',
    avatar: '',
    subscription: {
      plan: 'enterprise',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    },
    preferences: {
      language: 'en',
      theme: 'light',
      notifications: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('users').insertOne(adminUser);
  console.log('  ✅ Created admin user: admin@visionplatform.com');

  // Create sample subscription plans
  const plans = [
    {
      name: 'Free',
      plan: 'free',
      price: 0,
      features: ['Basic OCR', '5 translations/month', '100MB storage'],
      createdAt: new Date()
    },
    {
      name: 'Pro',
      plan: 'pro',
      price: 999, // $9.99
      features: ['Advanced OCR', 'Unlimited translations', '1GB storage', 'Priority support'],
      createdAt: new Date()
    },
    {
      name: 'Enterprise',
      plan: 'enterprise',
      price: 4999, // $49.99
      features: ['All Pro features', '10GB storage', 'Team management', 'API access', '24/7 support'],
      createdAt: new Date()
    }
  ];

  await db.collection('subscriptions').insertMany(plans);
  console.log('  ✅ Created subscription plans');
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations().catch(console.error);
}

module.exports = { runMigrations };


