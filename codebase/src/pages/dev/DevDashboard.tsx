/**
 * /dev — Developer Dashboard
 * Shows environment config, feature flags with live toggles,
 * PocketBase connectivity, build info, and links to all sandbox tools.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../../lib/config';
import { featureFlags, getFlagSnapshot, setFlagOverride, clearFlagOverrides, type FeatureFlags } from '../../lib/featureFlags';
import StatusIndicator, { type Status } from '../../components/ui/StatusIndicator';
import Badge from '../../components/ui/Badge';

const ENV_BADGE = {
  development: { label: 'DEVELOPMENT', variant: 'dev'     } as const,
  staging:     { label: 'STAGING',     variant: 'staging' } as const,
  production:  { label: 'PRODUCTION',  variant: 'prod'    } as const,
};

const SANDBOX_LINKS = [
  { path: '/sandbox',          label: 'Sandbox Playground', icon: '🧪', desc: 'Free-form component playground' },
  { path: '/test/components',  label: 'Component Tests',    icon: '🎨', desc: 'All UI components in isolation' },
  { path: '/test/api',         label: 'API Explorer',       icon: '🔌', desc: 'Interactive PocketBase tester' },
  { path: '/health',           label: 'Health Check',       icon: '💚', desc: 'System status & connectivity' },
];

export default function DevDashboard() {
  const [pbStatus, setPbStatus] = useState<Status>('unknown');
  const [pbLatency, setPbLatency] = useState<number | null>(null);
  const [flagSnapshot, setFlagSnapshot] = useState(getFlagSnapshot());

  // PocketBase connectivity ping
  useEffect(() => {
    const ping = async () => {
      const t0 = performance.now();
      try {
        const res = await fetch(`${config.pocketbaseUrl}/api/health`);
        const ms = Math.round(performance.now() - t0);
        setPbLatency(ms);
        setPbStatus(res.ok ? 'online' : 'degraded');
      } catch {
        setPbStatus('offline');
        setPbLatency(null);
      }
    };
    ping();
    const id = setInterval(ping, 10_000);
    return () => clearInterval(id);
  }, []);

  const badge = ENV_BADGE[config.appEnv];

  const handleToggleFlag = (key: keyof FeatureFlags, current: boolean) => {
    setFlagOverride(key, !current);
  };

  const handleClearOverrides = () => {
    setFlagSnapshot(getFlagSnapshot());
    clearFlagOverrides();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-mono">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/80 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h1 className="text-lg font-bold text-white">IGK Developer Dashboard</h1>
              <p className="text-xs text-gray-500">Non-production tool — not visible in production builds</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={badge.variant}>{badge.label}</Badge>
            <Badge variant="neutral">v{config.version}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Sandbox Links */}
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Sandbox Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SANDBOX_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="p-4 rounded-xl border border-gray-800 bg-gray-900 hover:border-amber-500/50
                           hover:bg-gray-800 transition-all group"
              >
                <div className="text-2xl mb-2">{link.icon}</div>
                <div className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                  {link.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{link.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Environment Config */}
          <section className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Environment Config</h2>
              <Badge variant={badge.variant}>{config.appEnv}</Badge>
            </div>
            <div className="p-5 space-y-2 text-xs">
              {[
                ['VITE_APP_ENV',          config.appEnv],
                ['VITE_APP_URL',          config.appUrl],
                ['VITE_APP_DOMAIN',       config.appDomain],
                ['VITE_POCKETBASE_URL',   config.pocketbaseUrl],
                ['VITE_LOG_LEVEL',        config.logLevel],
                ['VITE_ERROR_TRACKING',   String(config.errorTracking)],
                ['VITE_APP_VERSION',      config.version],
                ['VITE_BUILD_TIMESTAMP',  config.buildTimestamp],
              ].map(([key, val]) => (
                <div key={key} className="flex gap-3">
                  <span className="text-gray-500 w-52 shrink-0">{key}</span>
                  <span className="text-amber-300 break-all">{val}</span>
                </div>
              ))}
            </div>
          </section>

          {/* PocketBase Status */}
          <section className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">PocketBase Status</h2>
              <StatusIndicator status={pbStatus} label={pbStatus.toUpperCase()} />
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Endpoint</span>
                <span className="text-blue-400 font-mono">{config.pocketbaseUrl}/api/health</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Latency</span>
                <span className={pbLatency !== null ? 'text-emerald-400' : 'text-gray-600'}>
                  {pbLatency !== null ? `${pbLatency} ms` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Poll interval</span>
                <span className="text-gray-400">10 s</span>
              </div>
              <div className="pt-2 border-t border-gray-800 text-xs text-gray-500">
                Auto-refreshes every 10 seconds
              </div>
            </div>
          </section>
        </div>

        {/* Feature Flags */}
        <section className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Feature Flags</h2>
            <button
              onClick={handleClearOverrides}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1
                         border border-gray-700 hover:border-red-500/40 rounded"
            >
              Clear overrides
            </button>
          </div>
          <div className="divide-y divide-gray-800">
            {(Object.keys(flagSnapshot) as Array<keyof FeatureFlags>).map(key => {
              const { value, overridden } = flagSnapshot[key];
              return (
                <div key={key} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-200 font-mono">{key}</span>
                    {overridden && (
                      <Badge variant="warning" className="ml-2">overridden</Badge>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleFlag(key, value)}
                    className={`
                      relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                      ${value ? 'bg-amber-500' : 'bg-gray-700'}
                    `}
                  >
                    <span className={`
                      inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform
                      ${value ? 'translate-x-4' : 'translate-x-1'}
                    `} />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 bg-gray-950/50 text-xs text-gray-600">
            Overrides saved to localStorage — resets on clear. Never available in production.
          </div>
        </section>

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          <Link to="/" className="text-xs text-gray-500 hover:text-white transition-colors">← Back to Site</Link>
          <Link to="/lms/login" className="text-xs text-gray-500 hover:text-white transition-colors">→ LMS Login</Link>
        </div>

      </div>
    </div>
  );
}
