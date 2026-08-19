/**
 * Application Configuration — Extended
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all environment-specific values.
 * Reads from the .env.[mode] file that Vite selects at build/dev time.
 *
 *   vite                        → loads .env.development
 *   vite build --mode staging   → loads .env.staging
 *   vite build                  → loads .env.production
 */

export type AppEnv    = 'development' | 'staging' | 'production';
export type LogLevel  = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface AppConfig {
  // ─── Identity ────────────────────────────────────────────────────────────
  appEnv:        AppEnv;
  appUrl:        string;
  appDomain:     string;
  appName:       string;
  appTagline:    string;
  version:       string;
  buildTimestamp:string;

  // ─── Backend ─────────────────────────────────────────────────────────────
  pocketbaseUrl: string;

  // ─── Observability ───────────────────────────────────────────────────────
  logLevel:      LogLevel;
  errorTracking: boolean;

  // ─── Convenience booleans ────────────────────────────────────────────────
  isDev:     boolean;
  isStaging: boolean;
  isProd:    boolean;
  isNonProd: boolean;
}

const env = (import.meta.env.VITE_APP_ENV ?? 'development') as AppEnv;

const defaultLogLevel: LogLevel =
  env === 'production' ? 'error'
  : env === 'staging'  ? 'info'
  : 'debug';

export const config: AppConfig = {
  appEnv:         env,
  appUrl:         import.meta.env.VITE_APP_URL          ?? 'http://localhost:5173',
  appDomain:      import.meta.env.VITE_APP_DOMAIN       ?? 'localhost',
  appName:        import.meta.env.VITE_APP_NAME         ?? 'IGK Learning Centre',
  appTagline:     import.meta.env.VITE_APP_TAGLINE      ?? 'Inspiring Global Knowledge',
  version:        import.meta.env.VITE_APP_VERSION      ?? '1.0.0',
  buildTimestamp: import.meta.env.VITE_BUILD_TIMESTAMP  ?? 'local',

  pocketbaseUrl:  import.meta.env.VITE_POCKETBASE_URL   ?? 'http://127.0.0.1:8090',

  logLevel:       (import.meta.env.VITE_LOG_LEVEL as LogLevel | undefined) ?? defaultLogLevel,
  errorTracking:  import.meta.env.VITE_ERROR_TRACKING   === 'true',

  isDev:     env === 'development',
  isStaging: env === 'staging',
  isProd:    env === 'production',
  isNonProd: env !== 'production',
};
