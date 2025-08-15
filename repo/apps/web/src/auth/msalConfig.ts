import { Configuration, PopupRequest } from '@azure/msal-browser';

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MS_CLIENT_ID || 'your-microsoft-client-id',
    authority: import.meta.env.VITE_MS_AUTHORITY || 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 'Error':
            console.error(message);
            return;
          case 'Info':
            console.info(message);
            return;
          case 'Verbose':
            console.debug(message);
            return;
          case 'Warning':
            console.warn(message);
            return;
        }
      },
    },
  },
};

// Add scopes for API access
export const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
  prompt: 'select_account',
};

// Silent request for token refresh
export const silentRequest = {
  scopes: ['User.Read'],
  account: null as any, // Will be set dynamically
};

// Graph API endpoint
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};