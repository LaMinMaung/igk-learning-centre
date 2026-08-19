/**
 * /health — Health Check Page
 * Available in ALL environments. Shows live system status.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../lib/config';
import StatusIndicator, { type Status } from '../components/ui/StatusIndicator';
import Badge from '../components/ui/Badge';

interface PbHealth { status?: string; code?: number }

interface Check {
  name:    string;
  status:  Status;
  detail:  string;
  latency: number | null;
}

export default function HealthCheck() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [lastChecked, setLastChecked] = useState<string>('—');

  const runChecks = async () => {
    const results: Check[] = [];

    // 1. PocketBase API
    const t0 = performance.now();
    try {
      const res  = await fetch(`${config.pocketbaseUrl}/api/health`);
      const body = await res.json() as PbHealth;
      const ms   = Math.round(performance.now() - t0);
      results.push({
        name:    'PocketBase API',
        status:  res.ok && body.code === 200 ? 'online' : 'degraded',
        detail:  res.ok ? `Responded in ${ms} ms` : `HTTP ${res.status}`,
        latency: ms,
      });
    } catch {
      results.push({ name: 'PocketBase API', status: 'offline', detail: 'Connection refused', latency: null });
    }

    // 2. Frontend bundle
    results.push({
      name:    'Frontend Bundle',
      status:  'online',
      detail:  'Loaded successfully',
      latency: Math.round(performance.now()),
    });

    // 3. Auth store
    results.push({
      name:    'Auth Store',
      status:  'online',
      detail:  import.meta.env.VITE_POCKETBASE_URL ? 'Configured' : 'Using default',
      latency: null,
    });

    setChecks(results);
    setLastChecked(new Date().toLocaleTimeString());
  };

  useEffect(() => { runChecks(); }, []);

  const overall: Status = checks.some(c => c.status === 'offline')
    ? 'offline'
    : checks.some(c => c.status === 'degraded') ? 'degraded' : 'online';

  const ENV_BADGE = {
    development: 'dev', staging: 'staging', production: 'prod',
  } as const;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-6 py-16 flex-1">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">System Health</h1>
              <StatusIndicator status={overall} />
            </div>
            <p className="text-sm text-gray-500">Last checked: {lastChecked}</p>
          </div>
          <Badge variant={ENV_BADGE[config.appEnv]}>{config.appEnv.toUpperCase()}</Badge>
        </div>

        {/* Checks */}
        <div className="space-y-3 mb-8">
          {checks.map(check => (
            <div key={check.name}
                 className="flex items-center justify-between p-4 rounded-xl
                            border border-gray-800 bg-gray-900">
              <div className="flex items-center gap-3">
                <StatusIndicator status={check.status} pulse={check.status === 'online'} />
                <div>
                  <p className="text-sm font-medium text-white">{check.name}</p>
                  <p className="text-xs text-gray-500">{check.detail}</p>
                </div>
              </div>
              {check.latency !== null && (
                <span className="text-xs text-gray-500 font-mono">{check.latency} ms</span>
              )}
            </div>
          ))}
        </div>

        {/* Build info */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-2 text-xs mb-8">
          <h3 className="text-gray-400 font-semibold mb-2">Build Info</h3>
          {[
            ['Version',   config.version],
            ['Env',       config.appEnv],
            ['Domain',    config.appDomain],
            ['Built',     config.buildTimestamp],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-4">
              <span className="text-gray-500 w-24">{k}</span>
              <span className="text-gray-300 font-mono">{v}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={runChecks}
            className="px-4 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-400
                       text-gray-900 font-semibold transition-colors"
          >
            Re-run checks
          </button>
          <Link to="/" className="px-4 py-2 text-sm rounded-lg border border-gray-700
                                   hover:border-gray-500 text-gray-400 hover:text-white transition-colors">
            ← Home
          </Link>
        </div>
      </div>
    </div>
  );
}
