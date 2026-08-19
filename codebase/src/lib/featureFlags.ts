/**
 * Feature Flags
 * ─────────────────────────────────────────────────────────────────────────────
 * Flags are driven by VITE_FF_* environment variables (set per env file).
 * In non-production, individual flags can be overridden at runtime via
 * localStorage — useful for QA / demos without a rebuild.
 *
 * Override via browser console (non-prod only):
 *   import { setFlagOverride } from '@/lib/featureFlags'
 *   setFlagOverride('newDashboard', true)   // persists across page reloads
 *   clearFlagOverrides()                    // resets all to env defaults
 *
 * Usage:
 *   import { featureFlags } from '@/lib/featureFlags'
 *   if (featureFlags.sandboxRoutes) { ... }
 */

import { config } from './config';

export interface FeatureFlags {
  /** Enables /dev, /sandbox, /test/components, /test/api routes */
  sandboxRoutes:    boolean;
  /** Next-gen dashboard UI (beta, A/B test) */
  newDashboard:     boolean;
  /** Beta student self-enrollment flow */
  betaEnrollment:   boolean;
  /** Live chat widget in main site */
  liveChat:         boolean;
  /** Log full API request/response bodies (staging/dev only) */
  verboseApi:       boolean;
  /** Maintenance mode banner on main site */
  maintenanceMode:  boolean;
}

// ─── Defaults from environment variables ────────────────────────────────────
const envDefaults: FeatureFlags = {
  sandboxRoutes:   import.meta.env.VITE_FF_SANDBOX_ROUTES   === 'true',
  newDashboard:    import.meta.env.VITE_FF_NEW_DASHBOARD     === 'true',
  betaEnrollment:  import.meta.env.VITE_FF_BETA_ENROLLMENT  === 'true',
  liveChat:        import.meta.env.VITE_FF_LIVE_CHAT         === 'true',
  verboseApi:      import.meta.env.VITE_FF_VERBOSE_API       === 'true',
  maintenanceMode: import.meta.env.VITE_FF_MAINTENANCE       === 'true',
};

// ─── Per-flag getters with localStorage override support ─────────────────────
function getFlag(key: keyof FeatureFlags): boolean {
  if (!config.isProd) {
    const stored = localStorage.getItem(`igk_ff_${key}`);
    if (stored !== null) return stored === 'true';
  }
  return envDefaults[key];
}

export const featureFlags: FeatureFlags = {
  get sandboxRoutes()   { return getFlag('sandboxRoutes'); },
  get newDashboard()    { return getFlag('newDashboard'); },
  get betaEnrollment()  { return getFlag('betaEnrollment'); },
  get liveChat()        { return getFlag('liveChat'); },
  get verboseApi()      { return getFlag('verboseApi'); },
  get maintenanceMode() { return getFlag('maintenanceMode'); },
};

// ─── Runtime override helpers (non-prod only) ────────────────────────────────
export function setFlagOverride(key: keyof FeatureFlags, value: boolean): void {
  if (config.isProd) { console.warn('[FF] Runtime overrides disabled in production.'); return; }
  localStorage.setItem(`igk_ff_${key}`, String(value));
  window.location.reload();
}

export function clearFlagOverrides(): void {
  if (config.isProd) return;
  (Object.keys(envDefaults) as Array<keyof FeatureFlags>).forEach(k =>
    localStorage.removeItem(`igk_ff_${k}`)
  );
  window.location.reload();
}

export function getFlagSnapshot(): Record<keyof FeatureFlags, { value: boolean; overridden: boolean }> {
  return (Object.keys(envDefaults) as Array<keyof FeatureFlags>).reduce((acc, key) => {
    const stored = !config.isProd ? localStorage.getItem(`igk_ff_${key}`) : null;
    acc[key] = { value: getFlag(key), overridden: stored !== null };
    return acc;
  }, {} as Record<keyof FeatureFlags, { value: boolean; overridden: boolean }>);
}
