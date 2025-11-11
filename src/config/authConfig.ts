import type { Configuration, LogLevel } from '@azure/msal-browser'

// Get environment variables
const clientId = import.meta.env.VITE_DATAVERSE_CLIENT_ID || ''
const tenantId = import.meta.env.VITE_DATAVERSE_TENANT_ID || ''
const redirectUri = window.location.origin

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: redirectUri,
    postLogoutRedirectUri: redirectUri,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'localStorage', // Use localStorage for better persistence
    storeAuthStateInCookie: false, // Set to true for IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case 0: // Error
            console.error(message)
            return
          case 1: // Warning
            console.warn(message)
            return
          case 2: // Info
            console.info(message)
            return
          case 3: // Verbose
            console.debug(message)
            return
        }
      },
      logLevel: 1, // Warning level
    },
  },
}

// Add scopes for Microsoft Graph API and Dataverse
export const loginRequest = {
  scopes: ['User.Read'],
  prompt: 'select_account', // Allow user to select account each time
}

// Dataverse API scopes
export const dataverseScopes = {
  scopes: [`${import.meta.env.VITE_DATAVERSE_URL}/.default`],
}

// Microsoft Graph API scopes for user profile
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
}
