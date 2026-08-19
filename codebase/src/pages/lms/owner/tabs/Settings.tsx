import { useState, useEffect } from 'react';
import { Settings2, Save } from 'lucide-react';
import pb from '../../../../lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { inputCls, labelCls, saveBtnCls } from '../shared';

interface Toast { type: 'success' | 'error'; message: string }

const FIELDS: { key: string; label: string; type?: string; placeholder: string; hint?: string }[] = [
  { key: 'school_name',    label: 'School name',            placeholder: 'IGK Learning Centre' },
  { key: 'tagline',        label: 'Tagline',                placeholder: 'Short phrase under your school name' },
  { key: 'email',          label: 'Contact email',          type: 'email', placeholder: 'info@yourschool.com' },
  { key: 'phone',          label: 'Phone number',           placeholder: '+66 xx xxx xxxx' },
  { key: 'whatsapp',       label: 'WhatsApp number',        placeholder: '+66 xx xxx xxxx', hint: 'Include country code' },
  { key: 'line_id',        label: 'LINE ID',                placeholder: '@yourlineid' },
  { key: 'address',        label: 'School address',         placeholder: 'Full address of your school' },
  { key: 'working_hours',  label: 'Opening hours',          placeholder: 'Mon–Fri: 8:00 AM – 5:00 PM' },
  { key: 'facebook_url',   label: 'Facebook page link',     type: 'url', placeholder: 'https://facebook.com/yourpage' },
  { key: 'instagram_url',  label: 'Instagram profile link', type: 'url', placeholder: 'https://instagram.com/yourprofile' },
  { key: 'google_maps_url',label: 'Google Maps link',       type: 'url', placeholder: 'https://maps.google.com/…' },
];

export default function Settings({ onToast }: { onToast: (t: Toast) => void }) {
  const [record, setRecord] = useState<RecordModel | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pb.collection('site_settings').getFirstListItem('', { requestKey: null })
      .then(r => { setRecord(r); setForm(Object.fromEntries(FIELDS.map(f => [f.key, r[f.key] ?? '']))); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const save = async () => {
    if (!form.school_name?.trim()) return onToast({ type: 'error', message: 'School name is required.' });
    setSaving(true);
    try {
      if (record) {
        await pb.collection('site_settings').update(record.id, form);
      } else {
        const r = await pb.collection('site_settings').create(form);
        setRecord(r);
      }
      onToast({ type: 'success', message: 'Settings saved!' });
    } catch { onToast({ type: 'error', message: 'Could not save settings. Please try again.' }); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="py-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">School Settings</h2>
          <p className="text-sm text-gray-400 mt-0.5">Update your school's contact information and online links.</p>
        </div>
        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
          <Settings2 className="w-5 h-5 text-purple-400" />
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 space-y-5">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">School Information</h3>
        {FIELDS.slice(0, 4).map(field => (
          <div key={field.key}>
            <label className={labelCls}>{field.label}</label>
            <input type={field.type ?? 'text'} value={form[field.key] ?? ''} onChange={f(field.key)}
              className={inputCls} placeholder={field.placeholder} />
            {field.hint && <p className="text-xs text-gray-500 mt-1">{field.hint}</p>}
          </div>
        ))}
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 space-y-5">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Messaging & Location</h3>
        {FIELDS.slice(4, 8).map(field => (
          <div key={field.key}>
            <label className={labelCls}>{field.label}</label>
            {field.key === 'address'
              ? <textarea value={form[field.key] ?? ''} onChange={f(field.key)} className={inputCls} rows={2} placeholder={field.placeholder} />
              : <input type={field.type ?? 'text'} value={form[field.key] ?? ''} onChange={f(field.key)} className={inputCls} placeholder={field.placeholder} />
            }
            {field.hint && <p className="text-xs text-gray-500 mt-1">{field.hint}</p>}
          </div>
        ))}
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 space-y-5">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Social Media & Map</h3>
        {FIELDS.slice(8).map(field => (
          <div key={field.key}>
            <label className={labelCls}>{field.label}</label>
            <input type="url" value={form[field.key] ?? ''} onChange={f(field.key)} className={inputCls} placeholder={field.placeholder} />
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving} className={`${saveBtnCls} w-full justify-center py-3 text-base`}>
        <Save className="w-5 h-5" />{saving ? 'Saving…' : 'Save All Settings'}
      </button>
    </div>
  );
}
