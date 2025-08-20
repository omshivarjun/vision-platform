// MongoDB initialization script for Vision Platform
// This script creates the necessary collections and indexes

print('🚀 Initializing Vision Platform database...');

// Switch to the vision_platform database
db = db.getSiblingDB('vision_platform');

// Create collections with schema validation
print('📚 Creating collections...');

// Users collection
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'createdAt'],
      properties: {
        email: { bsonType: 'string' },
        name: { bsonType: 'string' },
        avatar: { bsonType: 'string' },
        subscription: {
          bsonType: 'object',
          properties: {
            plan: { enum: ['free', 'pro', 'enterprise'] },
            status: { enum: ['active', 'inactive', 'cancelled'] },
            currentPeriodEnd: { bsonType: 'date' }
          }
        },
        preferences: { bsonType: 'object' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Documents collection
db.createCollection('documents', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'filename', 'status', 'createdAt'],
      properties: {
        userId: { bsonType: 'objectId' },
        filename: { bsonType: 'string' },
        originalName: { bsonType: 'string' },
        mimeType: { bsonType: 'string' },
        size: { bsonType: 'number' },
        status: { enum: ['uploading', 'processing', 'completed', 'failed'] },
        extractedText: { bsonType: 'string' },
        ocrData: { bsonType: 'object' },
        metadata: { bsonType: 'object' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Translations collection
db.createCollection('translations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'sourceText', 'sourceLanguage', 'targetLanguage', 'createdAt'],
      properties: {
        userId: { bsonType: 'objectId' },
        sourceText: { bsonType: 'string' },
        translatedText: { bsonType: 'string' },
        sourceLanguage: { bsonType: 'string' },
        targetLanguage: { bsonType: 'string' },
        provider: { bsonType: 'string' },
        confidence: { bsonType: 'number' },
        documentId: { bsonType: 'objectId' },
        createdAt: { bsonType: 'date' }
      }
    }
  }
});

// Analytics collection
db.createCollection('analytics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'event', 'timestamp'],
      properties: {
        userId: { bsonType: 'objectId' },
        event: { bsonType: 'string' },
        category: { bsonType: 'string' },
        properties: { bsonType: 'object' },
        timestamp: { bsonType: 'date' },
        sessionId: { bsonType: 'string' }
      }
    }
  }
});

// Conversations collection
db.createCollection('conversations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'title', 'createdAt'],
      properties: {
        userId: { bsonType: 'objectId' },
        title: { bsonType: 'string' },
        messages: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['role', 'content'],
            properties: {
              role: { enum: ['user', 'assistant'] },
              content: { bsonType: 'string' },
              timestamp: { bsonType: 'date' }
            }
          }
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Subscriptions collection
db.createCollection('subscriptions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'plan', 'status', 'createdAt'],
      properties: {
        userId: { bsonType: 'objectId' },
        plan: { enum: ['free', 'pro', 'enterprise'] },
        status: { enum: ['active', 'inactive', 'cancelled'] },
        provider: { bsonType: 'string' },
        providerId: { bsonType: 'string' },
        currentPeriodStart: { bsonType: 'date' },
        currentPeriodEnd: { bsonType: 'date' },
        cancelAtPeriodEnd: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Create indexes for better performance
print('🔍 Creating indexes...');

// Users indexes
db.users.createIndex({ 'email': 1 }, { unique: true });
db.users.createIndex({ 'createdAt': -1 });

// Documents indexes
db.documents.createIndex({ 'userId': 1 });
db.documents.createIndex({ 'status': 1 });
db.documents.createIndex({ 'createdAt': -1 });

// Translations indexes
db.translations.createIndex({ 'userId': 1 });
db.translations.createIndex({ 'sourceLanguage': 1, 'targetLanguage': 1 });
db.translations.createIndex({ 'createdAt': -1 });

// Analytics indexes
db.analytics.createIndex({ 'userId': 1 });
db.analytics.createIndex({ 'event': 1 });
db.analytics.createIndex({ 'timestamp': -1 });
db.analytics.createIndex({ 'userId': 1, 'event': 1, 'timestamp': -1 });

// Conversations indexes
db.conversations.createIndex({ 'userId': 1 });
db.conversations.createIndex({ 'createdAt': -1 });

// Subscriptions indexes
db.subscriptions.createIndex({ 'userId': 1 });
db.subscriptions.createIndex({ 'status': 1 });
db.subscriptions.createIndex({ 'currentPeriodEnd': 1 });

print('✅ Database initialization completed successfully!');
print('📊 Collections created: users, documents, translations, analytics, conversations, subscriptions');
print('🔍 Indexes created for optimal performance');


