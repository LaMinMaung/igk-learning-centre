import { useState, useEffect } from 'react';
import { Type, Pencil, Save, X } from 'lucide-react';
import pb from '../../../../lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { EmptyState, inputCls, labelCls, saveBtnCls, cancelBtnCls } from '../shared';

interface Toast { type: 'success' | 'error'; message: string }

const LABELS: Record<string, { label: string; group: string }> = {
  hero_subtitle:               { label: 'Top tagline (above main title)',   group: 'Homepage' },
  hero_title:                  { label: 'Main heading',                     group: 'Homepage' },
  hero_description:            { label: 'Introduction paragraph',           group: 'Homepage' },
  programs_heading:            { label: 'Section title',                    group: 'Programs Section' },
  programs_subheading:         { label: 'Section subtitle',                 group: 'Programs Section' },
  extracurriculars_heading:    { label: 'Section title',                    group: 'Extracurriculars' },
  extracurriculars_description:{ label: 'Description',                      group: 'Extracurriculars' },
  about_heading:               { label: 'Section title',                    group: 'About Us' },
  about_description:           { label: 'Paragraph',                        group: 'About Us' },
  contact_heading:             { label: 'Section title',                    group: 'Contact' },
  contact_subheading:          { label: 'Subtitle',                         group: 'Contact' },
  footer_tagline:              { label: 'Footer tagline',                   group: 'Footer' },
};

const strip = (html: string) => html.replace(/<[^>]*>/g, '').trim();

export default function TextContent({ onToast }: { onToast: (t: Toast) => void }) {
  const [records, setRecords] = useState<RecordModel[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    pb.collection('site_content').getFullList({ sort: 'section,key', requestKey: null })
      .then(setRecords).catch(() => {});
  }, []);

  const startEdit = (r: RecordModel) => { setEditing(r.id); setDraft(strip(r.value ?? '')); };

  const save = async (r: RecordModel) => {
    setSaving(true);
    try {
      const updated = await pb.collection('site_content').update(r.id, { value: `<p>${draft}</p>` });
      setRecords(prev => prev.map(x => x.id === r.id ? updated : x));
      setEditing(null);
      onToast({ type: 'success', message: 'Text updated!' });
    } catch { onToast({ type: 'error', message: 'Could not save. Please try again.' }); }
    finally { setSaving(false); }
  };

  const groups: Record<string, RecordModel[]> = {};
  for (const r of records) {
    const g = LABELS[r.key]?.group ?? r.section ?? 'Other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(r);
  }

  if (!records.length) return <EmptyState icon={Type} message="No text content found." />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">Website Text</h2>
        <p className="text-sm text-gray-400 mt-0.5">Click the pencil icon to edit any text on your website. Always press Save when done.</p>
      </div>

      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">{group}</h3>
          <div className="space-y-3">
            {items.map(r => {
              const label = LABELS[r.key]?.label ?? r.key;
              const isEditing = editing === r.id;
              return (
                <div key={r.id} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={labelCls}>{label}</p>
                      {isEditing
                        ? <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={3}
                            className={inputCls + ' resize-y'} autoFocus />
                        : <p className="text-sm text-gray-200 leading-relaxed">{strip(r.value ?? '')}</p>}
                    </div>
                    {!isEditing && (
                      <button onClick={() => startEdit(r)}
                        className="shrink-0 p-2 text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                      <button onClick={() => save(r)} disabled={saving} className={saveBtnCls}>
                        <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save'}
                      </button>
                      <button onClick={() => setEditing(null)} className={cancelBtnCls}>
                        <X className="w-4 h-4" />Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
