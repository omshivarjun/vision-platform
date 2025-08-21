require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testOCR() {
  console.log('Testing OCR functionality...\n');
  
  // Check environment variables
  console.log('Configuration:');
  console.log('- Gemini API Key:', process.env.GEMINI_API_KEY ? '✓ Configured' : '✗ Missing');
  console.log('- Google Vision API Key:', process.env.GOOGLE_VISION_API_KEY ? '✓ Configured' : '✗ Missing');
  console.log('- Azure Vision Key:', process.env.AZURE_VISION_KEY ? '✓ Configured' : '✗ Missing');
  console.log('- Cloud OCR Enabled:', process.env.ENABLE_CLOUD_OCR === 'true' ? '✓ Yes' : '✗ No');
  console.log('');
  
  // Test Gemini Vision API if configured
  if (process.env.GEMINI_API_KEY) {
    console.log('Testing Gemini Vision API...');
    try {
      // Create a simple test image with text
      const testImagePath = path.join(__dirname, 'test-image.png');
      
      // Check if test fixtures exist
      const fixturesPath = path.join(__dirname, '..', 'tests', 'fixtures');
      const sampleTextImage = path.join(fixturesPath, 'sample-text-image.jpg');
      
      if (fs.existsSync(sampleTextImage)) {
        console.log('Using sample-text-image.jpg for testing');
        
        const imageBuffer = fs.readFileSync(sampleTextImage);
        const base64Image = imageBuffer.toString('base64');
        
        const response = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent',
          {
            contents: [{
              parts: [
                { text: 'Extract all text from this image with high accuracy. Include table structures if present.' },
                { 
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image
                  }
                }
              ]
            }]
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': process.env.GEMINI_API_KEY
            },
            params: {
              key: process.env.GEMINI_API_KEY
            }
          }
        );
        
        const extractedText = response.data.candidates[0]?.content?.parts[0]?.text || '';
        console.log('✓ Gemini Vision API works!');
        console.log('Extracted text preview:', extractedText.substring(0, 200) + '...');
      } else {
        console.log('Sample image not found at:', sampleTextImage);
      }
    } catch (error) {
      console.error('✗ Gemini Vision API failed:', error.response?.data || error.message);
    }
  }
  
  // Test local Tesseract
  console.log('\nTesting Tesseract.js (local OCR)...');
  try {
    const Tesseract = require('tesseract.js');
    console.log('✓ Tesseract.js is installed and available');
  } catch (error) {
    console.error('✗ Tesseract.js not available:', error.message);
  }
  
  console.log('\nOCR test complete!');
}

testOCR().catch(console.error);
