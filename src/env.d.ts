/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly SUPABASE_SERVICE_ROLE_KEY: string
  readonly VITE_APP_URL: string
  readonly VITE_DASHBOARD_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
