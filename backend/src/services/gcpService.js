/**
 * Google Cloud Platform (GCP) Service
 * Handles all GCP operations including storage, translation, vision, and more
 */

const { Storage } = require('@google-cloud/storage');
const { Translate } = require('@google-cloud/translate').v2;
const { Vision } = require('@google-cloud/vision');
const { Speech } = require('@google-cloud/speech');
const { TextToSpeech } = require('@google-cloud/text-to-speech');
const logger = require('../utils/logger');

class GCPService {
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT;
    this.credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;
    this.storageBucket = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'vision-platform-files';
    this.region = process.env.GOOGLE_CLOUD_REGION || 'us-central1';
    this.zone = process.env.GOOGLE_CLOUD_ZONE || 'us-central1-a';
    
    this.isConfigured = this.checkConfiguration();
    
    if (this.isConfigured) {
      this.initializeServices();
    }
  }

  /**
   * Check if GCP is properly configured
   */
  checkConfiguration() {
    if (!this.projectId || !this.credentials) {
      logger.warn('GCP not configured. Please set GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_CREDENTIALS');
      return false;
    }
    return true;
  }

  /**
   * Initialize GCP services
   */
  initializeServices() {
    try {
      // Initialize Storage
      this.storage = new Storage({
        projectId: this.projectId,
        keyFilename: this.credentials
      });

      // Initialize Translation
      this.translate = new Translate({
        projectId: this.projectId,
        keyFilename: this.credentials
      });

      // Initialize Vision
      this.vision = new Vision({
        projectId: this.projectId,
        keyFilename: this.credentials
      });

      // Initialize Speech
      this.speech = new Speech({
        projectId: this.projectId,
        keyFilename: this.credentials
      });

      // Initialize Text-to-Speech
      this.textToSpeech = new TextToSpeech({
        projectId: this.projectId,
        keyFilename: this.credentials
      });

      logger.info('GCP services initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize GCP services', { error: error.message });
      this.isConfigured = false;
    }
  }

  /**
   * Upload file to Google Cloud Storage
   */
  async uploadFile(fileBuffer, fileName, contentType = 'application/octet-stream') {
    if (!this.isConfigured) {
      throw new Error('GCP not configured');
    }

    try {
      const bucket = this.storage.bucket(this.storageBucket);
      const file = bucket.file(fileName);
      
      await file.save(fileBuffer, {
        metadata: {
          contentType: contentType
        }
      });

      const publicUrl = `https://storage.googleapis.com/${this.storageBucket}/${fileName}`;
      
      logger.info('File uploaded to GCP Storage', { fileName, bucket: this.storageBucket });
      
      return {
        success: true,
        fileName: fileName,
        bucket: this.storageBucket,
        publicUrl: publicUrl,
        size: fileBuffer.length
      };
    } catch (error) {
      logger.error('Failed to upload file to GCP Storage', { error: error.message, fileName });
      throw new Error(`GCP Storage upload failed: ${error.message}`);
    }
  }

  /**
   * Download file from Google Cloud Storage
   */
  async downloadFile(fileName) {
    if (!this.isConfigured) {
      throw new Error('GCP not configured');
    }

    try {
      const bucket = this.storage.bucket(this.storageBucket);
      const file = bucket.file(fileName);
      
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('File not found in GCP Storage');
      }

      const [buffer] = await file.download();
      
      logger.info('File downloaded from GCP Storage', { fileName });
      
      return {
        success: true,
        fileName: fileName,
        buffer: buffer,
        size: buffer.length
      };
    } catch (error) {
      logger.error('Failed to download file from GCP Storage', { error: error.message, fileName });
      throw new Error(`GCP Storage download failed: ${error.message}`);
    }
  }

  /**
   * Delete file from Google Cloud Storage
   */
  async deleteFile(fileName) {
    if (!this.isConfigured) {
      throw new Error('GCP not configured');
    }

    try {
      const bucket = this.storage.bucket(this.storageBucket);
      const file = bucket.file(fileName);
      
      await file.delete();
      
      logger.info('File deleted from GCP Storage', { fileName });
      
      return {
        success: true,
        fileName: fileName,
        message: 'File deleted successfully'
      };
    } catch (error) {
      logger.error('Failed to delete file from GCP Storage', { error: error.message, fileName });
      throw new Error(`GCP Storage delete failed: ${error.message}`);
    }
  }

  /**
   * Translate text using Google Cloud Translation
   */
  async translateText(text, targetLanguage, sourceLanguage = 'auto') {
    if (!this.isConfigured) {
      throw new Error('GCP not configured');
    }

    try {
      const [translation] = await this.translate.translate(text, {
        from: sourceLanguage,
        to: targetLanguage
      });

      logger.info('Text translated using GCP Translation', { 
        sourceLanguage, 
        targetLanguage, 
        textLength: text.length 
      });

      return {
        success: true,
        originalText: text,
        translatedText: translation,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        provider: 'google-cloud'
      };
    } catch (error) {
      logger.error('GCP Translation failed', { error: error.message });
      throw new Error(`GCP Translation failed: ${error.message}`);
    }
  }

  /**
   * Analyze image using Google Cloud Vision
   */
  async analyzeImage(imageBuffer) {
    if (!this.isConfigured) {
      throw new Error('GCP not configured');
    }

    try {
      const request = {
        image: {
          content: imageBuffer.toString('base64')
        },
        features: [
          { type: 'LABEL_DETECTION' },
          { type: 'TEXT_DETECTION' },
          { type: 'FACE_DETECTION' },
          { type: 'OBJECT_LOCALIZATION' }
        ]
      };

      const [result] = await this.vision.annotateImage(request);
      
      logger.info('Image analyzed using GCP Vision', { 
        features: request.features.map(f => f.type) 
      });

      return {
        success: true,
        labels: result.labelAnnotations || [],
        text: result.textAnnotations || [],
        faces: result.faceAnnotations || [],
        objects: result.localizedObjectAnnotations || [],
        provider: 'google-cloud'
      };
    } catch (error) {
      logger.error('GCP Vision analysis failed', { error: error.message });
      throw new Error(`GCP Vision analysis failed: ${error.message}`);
    }
  }

  /**
   * Convert speech to text using Google Cloud Speech
   */
  async speechToText(audioBuffer, languageCode = 'en-US') {
    if (!this.isConfigured) {
      throw new Error('GCP not configured');
    }

    try {
      const request = {
        audio: {
          content: audioBuffer.toString('base64')
        },
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: languageCode
        }
      };

      const [response] = await this.speech.recognize(request);
      
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

      logger.info('Speech converted to text using GCP Speech', { languageCode });

      return {
        success: true,
        transcription: transcription,
        languageCode: languageCode,
        confidence: response.results[0]?.alternatives[0]?.confidence || 0,
        provider: 'google-cloud'
      };
    } catch (error) {
      logger.error('GCP Speech-to-Text failed', { error: error.message });
      throw new Error(`GCP Speech-to-Text failed: ${error.message}`);
    }
  }

  /**
   * Convert text to speech using Google Cloud Text-to-Speech
   */
  async textToSpeech(text, voiceName = 'en-US-Standard-A', languageCode = 'en-US') {
    if (!this.isConfigured) {
      throw new Error('GCP not configured');
    }

    try {
      const request = {
        input: { text: text },
        voice: {
          languageCode: languageCode,
          name: voiceName
        },
        audioConfig: {
          audioEncoding: 'MP3'
        }
      };

      const [response] = await this.textToSpeech.synthesizeSpeech(request);
      
      logger.info('Text converted to speech using GCP Text-to-Speech', { 
        languageCode, 
        voiceName 
      });

      return {
        success: true,
        audioContent: response.audioContent,
        languageCode: languageCode,
        voiceName: voiceName,
        provider: 'google-cloud'
      };
    } catch (error) {
      logger.error('GCP Text-to-Speech failed', { error: error.message });
      throw new Error(`GCP Text-to-Speech failed: ${error.message}`);
    }
  }

  /**
   * Get GCP service status
   */
  getServiceStatus() {
    return {
      configured: this.isConfigured,
      projectId: this.projectId,
      storageBucket: this.storageBucket,
      region: this.region,
      zone: this.zone,
      services: {
        storage: !!this.storage,
        translation: !!this.translate,
        vision: !!this.vision,
        speech: !!this.speech,
        textToSpeech: !!this.textToSpeech
      }
    };
  }

  /**
   * Get available GCP services
   */
  getAvailableServices() {
    return [
      { name: 'Cloud Storage', available: !!this.storage, description: 'File storage and management' },
      { name: 'Cloud Translation', available: !!this.translate, description: 'Text translation' },
      { name: 'Cloud Vision', available: !!this.vision, description: 'Image analysis' },
      { name: 'Cloud Speech', available: !!this.speech, description: 'Speech-to-text conversion' },
      { name: 'Cloud Text-to-Speech', available: !!this.textToSpeech, description: 'Text-to-speech conversion' }
    ];
  }
}

module.exports = new GCPService();

