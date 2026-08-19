/**
 * EnvironmentBadge
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a sticky banner in DEVELOPMENT and STAGING environments.
 * Renders NOTHING in production — zero DOM nodes, zero overhead.
 */
import { config } from '../lib/config';

const BADGE = {
  development: {
    label: '⚙ DEVELOPMENT',
    bg: 'bg-amber-500',
    text: 'text-gray-900',
    detail: `localhost:8090`,
  },
  staging: {
    label: '🧪 STAGING / TESTING',
    bg: 'bg-blue-600',
    text: 'text-white',
    detail: `tst.app.com`,
  },
} as const;

const EnvironmentBadge = () => {
  if (config.isProd) return null;

  const badge = BADGE[config.appEnv as keyof typeof BADGE];
  if (!badge) return null;

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-[9999]
        ${badge.bg} ${badge.text}
        flex items-center justify-between
        px-4 py-1.5 text-xs font-bold tracking-wide
        shadow-[0_-2px_8px_rgba(0,0,0,0.3)]
        select-none pointer-events-none
      `}
      role="status"
      aria-label={`Environment: ${config.appEnv}`}
    >
      <span>{badge.label}</span>
      <span className="opacity-75 font-mono">
        PocketBase → {config.pocketbaseUrl}
      </span>
      <span className="opacity-75">{badge.detail}</span>
    </div>
  );
};

export default EnvironmentBadge;
