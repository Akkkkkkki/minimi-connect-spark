/**
 * Environment variables type definition
 * All environment variables should be prefixed with VITE_ to be exposed to the client
 */
interface Env {
  // Required
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  
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