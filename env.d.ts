/// <reference types="vite/client" />
/// <reference types="lucide-vue-next" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_MICROSOFT_REDIRECT_URI?: string
  readonly VITE_APPLE_CLIENT_ID?: string
  readonly VITE_APPLE_REDIRECT_URI?: string
  readonly VITE_APP_ENV?: 'local' | 'staging' | 'production'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
