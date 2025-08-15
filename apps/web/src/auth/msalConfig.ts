import { Configuration, PopupRequest } from '@azure/msal-browser'

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MS_CLIENT_ID || 'your-ms-client-id',
    authority: import.meta.env.VITE_MS_AUTHORITY || 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: string, containsPii: boolean) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case 0:
            console.error(message)
            return
          case 1:
            console.warn(message)
            return
          case 2:
            console.info(message)
            return
          case 3:
            console.debug(message)
            return
          default:
            console.log(message)
            return
        }
      },
      logLevel: import.meta.env.DEV ? 3 : 0, // 0 = Error, 1 = Warning, 2 = Info, 3 = Debug
    },
  },
}

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'email', 'profile', 'openid'],
}

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
}

// Environment variables for configuration
export const msalEnvVars = {
  clientId: import.meta.env.VITE_MS_CLIENT_ID,
  authority: import.meta.env.VITE_MS_AUTHORITY,
  redirectUri: import.meta.env.VITE_MS_REDIRECT_URI || window.location.origin,
}

// Helper function to check if MSAL is properly configured
export const isMsalConfigured = (): boolean => {
  return !!(msalEnvVars.clientId && msalEnvVars.clientId !== 'your-ms-client-id')
}

// Error messages for configuration issues
export const msalErrorMessages = {
  notConfigured: 'Microsoft authentication is not properly configured. Please contact support.',
  loginFailed: 'Microsoft login failed. Please try again or use email/password login.',
  tokenError: 'Failed to get authentication token. Please try logging in again.',
  networkError: 'Network error during authentication. Please check your connection.',
}
