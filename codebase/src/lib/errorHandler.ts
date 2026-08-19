/**
 * Centralized Error Handler
 * ─────────────────────────────────────────────────────────────────────────────
 * Normalizes PocketBase errors, network errors, and unknown throws into a
 * typed AppError that the UI layer can handle consistently.
 *
 * Usage:
 *   import { handleApiError, getUserMessage } from '@/lib/errorHandler'
 *   try { ... } catch (e) { throw handleApiError(e, 'createCourse') }
 */

import { logger } from './logger';

// ─── Typed error class ───────────────────────────────────────────────────────
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    // Preserve prototype chain in transpiled ES5
    Object.setPrototypeOf(this, AppError.prototype);
  }

  get isAuthError()      { return this.statusCode === 401 || this.statusCode === 403; }
  get isNotFoundError()  { return this.statusCode === 404; }
  get isValidationError(){ return this.statusCode === 400; }
  get isRateLimited()    { return this.statusCode === 429; }
  get isServerError()    { return (this.statusCode ?? 0) >= 500; }
}

// ─── PocketBase error shape ──────────────────────────────────────────────────
interface PBError {
  status:  number;
  message: string;
  data?:   unknown;
  isAbort?: boolean;
}

function isPBError(e: unknown): e is PBError {
  return typeof e === 'object' && e !== null && 'status' in e && 'message' in e;
}

// ─── Main normalizer ─────────────────────────────────────────────────────────
export function handleApiError(error: unknown, context?: string): AppError {
  const tag = context ? ` [${context}]` : '';

  // Already normalized
  if (error instanceof AppError) return error;

  // Cancelled request — not a real error
  if (isPBError(error) && error.isAbort) {
    return new AppError('Request cancelled', 'ABORTED', 0);
  }

  // PocketBase ClientResponseError
  if (isPBError(error)) {
    logger.error(`API Error${tag}`, error, { status: error.status });
    return new AppError(
      error.message || `Request failed (${error.status})`,
      `HTTP_${error.status}`,
      error.status,
      { pbData: error.data },
    );
  }

  // Standard Error
  if (error instanceof Error) {
    logger.error(`Unhandled Error${tag}`, error);
    return new AppError(error.message, 'JS_ERROR', undefined, { name: error.name });
  }

  // Unknown throw
  logger.error(`Unknown Error${tag}`, error);
  return new AppError('An unexpected error occurred', 'UNKNOWN');
}

// ─── UI-friendly messages ────────────────────────────────────────────────────
export function getUserMessage(error: AppError): string {
  if (error.code === 'ABORTED') return '';
  switch (error.statusCode) {
    case 400: return 'Please check your input and try again.';
    case 401: return 'Please log in to continue.';
    case 403: return "You don't have permission to do that.";
    case 404: return 'The requested resource was not found.';
    case 429: return 'Too many requests — please wait a moment.';
    case 500:
    case 502:
    case 503: return 'Server error. Our team has been notified.';
    default:  return error.message || 'Something went wrong. Please try again.';
  }
}

// ─── Validation helper (input sanitisation) ──────────────────────────────────
export function validateRequired(
  fields: Record<string, unknown>,
  required: string[],
): string | null {
  for (const field of required) {
    const val = fields[field];
    if (val === undefined || val === null || val === '') {
      return `"${field}" is required.`;
    }
  }
  return null;
}
