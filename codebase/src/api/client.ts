/**
 * API Client — Base abstraction over PocketBase SDK
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps every PocketBase call with:
 *   • Centralised error normalisation (handleApiError)
 *   • Structured request/response logging
 *   • requestKey: null to prevent React Strict Mode autocancellation
 *
 * All domain-specific API modules (auth, courses, users…) go through apiCall().
 */

import pb from '../lib/pocketbase';
import { logger } from '../lib/logger';
import { handleApiError, type AppError } from '../lib/errorHandler';

export { pb };

// ─── Generic wrapper ─────────────────────────────────────────────────────────
export async function apiCall<T>(
  operation: () => Promise<T>,
  label: string,
): Promise<T> {
  logger.api('REQ', label);
  try {
    const result = await operation();
    logger.api('RES', label, result);
    return result;
  } catch (err) {
    throw handleApiError(err, label) as AppError;
  }
}

// ─── Re-export SDK helpers ────────────────────────────────────────────────────
export type { ListResult } from 'pocketbase';
