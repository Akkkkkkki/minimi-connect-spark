/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_OPENAI_MODEL: string
  readonly VITE_OPENAI_EMBEDDING_MODEL: string
  readonly VITE_OPENAI_TEMPERATURE: string
  readonly VITE_OPENAI_MAX_TOKENS: string
  readonly VITE_OPENAI_TIMEOUT: string
  readonly VITE_OPENAI_MAX_RETRIES: string
  readonly VITE_MATCHING_MAX_RESULTS: string
  readonly VITE_MATCHING_SIMILARITY_THRESHOLD: string
  readonly VITE_MATCHING_CACHE_ENABLED: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
