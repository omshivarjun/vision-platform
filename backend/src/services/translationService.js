const axios = require('axios');
const logger = require('../utils/logger');

class TranslationService {
  constructor() {
    this.providers = {
      'google-cloud': this.googleCloudTranslate.bind(this),
      google: this.googleTranslate.bind(this),
      openai: this.openaiTranslate.bind(this),
      huggingface: this.huggingfaceTranslate.bind(this),
      mock: this.mockTranslate.bind(this)
    };
    
    this.defaultProvider = process.env.DEFAULT_TRANSLATION_PROVIDER || 'huggingface';
    this.cacheTTL = parseInt(process.env.TRANSLATION_CACHE_TTL) || 3600;
    this.maxLength = parseInt(process.env.MAX_TRANSLATION_LENGTH) || 5000;
    this.enableFunctionCalling = process.env.ENABLE_FUNCTION_CALLING === 'true';
    
    // Validate configuration
    this.validateConfiguration();
  }

  /**
   * Validate service configuration
   */
  validateConfiguration() {
    // Check each provider's requirements
    if (this.defaultProvider === 'openai' && !process.env.OPENAI_API_KEY) {
      logger.warn('OpenAI API key not configured, falling back to mock provider');
      this.defaultProvider = 'mock';
    }
    
    if (this.defaultProvider === 'google-cloud' && (!process.env.GOOGLE_CLOUD_PROJECT || !process.env.GOOGLE_CLOUD_CREDENTIALS)) {
      logger.warn('Google Cloud Translation not configured, falling back to mock provider');
      this.defaultProvider = 'mock';
    }
    
    if (this.defaultProvider === 'google' && !process.env.GOOGLE_API_KEY) {
      logger.warn('Google API key not configured, falling back to mock provider');
      this.defaultProvider = 'mock';
    }
    
    if (this.defaultProvider === 'huggingface' && !process.env.HUGGINGFACE_API_KEY) {
      logger.warn('Hugging Face API key not configured, falling back to mock provider');
      this.defaultProvider = 'mock';
    }
    
    logger.info(`Translation service initialized with provider: ${this.defaultProvider}`);
  }

  /**
   * Translate text using the specified or default provider
   */
  async translateText(text, sourceLanguage, targetLanguage, provider = null) {
    try {
      // Validate input
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid text input');
      }

      if (text.length > this.maxLength) {
        throw new Error(`Text too long. Maximum length: ${this.maxLength} characters`);
      }

      // Auto-detect language if not provided
      if (!sourceLanguage || sourceLanguage === 'auto') {
        sourceLanguage = await this.detectLanguage(text);
      }

      // Use default provider if none specified
      let selectedProvider = provider || this.defaultProvider;
      
      if (!this.providers[selectedProvider]) {
        throw new Error(`Unsupported translation provider: ${selectedProvider}`);
      }

      logger.info(`Translating text using ${selectedProvider} provider`, {
        sourceLanguage,
        targetLanguage,
        textLength: text.length
      });

      try {
        // Get translation from provider
        const result = await this.providers[selectedProvider](text, sourceLanguage, targetLanguage);
        
        // Store translation in database
        await this.storeTranslation(result);
        
        return result;
      } catch (providerError) {
        logger.warn(`Provider ${selectedProvider} failed, attempting fallback to mock`, { error: providerError.message });
        
        // Fallback to mock provider if main provider fails
        if (selectedProvider !== 'mock') {
          const mockResult = await this.providers['mock'](text, sourceLanguage, targetLanguage);
          await this.storeTranslation(mockResult);
          return mockResult;
        }
        
        throw providerError;
      }

    } catch (error) {
      logger.error('Translation failed', { error: error.message, sourceLanguage, targetLanguage });
      throw error;
    }
  }

  /**
   * Google Cloud Translation implementation
   */
  async googleCloudTranslate(text, sourceLanguage, targetLanguage) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;

    if (!projectId || !credentials) {
      throw new Error('Google Cloud Translation not configured. Please set GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_CREDENTIALS');
    }

    try {
      // Use Google Cloud Translation API
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_API_KEY}`,
        {
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        }
      );

      const translatedText = response.data.data.translations[0].translatedText;
      
      return {
        sourceText: text,
        translatedText,
        sourceLanguage,
        targetLanguage,
        provider: 'google-cloud',
        confidence: 0.95,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('Google Cloud translation failed', { error: error.message });
      throw new Error(`Google Cloud translation failed: ${error.message}`);
    }
  }

  /**
   * Google Translate implementation
   */
  async googleTranslate(text, sourceLanguage, targetLanguage) {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error('Google Translate not configured. Please set GOOGLE_API_KEY');
    }

    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        }
      );

      const translatedText = response.data.data.translations[0].translatedText;
      
      return {
        sourceText: text,
        translatedText,
        sourceLanguage,
        targetLanguage,
        provider: 'google',
        confidence: 0.9,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('Google translation failed', { error: error.message });
      throw new Error(`Google translation failed: ${error.message}`);
    }
  }

  /**
   * OpenAI translation implementation - FIXED
   */
  async openaiTranslate(text, sourceLanguage, targetLanguage) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI not configured. Please set OPENAI_API_KEY');
    }

    // Check if function calling is enabled
    if (this.enableFunctionCalling) {
      logger.warn('Function calling is enabled but not implemented. Using standard translation.');
    }

    try {
      const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Only return the translated text, nothing else:\n\n${text}`;
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional translator. Translate accurately and maintain the original meaning and tone.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3,
          // Explicitly disable function calling to prevent errors
          functions: undefined,
          function_call: undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const translatedText = response.data.choices[0].message.content.trim();
      
      return {
        sourceText: text,
        translatedText,
        sourceLanguage,
        targetLanguage,
        provider: 'openai',
        confidence: 0.85,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('OpenAI translation failed', { error: error.message });
      
      // Handle function calling errors specifically
      if (error.response && error.response.data && error.response.data.error) {
        const apiError = error.response.data.error;
        if (apiError.message && apiError.message.includes('function response parts')) {
          logger.error('OpenAI function calling error detected. This suggests function calling is enabled but not properly configured.');
          throw new Error('OpenAI function calling configuration error. Please check ENABLE_FUNCTION_CALLING setting.');
        }
      }
      
      throw new Error(`OpenAI translation failed: ${error.message}`);
    }
  }

  /**
   * Mock translation for testing and development
   */
  async mockTranslate(text, sourceLanguage, targetLanguage) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simple mock translation logic
    let translatedText = text;
    
    if (targetLanguage === 'es') {
      translatedText = `[ES] ${text}`;
    } else if (targetLanguage === 'fr') {
      translatedText = `[FR] ${text}`;
    } else if (targetLanguage === 'de') {
      translatedText = `[DE] ${text}`;
    } else if (targetLanguage === 'ja') {
      translatedText = `[JA] ${text}`;
    } else if (targetLanguage === 'zh') {
      translatedText = `[ZH] ${text}`;
    } else {
      translatedText = `[${targetLanguage.toUpperCase()}] ${text}`;
    }

    return {
      sourceText: text,
      translatedText,
      sourceLanguage,
      targetLanguage,
      provider: 'mock',
      confidence: 0.5,
      timestamp: new Date()
    };
  }

  /**
   * Detect language of input text
   */
  async detectLanguage(text) {
    // Try Google Cloud first if available
    if (process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_CREDENTIALS) {
      try {
        const response = await axios.post(
          `https://translation.googleapis.com/language/translate/v2/detect?key=${process.env.GOOGLE_API_KEY}`,
          { q: text }
        );
        
        return response.data.data.detections[0][0].language;
      } catch (error) {
        logger.warn('Language detection failed, falling back to default', { error: error.message });
      }
    }

    // Fallback to English
    return 'en';
  }

  /**
   * Store translation in database
   */
  async storeTranslation(translationData) {
    try {
      // This would typically store in MongoDB
      // For now, just log the translation
      logger.info('Translation completed', {
        provider: translationData.provider,
        sourceLanguage: translationData.sourceLanguage,
        targetLanguage: translationData.targetLanguage,
        confidence: translationData.confidence
      });
    } catch (error) {
      logger.error('Failed to store translation', { error: error.message });
      // Don't throw error as this is not critical
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'tr', name: 'Turkish' },
      { code: 'nl', name: 'Dutch' },
      { code: 'pl', name: 'Polish' },
      { code: 'sv', name: 'Swedish' }
    ];
  }

  /**
   * Hugging Face translation implementation
   */
  async huggingfaceTranslate(text, sourceLanguage, targetLanguage) {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Hugging Face API key not configured. Please set HUGGINGFACE_API_KEY');
    }
    
    try {
      // Map language codes to model-compatible format
      const langMap = {
        'en': 'en',
        'es': 'es', 
        'fr': 'fr',
        'de': 'de',
        'it': 'it',
        'pt': 'pt',
        'ru': 'ru',
        'ja': 'jap',
        'ko': 'kor',
        'zh': 'zh',
        'ar': 'ar',
        'hi': 'hi'
      };
      
      const srcLang = langMap[sourceLanguage] || sourceLanguage;
      const tgtLang = langMap[targetLanguage] || targetLanguage;
      
      // Try different model patterns
      const modelPatterns = [
        `Helsinki-NLP/opus-mt-${srcLang}-${tgtLang}`,
        `Helsinki-NLP/opus-mt-${sourceLanguage}-${targetLanguage}`,
        'facebook/mbart-large-50-many-to-many-mmt'  // Fallback multilingual model
      ];
      
      let lastError = null;
      
      for (const modelName of modelPatterns) {
        try {
          const response = await axios.post(
            `https://api-inference.huggingface.co/models/${modelName}`,
            { inputs: text },
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              timeout: 30000
            }
          );
          
          if (response.data) {
            let translatedText = '';
            
            // Handle different response formats
            if (Array.isArray(response.data) && response.data[0]) {
              if (response.data[0].translation_text) {
                translatedText = response.data[0].translation_text;
              } else if (response.data[0].generated_text) {
                translatedText = response.data[0].generated_text;
              } else if (typeof response.data[0] === 'string') {
                translatedText = response.data[0];
              }
            } else if (response.data.translation_text) {
              translatedText = response.data.translation_text;
            } else if (response.data.generated_text) {
              translatedText = response.data.generated_text;
            }
            
            if (translatedText) {
              return {
                sourceText: text,
                translatedText,
                sourceLanguage,
                targetLanguage,
                provider: 'huggingface',
                model: modelName,
                confidence: 0.85,
                timestamp: new Date()
              };
            }
          }
        } catch (error) {
          lastError = error;
          logger.debug(`Model ${modelName} failed, trying next`, { error: error.message });
        }
      }
      
      throw new Error(`Hugging Face translation failed: ${lastError?.message || 'No compatible model found'}`);
      
    } catch (error) {
      logger.error('Hugging Face translation failed', { error: error.message });
      throw new Error(`Hugging Face translation failed: ${error.message}`);
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders() {
    const providers = [];
    
    if (process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_CREDENTIALS) {
      providers.push({ id: 'google-cloud', name: 'Google Cloud Translation', premium: false });
    }
    
    if (process.env.GOOGLE_API_KEY) {
      providers.push({ id: 'google', name: 'Google Translate', premium: false });
    }
    
        if (process.env.OPENAI_API_KEY) {
      providers.push({ id: 'openai', name: 'OpenAI GPT', premium: true });
    }

    if (process.env.HUGGINGFACE_API_KEY) {
      providers.push({ id: 'huggingface', name: 'Hugging Face', premium: false });
    }

    // Mock provider is always available
    providers.push({ id: 'mock', name: 'Mock (Development)', premium: false });
    
    return providers;
  }
}

module.exports = new TranslationService();

