/**
 * Environment variables type definition
 * All environment variables should be prefixed with VITE_ to be exposed to the client
 */
interface Env {
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
    VITE_API_URL?: string;
    VITE_APP_NAME?: string;
    VITE_APP_ENV?: 'development' | 'test' | 'production';
}
/**
 * Validates that all required environment variables are set
 * @throws Error if any required environment variable is missing
 */
export declare const validateEnv: () => void;
/**
 * Returns the current environment
 */
export declare const getEnv: () => {
    readonly VITE_SUPABASE_URL: any;
    readonly VITE_SUPABASE_ANON_KEY: any;
    readonly VITE_OPENAI_API_KEY: string;
    readonly VITE_OPENAI_MODEL: string;
    readonly VITE_OPENAI_EMBEDDING_MODEL: string;
    readonly VITE_OPENAI_TEMPERATURE: string;
    readonly VITE_OPENAI_MAX_TOKENS: string;
    readonly VITE_OPENAI_TIMEOUT: string;
    readonly VITE_OPENAI_MAX_RETRIES: string;
    readonly VITE_MATCHING_MAX_RESULTS: string;
    readonly VITE_MATCHING_SIMILARITY_THRESHOLD: string;
    readonly VITE_MATCHING_CACHE_ENABLED: string;
    readonly VITE_API_URL: any;
    readonly VITE_APP_NAME: any;
    readonly VITE_APP_ENV: Env["VITE_APP_ENV"];
};
/**
 * Returns true if the app is running in development mode
 */
export declare const isDevelopment: () => boolean;
/**
 * Returns true if the app is running in production mode
 */
export declare const isProduction: () => boolean;
/**
 * Returns true if the app is running in test mode
 */
export declare const isTest: () => boolean;
export {};
