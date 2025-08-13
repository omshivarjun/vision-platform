#!/usr/bin/env node

/**
 * Vision Platform Database Seeder
 * Populates the database with demo users, languages, and sample data
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../services/api/src/models/User');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vision';

// Demo data
const demoUsers = [
  {
    email: 'admin@demo.local',
    name: 'Admin User',
    password: 'admin123',
    role: 'admin',
    preferences: {
      language: 'en',
      theme: 'light',
      accessibility: {
        highContrast: false,
        largeText: false,
        voiceSpeed: 1.0,
        hapticFeedback: true,
      },
    },
  },
  {
    email: 'user@demo.local',
    name: 'Demo User',
    password: 'user123',
    role: 'user',
    preferences: {
      language: 'en',
      theme: 'auto',
      accessibility: {
        highContrast: false,
        largeText: false,
        voiceSpeed: 1.0,
        hapticFeedback: false,
      },
    },
  },
  {
    email: 'visuallyimpaired@demo.local',
    name: 'Accessibility User',
    password: 'access123',
    role: 'user',
    preferences: {
      language: 'en',
      theme: 'dark',
      accessibility: {
        highContrast: true,
        largeText: true,
        voiceSpeed: 0.8,
        hapticFeedback: true,
        audioCues: true,
        screenReader: true,
      },
    },
  },
];

const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
];

const sampleGlossaryEntries = [
  {
    sourceText: 'Hello',
    translatedText: 'Hola',
    sourceLang: 'en',
    targetLang: 'es',
    context: 'Greeting',
  },
  {
    sourceText: 'Good morning',
    translatedText: 'Bonjour',
    sourceLang: 'en',
    targetLang: 'fr',
    context: 'Greeting',
  },
  {
    sourceText: 'Thank you',
    translatedText: 'Danke',
    sourceLang: 'en',
    targetLang: 'de',
    context: 'Politeness',
  },
  {
    sourceText: 'Welcome',
    translatedText: 'Bienvenido',
    sourceLang: 'en',
    targetLang: 'es',
    context: 'Hospitality',
  },
  {
    sourceText: 'Goodbye',
    translatedText: 'Arrivederci',
    sourceLang: 'en',
    targetLang: 'it',
    context: 'Farewell',
  },
];

const sampleTranslationHistory = [
  {
    sourceText: 'Hello world',
    translatedText: 'Hola mundo',
    sourceLang: 'en',
    targetLang: 'es',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    model: 'marian',
    confidence: 0.95,
  },
  {
    sourceText: 'Good morning',
    translatedText: 'Bonjour',
    sourceLang: 'en',
    targetLang: 'fr',
    timestamp: new Date(Date.now() - 172800000), // 2 days ago
    model: 'marian',
    confidence: 0.92,
  },
  {
    sourceText: 'Thank you very much',
    translatedText: 'Muito obrigado',
    sourceLang: 'en',
    targetLang: 'pt',
    timestamp: new Date(Date.now() - 259200000), // 3 days ago
    model: 'marian',
    confidence: 0.89,
  },
];

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function clearDatabase() {
  try {
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');
  } catch (error) {
    console.error('❌ Failed to clear database:', error.message);
  }
}

async function createUsers() {
  try {
    for (const userData of demoUsers) {
      const { password, ...userFields } = userData;
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const user = new User({
        ...userFields,
        password: hashedPassword,
      });
      
      await user.save();
      console.log(`👤 Created user: ${user.email}`);
    }
    console.log('✅ All demo users created successfully');
  } catch (error) {
    console.error('❌ Failed to create users:', error.message);
  }
}

async function updateUserPreferences() {
  try {
    // Update admin user with additional preferences
    await User.findOneAndUpdate(
      { email: 'admin@demo.local' },
      {
        $set: {
          'preferences.supportedLanguages': supportedLanguages,
          'preferences.defaultSourceLang': 'en',
          'preferences.defaultTargetLang': 'es',
        },
      }
    );

    // Update regular user with glossary and history
    await User.findOneAndUpdate(
      { email: 'user@demo.local' },
      {
        $set: {
          'preferences.glossary': sampleGlossaryEntries,
          'preferences.translationHistory': sampleTranslationHistory,
        },
      }
    );

    // Update accessibility user with specific preferences
    await User.findOneAndUpdate(
      { email: 'visuallyimpaired@demo.local' },
      {
        $set: {
          'preferences.navigationMode': 'voice',
          'preferences.obstacleDetection': true,
          'preferences.sceneDescription': true,
          'preferences.voiceCommands': true,
        },
      }
    );

    console.log('✅ User preferences updated successfully');
  } catch (error) {
    console.error('❌ Failed to update user preferences:', error.message);
  }
}

async function createSampleFiles() {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../services/api/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create sample text files
    const samplesDir = path.join(uploadsDir, 'samples');
    if (!fs.existsSync(samplesDir)) {
      fs.mkdirSync(samplesDir, { recursive: true });
    }

    // Sample text files
    const sampleTexts = [
      { name: 'sample_english.txt', content: 'Hello, welcome to the Vision platform!' },
      { name: 'sample_spanish.txt', content: '¡Hola, bienvenido a la plataforma Vision!' },
      { name: 'sample_french.txt', content: 'Bonjour, bienvenue sur la plateforme Vision !' },
    ];

    for (const sample of sampleTexts) {
      const filePath = path.join(samplesDir, sample.name);
      fs.writeFileSync(filePath, sample.content);
      console.log(`📄 Created sample file: ${sample.name}`);
    }

    console.log('✅ Sample files created successfully');
  } catch (error) {
    console.error('❌ Failed to create sample files:', error.message);
  }
}

async function main() {
  console.log('🌱 Starting Vision Platform database seeding...\n');
  
  await connectDB();
  await clearDatabase();
  await createUsers();
  await updateUserPreferences();
  await createSampleFiles();
  
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('   Admin: admin@demo.local / admin123');
  console.log('   User: user@demo.local / user123');
  console.log('   Accessibility: visuallyimpaired@demo.local / access123');
  console.log('\n🚀 You can now start the application and log in with these accounts.');
  
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Run the seeder
main().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
