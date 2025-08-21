const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
    
    // Model configuration
    this.defaultModel = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
    this.maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS) || 8192;
    
    // Document context configuration
    this.maxContextLength = parseInt(process.env.GEMINI_MAX_CONTEXT_LENGTH) || 32768;
    this.enableDocumentContext = process.env.ENABLE_DOCUMENT_CONTEXT !== 'false';
    
    if (!this.apiKey) {
      logger.warn('GEMINI_API_KEY not found. Gemini service will not work.');
    }
  }

  /**
   * Generate content with document context support
   * @param {string} prompt - The user prompt
   * @param {Object} options - Additional options including document context
   * @returns {Promise<Object>} - Response object
   */
  async generateContent(prompt, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      // Use specified model or default
      const modelName = options.model || this.defaultModel;
      const model = this.genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          maxOutputTokens: options.maxTokens || this.maxTokens,
          temperature: options.temperature || 0.7,
          topK: options.topK || 40,
          topP: options.topP || 0.95,
        }
      });

      // Build the full prompt with document context
      let fullPrompt = prompt;
      
      // Add document context if provided
      if (options.documentContext && this.enableDocumentContext) {
        const context = this.formatDocumentContext(options.documentContext);
        fullPrompt = this.buildPromptWithContext(prompt, context);
        logger.info('Added document context to prompt', {
          contextLength: context.length,
          documentsCount: Array.isArray(options.documentContext) ? options.documentContext.length : 1
        });
      }

      // Add any additional context
      if (options.context) {
        fullPrompt += `\n\nAdditional Context:\n${options.context}`;
      }

      // Generate content
      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      
      return {
        success: true,
        text: response.text(),
        model: modelName,
        usage: {
          promptTokens: result.usageMetadata?.promptTokenCount || 0,
          responseTokens: result.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.usageMetadata?.totalTokenCount || 0
        },
        contextUsed: !!options.documentContext,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('GEMINI API Error:', error);
      
      // Handle specific errors
      if (error.message && error.message.includes('API_KEY')) {
        return {
          success: false,
          error: 'Invalid or missing API key',
          errorType: 'AUTHENTICATION_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      if (error.message && error.message.includes('quota')) {
        return {
          success: false,
          error: 'API quota exceeded',
          errorType: 'QUOTA_ERROR',
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
   * Format document context for inclusion in prompt
   * @param {Object|Array} documentContext - Document(s) to include as context
   * @returns {string} - Formatted context string
   */
  formatDocumentContext(documentContext) {
    if (!documentContext) return '';

    const documents = Array.isArray(documentContext) ? documentContext : [documentContext];
    
    let formattedContext = '';
    
    for (const doc of documents) {
      if (doc.title) {
        formattedContext += `\n### Document: ${doc.title}\n`;
      }
      
      if (doc.metadata) {
        formattedContext += `Metadata: ${JSON.stringify(doc.metadata)}\n`;
      }
      
      if (doc.content) {
        // Truncate content if too long
        const content = doc.content.length > 10000 
          ? doc.content.substring(0, 10000) + '...[truncated]'
          : doc.content;
        formattedContext += `Content:\n${content}\n`;
      }
      
      if (doc.url) {
        formattedContext += `Source: ${doc.url}\n`;
      }
      
      formattedContext += '\n---\n';
    }
    
    return formattedContext;
  }

  /**
   * Build prompt with document context
   * @param {string} prompt - Original user prompt
   * @param {string} context - Formatted document context
   * @returns {string} - Complete prompt with context
   */
  buildPromptWithContext(prompt, context) {
    const contextPrompt = `
You are an AI assistant with access to the following document context. 
Use this information to provide accurate and relevant responses.

## Document Context:
${context}

## User Query:
${prompt}

Please provide a comprehensive response based on the document context above.
If the answer cannot be found in the provided context, clearly state that.
`;

    // Check if combined length exceeds limit
    if (contextPrompt.length > this.maxContextLength) {
      // Truncate context to fit
      const truncatedContext = context.substring(0, this.maxContextLength - prompt.length - 500);
      return this.buildPromptWithContext(prompt, truncatedContext + '\n...[context truncated]');
    }

    return contextPrompt;
  }

  /**
   * Generate content with long context support
   * @param {string} prompt - The user prompt
   * @param {string} context - Long context information
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response object
   */
  async generateWithLongContext(prompt, context, options = {}) {
    return this.generateContent(prompt, {
      ...options,
      context,
      maxTokens: Math.max(options.maxTokens || this.maxTokens, 16384) // Allow longer responses
    });
  }

  /**
   * Generate content with file attachments as document context
   * @param {string} prompt - The user prompt
   * @param {Array} files - Array of file objects with mimeType and data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response object
   */
  async generateWithFiles(prompt, files, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      const modelName = options.model || this.defaultModel;
      const model = this.genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          maxOutputTokens: options.maxTokens || this.maxTokens,
          temperature: options.temperature || 0.7,
        }
      });

      // Build content parts for multimodal input
      const parts = [{ text: prompt }];
      
      // Add files as inline data
      for (const file of files) {
        if (file.mimeType && file.data) {
          parts.push({
            inlineData: {
              mimeType: file.mimeType,
              data: file.data // Should be base64 encoded
            }
          });
        } else if (file.content) {
          // Text file content
          parts.push({
            text: `\nFile Content:\n${file.content}\n`
          });
        }
      }

      const result = await model.generateContent(parts);
      const response = result.response;

      return {
        success: true,
        text: response.text(),
        model: modelName,
        filesProcessed: files.length,
        usage: {
          promptTokens: result.usageMetadata?.promptTokenCount || 0,
          responseTokens: result.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.usageMetadata?.totalTokenCount || 0
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('GEMINI Files Processing Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process files',
        errorType: 'FILE_PROCESSING_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Extract and analyze document structure
   * @param {string} documentContent - Raw document content
   * @returns {Object} - Structured document analysis
   */
  async analyzeDocument(documentContent) {
    const prompt = `
Analyze the following document and provide a structured summary:
1. Main topics covered
2. Key points and findings
3. Document type and structure
4. Relevant metadata

Document:
${documentContent}
`;

    const result = await this.generateContent(prompt, {
      temperature: 0.3, // Lower temperature for more consistent analysis
      maxTokens: 2048
    });

    if (result.success) {
      return {
        success: true,
        analysis: result.text,
        timestamp: result.timestamp
      };
    }

    return result;
  }

  /**
   * Answer questions based on document context
   * @param {string} question - User question
   * @param {Object|Array} documents - Document context
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response with answer
   */
  async answerFromDocuments(question, documents, options = {}) {
    return this.generateContent(question, {
      ...options,
      documentContext: documents
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
      'gemini-pro-vision'
    ];
  }

  /**
   * Get service configuration status
   * @returns {Object} - Configuration details
   */
  getStatus() {
    return {
      configured: this.isConfigured(),
      defaultModel: this.defaultModel,
      maxTokens: this.maxTokens,
      maxContextLength: this.maxContextLength,
      documentContextEnabled: this.enableDocumentContext,
      apiKeyPresent: !!this.apiKey
    };
  }
}

module.exports = GeminiService;
