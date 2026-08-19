/**
 * /sandbox — Component Playground
 * Free-form environment for testing UI components in isolation.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import StatusIndicator from '../../components/ui/StatusIndicator';
import { config } from '../../lib/config';

const LOREM = 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.';

export default function SandboxPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🧪</span>
          <h1 className="font-bold text-white">Component Sandbox</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/dev"              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg transition-colors">⚙ Dashboard</Link>
          <Link to="/test/components"  className="text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg transition-colors">🎨 Components</Link>
          <Link to="/test/api"         className="text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg transition-colors">🔌 API</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* Badges */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Badges</h2>
          <div className="flex flex-wrap gap-2">
            {(['success','warning','error','info','neutral','dev','staging','prod'] as const).map(v => (
              <Badge key={v} variant={v}>{v}</Badge>
            ))}
          </div>
        </section>

        {/* Status Indicators */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Status Indicators</h2>
          <div className="flex flex-wrap gap-6">
            {(['online','offline','degraded','unknown'] as const).map(s => (
              <StatusIndicator key={s} status={s} label={s} />
            ))}
          </div>
        </section>

        {/* Interactive counter */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Interactive State</h2>
          <div className="flex items-center gap-4 p-6 rounded-xl border border-gray-800 bg-gray-900">
            <button onClick={() => setCount(c => c - 1)}
              className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 text-xl font-bold transition-colors">−</button>
            <span className="text-4xl font-black text-amber-400 w-16 text-center">{count}</span>
            <button onClick={() => setCount(c => c + 1)}
              className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 text-xl font-bold transition-colors">+</button>
            <button onClick={() => setCount(0)}
              className="ml-4 px-3 py-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors">Reset</button>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Typography</h2>
          <div className="space-y-3 p-6 rounded-xl border border-gray-800 bg-gray-900">
            {(['text-3xl font-black','text-2xl font-bold','text-xl font-semibold','text-base','text-sm text-gray-400','text-xs text-gray-500 font-mono'] as const).map((cls, i) => (
              <p key={i} className={cls}>{LOREM.slice(0, 60)}</p>
            ))}
          </div>
        </section>

        {/* Env info */}
        <section className="text-xs text-gray-600 border-t border-gray-800 pt-6">
          Rendering in <span className="text-amber-400">{config.appEnv}</span> ·{' '}
          PocketBase: <span className="font-mono text-gray-500">{config.pocketbaseUrl}</span>
        </section>
      </div>
    </div>
  );
}
