/**
 * IGK Learning Centre — Google Analytics 4 helper
 *
 * Usage:
 *   import { trackPageView, trackEvent } from './lib/analytics';
 *
 *   trackPageView('/lms/login', 'LMS Login');
 *   trackEvent('sign_up', { method: 'email' });
 */

const GA_ID = 'G-XXXXXXXXXX'; // ← Replace with your real Measurement ID

/** Type-safe gtag wrapper — safe to call even if gtag hasn't loaded yet */
function gtag(...args: unknown[]) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

/**
 * Send a page_view event.
 * Called automatically by useAnalytics on every route change.
 */
export function trackPageView(path: string, title?: string) {
  gtag('event', 'page_view', {
    page_location: window.location.origin + path,
    page_path: path,
    page_title: title || document.title,
    send_to: GA_ID,
  });
  console.log(`[GA4] page_view → ${path}`);
}

/**
 * Send a custom event.
 * @example trackEvent('file_download', { file_name: 'brochure.pdf' });
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  gtag('event', eventName, { send_to: GA_ID, ...params });
  console.log(`[GA4] event → ${eventName}`, params);
}