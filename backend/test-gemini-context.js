require('dotenv').config();
const GeminiService = require('./src/services/geminiService');

async function testGeminiDocumentContext() {
  console.log('Testing Gemini AI Assistant with Document Context...\n');
  
  const geminiService = new GeminiService();
  
  // Check configuration
  const status = geminiService.getStatus();
  console.log('Gemini Service Status:');
  console.log('- Configured:', status.configured ? '✓' : '✗');
  console.log('- Document Context Enabled:', status.documentContextEnabled ? '✓' : '✗');
  console.log('- Default Model:', status.defaultModel);
  console.log('- Max Context Length:', status.maxContextLength);
  
  if (!status.configured) {
    console.log('\n⚠️  Gemini API not configured. Set GEMINI_API_KEY or GOOGLE_API_KEY in .env');
    return;
  }
  
  // Test 1: Simple prompt without context
  console.log('\n📝 Test 1: Simple prompt without context');
  const result1 = await geminiService.generateContent('What is machine learning?', {
    maxTokens: 100
  });
  console.log('Result:', result1.success ? '✓ Success' : '✗ Failed');
  if (result1.success) {
    console.log('Response preview:', result1.text.substring(0, 100) + '...');
    console.log('Context used:', result1.contextUsed);
  } else {
    console.log('Error:', result1.error);
  }
  
  // Test 2: Prompt with document context
  console.log('\n📄 Test 2: Prompt with document context');
  const documentContext = {
    title: 'Company Policy Document',
    metadata: { 
      author: 'HR Department',
      date: '2024-01-15',
      version: '2.0'
    },
    content: `
      ACME Corporation Employee Handbook
      
      1. Work Hours:
      - Standard work hours are 9 AM to 5 PM, Monday through Friday
      - Flexible hours available with manager approval
      - Remote work allowed up to 3 days per week
      
      2. Leave Policy:
      - Annual leave: 21 days per year
      - Sick leave: 10 days per year
      - Personal days: 3 days per year
      
      3. Benefits:
      - Health insurance covering employee and family
      - Dental and vision coverage
      - 401(k) with 5% company match
      - Professional development budget of $2000 per year
    `,
    url: 'https://intranet.acme.com/policies/handbook'
  };
  
  const result2 = await geminiService.generateContent(
    'How many days of annual leave do employees get?',
    { documentContext }
  );
  
  console.log('Result:', result2.success ? '✓ Success' : '✗ Failed');
  if (result2.success) {
    console.log('Response:', result2.text);
    console.log('Context used:', result2.contextUsed);
  } else {
    console.log('Error:', result2.error);
  }
  
  // Test 3: Multiple documents as context
  console.log('\n📚 Test 3: Multiple documents as context');
  const multipleDocuments = [
    {
      title: 'Q3 Sales Report',
      content: 'Total sales: $1.2M, Growth: 15% YoY, Top product: Widget Pro'
    },
    {
      title: 'Q4 Projections',
      content: 'Expected sales: $1.5M, Projected growth: 25% YoY, Focus on Widget Pro Plus'
    }
  ];
  
  const result3 = await geminiService.answerFromDocuments(
    'What was the sales growth in Q3 and what is projected for Q4?',
    multipleDocuments
  );
  
  console.log('Result:', result3.success ? '✓ Success' : '✗ Failed');
  if (result3.success) {
    console.log('Response:', result3.text);
  } else {
    console.log('Error:', result3.error);
  }
  
  // Test 4: Document analysis
  console.log('\n🔍 Test 4: Document analysis');
  const analysisResult = await geminiService.analyzeDocument(`
    Technical Specification: Next-Gen Payment System
    
    Overview:
    The system will process real-time payments using blockchain technology
    with support for multiple cryptocurrencies and traditional payment methods.
    
    Key Features:
    - Multi-currency support (USD, EUR, BTC, ETH)
    - Real-time transaction processing (<2 seconds)
    - Smart contract integration
    - API-first architecture
    - 99.99% uptime SLA
  `);
  
  console.log('Result:', analysisResult.success ? '✓ Success' : '✗ Failed');
  if (analysisResult.success) {
    console.log('Analysis:', analysisResult.analysis);
  } else {
    console.log('Error:', analysisResult.error);
  }
  
  // Test 5: File attachments (simulated)
  console.log('\n📎 Test 5: File attachments as context');
  const files = [
    {
      content: 'Invoice #1234\nAmount: $500\nDue Date: 2024-02-15\nStatus: Pending'
    },
    {
      content: 'Invoice #1235\nAmount: $750\nDue Date: 2024-02-20\nStatus: Paid'
    }
  ];
  
  const result5 = await geminiService.generateWithFiles(
    'What is the total amount of unpaid invoices?',
    files
  );
  
  console.log('Result:', result5.success ? '✓ Success' : '✗ Failed');
  if (result5.success) {
    console.log('Response:', result5.text);
    console.log('Files processed:', result5.filesProcessed);
  } else {
    console.log('Error:', result5.error);
  }
  
  console.log('\n✅ Gemini document context tests complete!');
}

// Run tests
testGeminiDocumentContext().catch(console.error);
