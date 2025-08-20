#!/usr/bin/env node

/**
 * Test script for GEMINI service
 * This script tests the GEMINI service without function calling errors
 */

// Load environment variables
require('dotenv').config();

// Import the GEMINI service
const GeminiService = require('./services/geminiService');

async function testGeminiService() {
  console.log('🧪 Testing GEMINI Service...\n');

  // Initialize service
  const geminiService = new GeminiService();

  // Check configuration
  console.log('📋 Service Configuration:');
  console.log(`   Configured: ${geminiService.isConfigured()}`);
  console.log(`   Default Model: ${geminiService.defaultModel}`);
  console.log(`   Max Tokens: ${geminiService.maxTokens}`);
  console.log(`   Function Calling: ${geminiService.enableFunctionCalling}\n`);

  if (!geminiService.isConfigured()) {
    console.log('❌ GOOGLE_API_KEY not configured. Please add it to your .env file.');
    console.log('   Example: GOOGLE_API_KEY=your-actual-api-key-here');
    return;
  }

  // Test 1: Simple prompt
  console.log('🔍 Test 1: Simple Prompt');
  try {
    const result1 = await geminiService.generateContent('Hello, how are you?');
    if (result1.success) {
      console.log('✅ Success:', result1.text.substring(0, 100) + '...');
      console.log(`   Model: ${result1.model}`);
      console.log(`   Tokens: ${result1.usage.totalTokens}\n`);
    } else {
      console.log('❌ Error:', result1.error);
      console.log(`   Type: ${result1.errorType}\n`);
    }
  } catch (error) {
    console.log('❌ Exception:', error.message, '\n');
  }

  // Test 2: Long context
  console.log('🔍 Test 2: Long Context');
  try {
    const longContext = `This is a very long context that demonstrates the service's ability to handle extended text without function calling errors. 
    
    The context includes multiple paragraphs and should be processed correctly by the GEMINI model. 
    
    Function calling has been explicitly disabled to prevent the errors you were experiencing.`;
    
    const result2 = await geminiService.generateWithLongContext(
      'Summarize the context above in one sentence.',
      longContext
    );
    
    if (result2.success) {
      console.log('✅ Success:', result2.text);
      console.log(`   Model: ${result2.model}`);
      console.log(`   Tokens: ${result2.usage.totalTokens}\n`);
    } else {
      console.log('❌ Error:', result2.error);
      console.log(`   Type: ${result2.errorType}\n`);
    }
  } catch (error) {
    console.log('❌ Exception:', error.message, '\n');
  }

  // Test 3: Complex prompt
  console.log('🔍 Test 3: Complex Prompt');
  try {
    const complexPrompt = `Please analyze the following scenario and provide a detailed response:
    
    1. A software development team is working on a Vision Platform
    2. They encounter function calling errors with AI services
    3. They need to implement monitoring and new AI features
    4. The platform should support long context and file processing
    
    What would be your recommendations for this team?`;
    
    const result3 = await geminiService.generateContent(complexPrompt, {
      temperature: 0.3,
      maxTokens: 1000
    });
    
    if (result3.success) {
      console.log('✅ Success:', result3.text.substring(0, 200) + '...');
      console.log(`   Model: ${result3.model}`);
      console.log(`   Tokens: ${result3.usage.totalTokens}\n`);
    } else {
      console.log('❌ Error:', result3.error);
      console.log(`   Type: ${result3.errorType}\n`);
    }
  } catch (error) {
    console.log('❌ Exception:', error.message, '\n');
  }

  console.log('🎉 GEMINI Service Testing Complete!');
}

// Run the test
testGeminiService().catch(console.error);

