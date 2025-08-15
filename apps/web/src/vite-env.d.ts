/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MS_CLIENT_ID: string
  readonly VITE_MS_AUTHORITY: string
  readonly VITE_MS_REDIRECT_URI: string
  readonly VITE_API_URL: string
  readonly VITE_AI_URL: string
  readonly VITE_ENABLE_MICROSOFT_AUTH: string
  readonly VITE_ENABLE_GOOGLE_AUTH: string
  readonly VITE_ENABLE_GITHUB_AUTH: string
  readonly VITE_DEBUG: string
  readonly VITE_LOG_LEVEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
