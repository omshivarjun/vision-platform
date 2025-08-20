const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    
    // Disable function calling by default
    this.enableFunctionCalling = process.env.ENABLE_GEMINI_FUNCTION_CALLING === 'true';
    
    // Model configuration
    this.defaultModel = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
    this.maxTokens = process.env.GEMINI_MAX_TOKENS || 8192;
    
    if (!this.apiKey) {
      console.warn('GOOGLE_API_KEY not found. GEMINI service will not work.');
    }
  }

  /**
   * Generate content with proper error handling and function calling disabled
   * @param {string} prompt - The user prompt
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response object
   */
  async generateContent(prompt, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('GOOGLE_API_KEY not configured');
      }

      // Use specified model or default
      const modelName = options.model || this.defaultModel;
      const model = this.genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          maxOutputTokens: options.maxTokens || this.maxTokens,
          temperature: options.temperature || 0.7,
        }
      });

      // Prepare the generation config - explicitly disable function calling
      const generationConfig = {
        temperature: options.temperature || 0.7,
        topK: options.topK || 40,
        topP: options.topP || 0.95,
        maxOutputTokens: options.maxTokens || this.maxTokens,
        // Explicitly disable function calling to prevent errors
        tools: [],
        toolChoice: 'none'
      };

      // Create the content parts
      const contentParts = [{ text: prompt }];
      
      // Add any additional context or files
      if (options.context) {
        contentParts.push({ text: `\n\nContext: ${options.context}` });
      }

      if (options.files && options.files.length > 0) {
        for (const file of options.files) {
          contentParts.push({
            inlineData: {
              mimeType: file.mimeType || 'text/plain',
              data: file.data
            }
          });
        }
      }

      // Generate content with function calling explicitly disabled
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: contentParts }],
        generationConfig,
        safetySettings: options.safetySettings || [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      });

      const response = await result.response;
      
      return {
        success: true,
        text: response.text(),
        model: modelName,
        usage: {
          promptTokens: result.usageMetadata?.promptTokenCount || 0,
          responseTokens: result.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.usageMetadata?.totalTokenCount || 0
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('GEMINI API Error:', error);
      
      // Handle specific function calling errors
      if (error.message && error.message.includes('function response parts')) {
        return {
          success: false,
          error: 'Function calling error - please try again with a simpler prompt',
          errorType: 'FUNCTION_CALLING_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Handle other API errors
      if (error.message && error.message.includes('API_KEY')) {
        return {
          success: false,
          error: 'Invalid or missing API key',
          errorType: 'AUTHENTICATION_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        errorType: 'API_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate content with long context support
   * @param {string} prompt - The user prompt
   * @param {string} context - Long context information
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response object
   */
  async generateWithLongContext(prompt, context, options = {}) {
    // Combine prompt and context
    const fullPrompt = `${prompt}\n\nContext:\n${context}`;
    
    return this.generateContent(fullPrompt, {
      ...options,
      maxTokens: Math.max(options.maxTokens || this.maxTokens, 16384) // Allow longer responses
    });
  }

  /**
   * Generate content with file attachments
   * @param {string} prompt - The user prompt
   * @param {Array} files - Array of file objects with mimeType and data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response object
   */
  async generateWithFiles(prompt, files, options = {}) {
    return this.generateContent(prompt, {
      ...options,
      files
    });
  }

  /**
   * Check if the service is properly configured
   * @returns {boolean} - Service status
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Get available models
   * @returns {Array} - List of available models
   */
  getAvailableModels() {
    return [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.0-pro',
      'gemini-1.0-pro-vision'
    ];
  }
}

module.exports = GeminiService;
