/**
 * Logger — Environment-aware logging system
 * ─────────────────────────────────────────────────────────────────────────────
 * Log levels by environment (unless overridden by VITE_LOG_LEVEL):
 *   development → debug  (all output)
 *   staging     → info   (info, warn, error)
 *   production  → error  (errors only + remote reporting)
 *
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   logger.debug('Fetching courses', { page })
 *   logger.error('Payment failed', err, { userId })
 */

import { config, type LogLevel } from './config';

const LEVELS: Record<LogLevel, number> = {
  debug: 0, info: 1, warn: 2, error: 3, silent: 4,
};

const STYLE: Record<string, string> = {
  debug: 'color:#6b7280;font-weight:bold',
  info:  'color:#3b82f6;font-weight:bold',
  warn:  'color:#f59e0b;font-weight:bold',
  error: 'color:#ef4444;font-weight:bold',
};

const currentLevel = LEVELS[config.logLevel];
const passes = (level: LogLevel) => LEVELS[level] >= currentLevel;

function stamp() {
  return config.isNonProd ? `[${new Date().toISOString().slice(11, 23)}]` : '';
}

function remoteReport(msg: string, error?: unknown, context?: Record<string, unknown>) {
  // Pluggable: swap in Sentry, Datadog, LogRocket, etc.
  // Example: Sentry.captureException(error, { extra: { msg, ...context } })
  if (config.errorTracking) {
    // Placeholder — wire up your provider here
    console.error('[RemoteError]', msg, error, context);
  }
}

export const logger = {
  debug(msg: string, ...args: unknown[]) {
    if (passes('debug')) {
      console.debug(`%c[DEBUG]%c ${stamp()} ${msg}`, STYLE.debug, 'color:inherit', ...args);
    }
  },

  info(msg: string, ...args: unknown[]) {
    if (passes('info')) {
      console.info(`%c[INFO]%c ${stamp()} ${msg}`, STYLE.info, 'color:inherit', ...args);
    }
  },

  warn(msg: string, ...args: unknown[]) {
    if (passes('warn')) {
      console.warn(`%c[WARN]%c ${stamp()} ${msg}`, STYLE.warn, 'color:inherit', ...args);
    }
  },

  error(msg: string, error?: unknown, context?: Record<string, unknown>) {
    if (passes('error')) {
      console.error(`%c[ERROR]%c ${stamp()} ${msg}`, STYLE.error, 'color:inherit', error, context);
    }
    if (config.isProd) remoteReport(msg, error, context);
  },

  /** Verbose API logging — active only when FF verboseApi is on */
  api(direction: 'REQ' | 'RES', label: string, payload?: unknown) {
    if (passes('debug')) {
      const icon = direction === 'REQ' ? '→' : '←';
      console.debug(`%c[API ${icon}]%c ${stamp()} ${label}`, STYLE.debug, 'color:inherit', payload);
    }
  },
};
