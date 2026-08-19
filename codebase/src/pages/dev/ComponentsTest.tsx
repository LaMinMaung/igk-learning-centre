/**
 * /test/components — Component Library Test
 * Renders every reusable UI component with all variant combinations.
 */
import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import StatusIndicator from '../../components/ui/StatusIndicator';
import EnvironmentBadge from '../../components/EnvironmentBadge';

interface Section { title: string; children: React.ReactNode }
const Section = ({ title, children }: Section) => (
  <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
    <div className="px-5 py-3 border-b border-gray-800 bg-gray-900/80">
      <h2 className="text-sm font-bold text-white">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

interface Row { label: string; children: React.ReactNode }
const Row = ({ label, children }: Row) => (
  <div className="flex items-center gap-4 py-2 border-b border-gray-800/50 last:border-0">
    <span className="text-xs text-gray-500 w-32 shrink-0 font-mono">{label}</span>
    <div className="flex flex-wrap gap-2 items-center">{children}</div>
  </div>
);

export default function ComponentsTest() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎨</span>
          <h1 className="font-bold text-white">Component Library</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/dev"      className="text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg transition-colors">⚙ Dashboard</Link>
          <Link to="/sandbox"  className="text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg transition-colors">🧪 Sandbox</Link>
          <Link to="/test/api" className="text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg transition-colors">🔌 API</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Badge */}
        <Section title="Badge">
          <Row label="variant=success"><Badge variant="success">Published</Badge></Row>
          <Row label="variant=warning"><Badge variant="warning">Pending</Badge></Row>
          <Row label="variant=error"><Badge variant="error">Failed</Badge></Row>
          <Row label="variant=info"><Badge variant="info">In Review</Badge></Row>
          <Row label="variant=neutral"><Badge variant="neutral">Draft</Badge></Row>
          <Row label="variant=dev"><Badge variant="dev">DEVELOPMENT</Badge></Row>
          <Row label="variant=staging"><Badge variant="staging">STAGING</Badge></Row>
          <Row label="variant=prod"><Badge variant="prod">PRODUCTION</Badge></Row>
        </Section>

        {/* StatusIndicator */}
        <Section title="StatusIndicator">
          <Row label="online"><StatusIndicator status="online" label="Online" /></Row>
          <Row label="offline"><StatusIndicator status="offline" label="Offline" /></Row>
          <Row label="degraded"><StatusIndicator status="degraded" label="Degraded" /></Row>
          <Row label="unknown"><StatusIndicator status="unknown" label="Unknown" /></Row>
          <Row label="pulse=false"><StatusIndicator status="online" label="No pulse" pulse={false} /></Row>
        </Section>

        {/* Buttons */}
        <Section title="Buttons (Tailwind)">
          <Row label="primary">
            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-lg text-sm transition-colors">Primary</button>
          </Row>
          <Row label="secondary">
            <button className="px-4 py-2 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-lg text-sm transition-colors">Secondary</button>
          </Row>
          <Row label="danger">
            <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-sm transition-colors">Danger</button>
          </Row>
          <Row label="ghost">
            <button className="px-4 py-2 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg text-sm transition-colors">Ghost</button>
          </Row>
          <Row label="disabled">
            <button disabled className="px-4 py-2 bg-gray-700 text-gray-500 rounded-lg text-sm cursor-not-allowed">Disabled</button>
          </Row>
        </Section>

        {/* Form elements */}
        <Section title="Form Elements">
          <Row label="text input">
            <input className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500 w-64"
                   placeholder="Text input..." />
          </Row>
          <Row label="select">
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500">
              <option>Option A</option><option>Option B</option><option>Option C</option>
            </select>
          </Row>
          <Row label="textarea">
            <textarea rows={3} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500 w-64 resize-none"
                      placeholder="Textarea..." />
          </Row>
          <Row label="checkbox">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" className="accent-amber-500" defaultChecked /> Checked state
            </label>
          </Row>
        </Section>

        {/* EnvironmentBadge */}
        <Section title="EnvironmentBadge">
          <p className="text-xs text-gray-500 mb-3">
            The sticky bottom banner — rendered automatically in dev/staging, invisible in production.
          </p>
          <div className="relative h-16 rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
            <EnvironmentBadge />
          </div>
        </Section>

      </div>
    </div>
  );
}
