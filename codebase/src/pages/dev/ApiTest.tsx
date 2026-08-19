/**
 * /test/api — Interactive PocketBase API Explorer
 * Test collection endpoints, inspect responses, verify auth.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { pb } from '../../api/client';
import { config } from '../../lib/config';
import Badge from '../../components/ui/Badge';

type Op = 'getList' | 'getOne' | 'health';

const COLLECTIONS = ['users', 'courses', 'lessons', 'enrollments', 'quizzes', 'quiz_attempts', 'programs'];

interface Result { ok: boolean; status: number | string; data: unknown; latency: number }

export default function ApiTest() {
  const [collection, setCollection] = useState('courses');
  const [operation, setOperation]   = useState<Op>('getList');
  const [recordId, setRecordId]     = useState('');
  const [result, setResult]         = useState<Result | null>(null);
  const [loading, setLoading]       = useState(false);

  const run = async () => {
    setLoading(true);
    setResult(null);
    const t0 = performance.now();
    try {
      let data: unknown;
      if (operation === 'health') {
        const res  = await fetch(`${config.pocketbaseUrl}/api/health`);
        data = await res.json();
        setResult({ ok: res.ok, status: res.status, data, latency: Math.round(performance.now() - t0) });
      } else if (operation === 'getList') {
        data = await pb.collection(collection).getList(1, 10, { requestKey: null });
        setResult({ ok: true, status: 200, data, latency: Math.round(performance.now() - t0) });
      } else if (operation === 'getOne') {
        if (!recordId.trim()) { setResult({ ok: false, status: 'N/A', data: 'Record ID required', latency: 0 }); setLoading(false); return; }
        data = await pb.collection(collection).getOne(recordId, { requestKey: null });
        setResult({ ok: true, status: 200, data, latency: Math.round(performance.now() - t0) });
      }
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      setResult({ ok: false, status: e.status ?? 500, data: { error: e.message, detail: err }, latency: Math.round(performance.now() - t0) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔌</span>
          <h1 className="font-bold text-white">API Explorer</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/dev"             className="text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg transition-colors">⚙ Dashboard</Link>
          <Link to="/sandbox"         className="text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg transition-colors">🧪 Sandbox</Link>
          <Link to="/test/components" className="text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg transition-colors">🎨 Components</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Auth state */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-800 bg-gray-900 text-sm">
          <Badge variant={pb.authStore.isValid ? 'success' : 'warning'}>
            {pb.authStore.isValid ? 'Authenticated' : 'Unauthenticated'}
          </Badge>
          {pb.authStore.record && (
            <span className="text-gray-400 font-mono text-xs">{String(pb.authStore.record.email)} · {String(pb.authStore.record.role)}</span>
          )}
          <span className="ml-auto text-xs text-gray-600">PB: {config.pocketbaseUrl}</span>
        </div>

        {/* Controls */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800">
            <h2 className="text-sm font-bold text-white">Request Builder</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Operation</label>
              <select value={operation} onChange={e => setOperation(e.target.value as Op)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                <option value="health">GET /api/health</option>
                <option value="getList">getList (paginated)</option>
                <option value="getOne">getOne (by ID)</option>
              </select>
            </div>
            {operation !== 'health' && (
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Collection</label>
                <select value={collection} onChange={e => setCollection(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
                  {COLLECTIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            )}
            {operation === 'getOne' && (
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Record ID</label>
                <input value={recordId} onChange={e => setRecordId(e.target.value)}
                  placeholder="e.g. abc123xyz..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500 font-mono" />
              </div>
            )}
          </div>
          <div className="px-5 pb-5">
            <button onClick={run} disabled={loading}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-700
                         text-gray-900 disabled:text-gray-500 font-semibold rounded-lg text-sm transition-colors">
              {loading ? 'Running…' : '▶ Run Request'}
            </button>
          </div>
        </div>

        {/* Response */}
        {result && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-3">
              <h2 className="text-sm font-bold text-white">Response</h2>
              <Badge variant={result.ok ? 'success' : 'error'}>HTTP {result.status}</Badge>
              <span className="text-xs text-gray-500 ml-auto">{result.latency} ms</span>
            </div>
            <pre className="p-5 text-xs text-green-400 font-mono overflow-auto max-h-96 bg-gray-950 leading-relaxed">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
