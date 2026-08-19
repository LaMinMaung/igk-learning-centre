import { useState, useEffect } from 'react';
import { BookOpen, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import pb from '../../../../lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { Modal, ConfirmDialog, EmptyState, SectionHeader, inputCls, selectCls, labelCls, saveBtnCls, cancelBtnCls, addBtnCls } from '../shared';

interface Toast { type: 'success' | 'error'; message: string }

const ICONS = ['BookOpen','GraduationCap','Award','Calculator','Languages','Globe'];
const ICON_LABELS: Record<string, string> = { BookOpen:'📖 Book', GraduationCap:'🎓 Graduation Cap', Award:'🏆 Award', Calculator:'🔢 Calculator', Languages:'🗣 Languages', Globe:'🌐 Globe' };

const strip = (h: string) => h.replace(/<[^>]*>/g, '').trim();
const EMPTY = { title: '', description: '', duration: '', level: '', icon: 'BookOpen', route: '', status: 'published', order: '', features: '' };

export default function Programs({ onToast }: { onToast: (t: Toast) => void }) {
  const [records, setRecords] = useState<RecordModel[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<RecordModel | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () => pb.collection('programs').getFullList({ sort: 'order,title', requestKey: null }).then(setRecords).catch(() => {});
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (r: RecordModel) => {
    setEditing(r);
    const feats = Array.isArray(r.features) ? r.features.join(', ') : '';
    setForm({ title: r.title ?? '', description: strip(r.description ?? ''), duration: r.duration ?? '', level: r.level ?? '', icon: r.icon ?? 'BookOpen', route: r.route ?? '', status: r.status ?? 'published', order: String(r.order ?? ''), features: feats });
    setModal(true);
  };
  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(p => ({ ...p, [key]: e.target.value }));

  const save = async () => {
    if (!form.title.trim() || !form.duration.trim() || !form.level.trim()) return onToast({ type: 'error', message: 'Title, duration, and level are required.' });
    setSaving(true);
    try {
      const features = form.features.split(',').map(s => s.trim()).filter(Boolean);
      const data = { title: form.title, description: `<p>${form.description}</p>`, duration: form.duration, level: form.level, icon: form.icon, route: form.route || `/${form.title.toLowerCase().replace(/\s+/g, '-')}`, status: form.status, order: form.order ? Number(form.order) : 99, features };
      if (editing) await pb.collection('programs').update(editing.id, data);
      else await pb.collection('programs').create(data);
      await load(); setModal(false);
      onToast({ type: 'success', message: editing ? 'Program updated!' : 'Program added!' });
    } catch { onToast({ type: 'error', message: 'Could not save. Please try again.' }); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await pb.collection('programs').delete(confirmId);
      setRecords(p => p.filter(r => r.id !== confirmId)); setConfirmId(null);
      onToast({ type: 'success', message: 'Program deleted.' });
    } catch { onToast({ type: 'error', message: 'Could not delete.' }); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Programs" subtitle={`${records.length} program${records.length !== 1 ? 's' : ''}`}
        action={<button onClick={openCreate} className={addBtnCls}><Plus className="w-4 h-4" /> Add Program</button>} />
      {!records.length ? <EmptyState icon={BookOpen} message="No programs yet." /> : (
        <div className="space-y-3">
          {records.map(r => (
            <div key={r.id} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-white text-sm">{r.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-600/40 text-gray-400'}`}>
                      {r.status === 'published' ? '✓ Visible' : '◌ Hidden'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{strip(r.description ?? '').slice(0, 100)}…</p>
                  <p className="text-xs text-gray-500 mt-1">{r.duration} · {r.level}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(r)} className="p-1.5 text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setConfirmId(r.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} title={editing ? 'Edit Program' : 'New Program'} onClose={() => setModal(false)} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className={labelCls}>Program name *</label><input value={form.title} onChange={f('title')} className={inputCls} placeholder="e.g. Montessori Pre-School" /></div>
            <div><label className={labelCls}>Duration *</label><input value={form.duration} onChange={f('duration')} className={inputCls} placeholder="e.g. Full Academic Year" /></div>
            <div><label className={labelCls}>Age / Level *</label><input value={form.level} onChange={f('level')} className={inputCls} placeholder="e.g. Ages 3-6" /></div>
          </div>
          <div><label className={labelCls}>Description</label><textarea value={form.description} onChange={f('description')} className={inputCls} rows={3} placeholder="What does this program offer?" /></div>
          <div><label className={labelCls}>Key features (comma-separated)</label><input value={form.features} onChange={f('features')} className={inputCls} placeholder="e.g. Child-Centered Learning, Hands-On Activities, Social Development" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Icon</label>
              <select value={form.icon} onChange={f('icon')} className={selectCls}>
                {ICONS.map(i => <option key={i} value={i}>{ICON_LABELS[i]}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Display order</label><input type="number" min="1" value={form.order} onChange={f('order')} className={inputCls} placeholder="1 = first" /></div>
          </div>
          <div><label className={labelCls}>Visibility</label>
            <div className="flex gap-3">
              {['published','draft'].map(s => (
                <button key={s} type="button" onClick={() => setForm(p => ({ ...p, status: s }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.status === s ? 'bg-amber-500/20 border-amber-500/60 text-amber-400' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}>
                  {s === 'published' ? '✓ Visible on website' : '◌ Hidden (draft)'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-800">
            <button onClick={save} disabled={saving} className={saveBtnCls}><Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save'}</button>
            <button onClick={() => setModal(false)} className={cancelBtnCls}><X className="w-4 h-4" />Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmId} title="Delete this program?" message="This will permanently remove this program from your website." onConfirm={remove} onCancel={() => setConfirmId(null)} loading={deleting} />
    </div>
  );
}
