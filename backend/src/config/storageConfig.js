/**
 * Storage Configuration Service
 * Handles S3, MinIO, and Azure storage configurations
 */

class StorageConfig {
  constructor() {
    // S3/MinIO Configuration
    this.s3Endpoint = process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT || 'http://localhost:9000';
    this.s3AccessKey = process.env.S3_ACCESS_KEY || process.env.MINIO_ACCESS_KEY || 'minioadmin';
    this.s3SecretKey = process.env.S3_SECRET_KEY || process.env.MINIO_SECRET_KEY || 'minioadmin123';
    this.s3Bucket = process.env.S3_BUCKET || 'multimodal-files';
    this.s3Region = process.env.S3_REGION || 'us-east-1';
    this.s3ForcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true' || true;

    // Google Cloud Storage Configuration
    this.googleCloudProject = process.env.GOOGLE_CLOUD_PROJECT;
    this.googleCloudCredentials = process.env.GOOGLE_CLOUD_CREDENTIALS;
    this.googleCloudStorageBucket = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'vision-platform-files';
    this.googleCloudRegion = process.env.GOOGLE_CLOUD_REGION || 'us-central1';

    // Storage Provider Selection
    this.storageProvider = this.determineStorageProvider();
  }

  /**
   * Determine which storage provider to use
   */
  determineStorageProvider() {
    if (this.isGoogleCloudStorageConfigured()) {
      return 'gcp';
    } else if (this.isS3Configured()) {
      return 's3';
    } else {
      return 'local'; // Fallback to local file system
    }
  }

  /**
   * Check if S3/MinIO is configured
   */
  isS3Configured() {
    return !!(this.s3Endpoint && this.s3AccessKey && this.s3SecretKey);
  }

  /**
   * Check if Google Cloud Storage is configured
   */
  isGoogleCloudStorageConfigured() {
    return !!(this.googleCloudProject && this.googleCloudCredentials && this.googleCloudStorageBucket);
  }

  /**
   * Get S3/MinIO configuration
   */
  getS3Config() {
    if (!this.isS3Configured()) {
      return null;
    }
    return {
      endpoint: this.s3Endpoint,
      accessKey: this.s3AccessKey,
      secretKey: this.s3SecretKey,
      bucket: this.s3Bucket,
      region: this.s3Region,
      forcePathStyle: this.s3ForcePathStyle
    };
  }

  /**
   * Get Google Cloud Storage configuration
   */
  getGoogleCloudConfig() {
    if (!this.isGoogleCloudStorageConfigured()) {
      return null;
    }
    return {
      project: this.googleCloudProject,
      credentials: this.googleCloudCredentials,
      bucket: this.googleCloudStorageBucket,
      region: this.googleCloudRegion
    };
  }

  /**
   * Get current storage provider
   */
  getStorageProvider() {
    return this.storageProvider;
  }

  /**
   * Get storage configuration for the current provider
   */
  getCurrentStorageConfig() {
    switch (this.storageProvider) {
      case 'gcp':
        return this.getGoogleCloudConfig();
      case 's3':
        return this.getS3Config();
      default:
        return { type: 'local', path: './uploads' };
    }
  }

  /**
   * Get all available storage configurations
   */
  getAllStorageConfigs() {
    return {
      current: this.storageProvider,
      s3: this.getS3Config(),
      gcp: this.getGoogleCloudConfig(),
      local: { type: 'local', path: './uploads' }
    };
  }

  /**
   * Check if storage is properly configured
   */
  isStorageConfigured() {
    return this.storageProvider !== 'local' || this.isS3Configured() || this.isGoogleCloudStorageConfigured();
  }

  /**
   * Get configuration summary
   */
  getConfigSummary() {
    return {
      provider: this.storageProvider,
      configured: this.isStorageConfigured(),
      s3: this.isS3Configured(),
      gcp: this.isGoogleCloudStorageConfigured(),
      local: true // Local is always available as fallback
    };
  }
}

module.exports = new StorageConfig();
