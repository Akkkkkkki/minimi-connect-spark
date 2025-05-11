/**
 * Environment variables type definition
 * All environment variables should be prefixed with VITE_ to be exposed to the client
 */
interface Env {
  // Required
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_OPENAI_API_KEY: string;
  VITE_OPENAI_MODEL: string;
  VITE_OPENAI_EMBEDDING_MODEL: string;
  VITE_OPENAI_TEMPERATURE: string;
  VITE_OPENAI_MAX_TOKENS: string;
  VITE_OPENAI_TIMEOUT: string;
  VITE_OPENAI_MAX_RETRIES: string;
  VITE_MATCHING_MAX_RESULTS: string;
  VITE_MATCHING_SIMILARITY_THRESHOLD: string;
  VITE_MATCHING_CACHE_ENABLED: string;
  
  // Optional
  VITE_API_URL?: string;
  VITE_APP_NAME?: string;
  VITE_APP_ENV?: 'development' | 'test' | 'production';
}

/**
 * Environment variables with type safety
 */
const env = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  VITE_OPENAI_MODEL: import.meta.env.VITE_OPENAI_MODEL,
  VITE_OPENAI_EMBEDDING_MODEL: import.meta.env.VITE_OPENAI_EMBEDDING_MODEL,
  VITE_OPENAI_TEMPERATURE: import.meta.env.VITE_OPENAI_TEMPERATURE,
  VITE_OPENAI_MAX_TOKENS: import.meta.env.VITE_OPENAI_MAX_TOKENS,
  VITE_OPENAI_TIMEOUT: import.meta.env.VITE_OPENAI_TIMEOUT,
  VITE_OPENAI_MAX_RETRIES: import.meta.env.VITE_OPENAI_MAX_RETRIES,
  VITE_MATCHING_MAX_RESULTS: import.meta.env.VITE_MATCHING_MAX_RESULTS,
  VITE_MATCHING_SIMILARITY_THRESHOLD: import.meta.env.VITE_MATCHING_SIMILARITY_THRESHOLD,
  VITE_MATCHING_CACHE_ENABLED: import.meta.env.VITE_MATCHING_CACHE_ENABLED,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'MINIMI',
  VITE_APP_ENV: (import.meta.env.VITE_APP_ENV || 'development') as Env['VITE_APP_ENV'],
} as const;

/**
 * Validates that all required environment variables are set
 * @throws Error if any required environment variable is missing
 */
export const validateEnv = () => {
  const requiredVars: (keyof Env)[] = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_OPENAI_API_KEY',
    'VITE_OPENAI_MODEL',
    'VITE_OPENAI_EMBEDDING_MODEL',
    'VITE_OPENAI_TEMPERATURE',
    'VITE_OPENAI_MAX_TOKENS',
    'VITE_OPENAI_TIMEOUT',
    'VITE_OPENAI_MAX_RETRIES',
    'VITE_MATCHING_MAX_RESULTS',
    'VITE_MATCHING_SIMILARITY_THRESHOLD',
    'VITE_MATCHING_CACHE_ENABLED',
  ];

  const missingVars = requiredVars.filter(
    (key) => !env[key] || env[key] === ''
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
};

/**
 * Returns the current environment
 */
export const getEnv = () => env;

/**
 * Returns true if the app is running in development mode
 */
export const isDevelopment = () => env.VITE_APP_ENV === 'development';

/**
 * Returns true if the app is running in production mode
 */
export const isProduction = () => env.VITE_APP_ENV === 'production';

/**
 * Returns true if the app is running in test mode
 */
export const isTest = () => env.VITE_APP_ENV === 'test'; 