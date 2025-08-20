/**
 * Cloud Services Configuration
 * Handles Azure, GCP, and other cloud service configurations
 */

class CloudConfig {
  constructor() {
    // Google Cloud Platform (GCP) Configuration
    this.googleCloudProject = process.env.GOOGLE_CLOUD_PROJECT;
    this.googleCloudCredentials = process.env.GOOGLE_CLOUD_CREDENTIALS;
    this.googleCloudStorageBucket = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'vision-platform-files';
    this.googleCloudRegion = process.env.GOOGLE_CLOUD_REGION || 'us-central1';
    this.googleCloudZone = process.env.GOOGLE_CLOUD_ZONE || 'us-central1-a';
    this.googleApiKey = process.env.GOOGLE_API_KEY;

    // Push Notifications
    this.fcmServerKey = process.env.FCM_SERVER_KEY;
    this.apnKeyId = process.env.APN_KEY_ID;
    this.apnTeamId = process.env.APN_TEAM_ID;
    this.apnPrivateKey = process.env.APN_PRIVATE_KEY;
  }

  /**
   * Check if Google Cloud Platform is configured
   */
  isGoogleCloudConfigured() {
    return !!(this.googleCloudProject && this.googleCloudCredentials);
  }

  /**
   * Check if Google Cloud Storage is configured
   */
  isGoogleCloudStorageConfigured() {
    return !!(this.googleCloudProject && this.googleCloudCredentials && this.googleCloudStorageBucket);
  }

  /**
   * Check if Google API is configured
   */
  isGoogleApiConfigured() {
    return !!this.googleApiKey;
  }

  /**
   * Check if FCM is configured
   */
  isFCMConfigured() {
    return !!this.fcmServerKey;
  }

  /**
   * Check if APN is configured
   */
  isAPNConfigured() {
    return !!(this.apnKeyId && this.apnTeamId && this.apnPrivateKey);
  }

  /**
   * Get Google Cloud Platform configuration
   */
  getGoogleCloudConfig() {
    if (!this.isGoogleCloudConfigured()) {
      return null;
    }
    return {
      project: this.googleCloudProject,
      credentials: this.googleCloudCredentials,
      region: this.googleCloudRegion,
      zone: this.googleCloudZone
    };
  }

  /**
   * Get Google Cloud Storage configuration
   */
  getGoogleCloudStorageConfig() {
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
   * Get push notification configuration
   */
  getPushNotificationConfig() {
    return {
      fcm: this.isFCMConfigured() ? { serverKey: this.fcmServerKey } : null,
      apn: this.isAPNConfigured() ? {
        keyId: this.apnKeyId,
        teamId: this.apnTeamId,
        privateKey: this.apnPrivateKey
      } : null
    };
  }

  /**
   * Get configuration summary
   */
  getConfigSummary() {
    return {
      google: {
        cloud: this.isGoogleCloudConfigured(),
        storage: this.isGoogleCloudStorageConfigured(),
        api: this.isGoogleApiConfigured(),
        region: this.googleCloudRegion,
        zone: this.googleCloudZone
      },
      pushNotifications: {
        fcm: this.isFCMConfigured(),
        apn: this.isAPNConfigured()
      }
    };
  }
}

module.exports = new CloudConfig();
