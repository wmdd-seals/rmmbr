interface ImportMeta {
    env: ImportMetaEnv
}

interface ImportMetaEnv {
    VITE_PUBLIC_SUPABASE_URL: string
    VITE_APP_URL_PREFIX: string | null
    VITE_PUBLIC_SUPABASE_ANON_KEY: string
    VITE_PUBLIC_GOOGLE_MAP_API_KEY: string
}
