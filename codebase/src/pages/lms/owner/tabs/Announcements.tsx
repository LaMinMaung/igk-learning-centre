import { useState, useEffect } from 'react';
import { Megaphone, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import pb from '../../../../lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { Modal, ConfirmDialog, SearchBar, EmptyState, SectionHeader, inputCls, selectCls, labelCls, saveBtnCls, cancelBtnCls, addBtnCls } from '../shared';

interface Toast { type: 'success' | 'error'; message: string }

const PRIORITIES = [
  { value: 'low',    label: '🟢 Low',    badge: 'bg-gray-600/40 text-gray-400' },
  { value: 'medium', label: '🟡 Medium', badge: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'high',   label: '🟠 High',   badge: 'bg-orange-500/20 text-orange-400' },
  { value: 'urgent', label: '🔴 Urgent', badge: 'bg-red-500/20 text-red-400' },
];
const TARGETS = [
  { value: 'all',      label: 'Everyone' },
  { value: 'students', label: 'Students only' },
  { value: 'teachers', label: 'Teachers only' },
  { value: 'parents',  label: 'Parents only' },
];

const EMPTY = { title: '', content: '', target_roles: 'all', priority: 'medium', publish_date: new Date().toISOString().slice(0, 10) };

export default function Announcements({ onToast }: { onToast: (t: Toast) => void }) {
  const [records, setRecords] = useState<RecordModel[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<RecordModel | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () =>
    pb.collection('announcements').getFullList({ sort: '-publish_date', requestKey: null })
      .then(setRecords).catch(() => {});
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (r: RecordModel) => {
    setEditing(r);
    setForm({
      title: r.title ?? '',
      content: (r.content ?? '').replace(/<[^>]*>/g, ''),
      target_roles: Array.isArray(r.target_roles) ? r.target_roles[0] : (r.target_roles ?? 'all'),
      priority: r.priority ?? 'medium',
      publish_date: (r.publish_date ?? '').slice(0, 10),
    });
    setModal(true);
  };
  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) return onToast({ type: 'error', message: 'Title and message are required.' });
    setSaving(true);
    try {
      const data = {
        title: form.title,
        content: `<p>${form.content}</p>`,
        target_roles: [form.target_roles],
        priority: form.priority,
        publish_date: form.publish_date ? `${form.publish_date} 00:00:00.000Z` : new Date().toISOString(),
      };
      if (editing) await pb.collection('announcements').update(editing.id, data);
      else await pb.collection('announcements').create(data);
      await load(); setModal(false);
      onToast({ type: 'success', message: editing ? 'Announcement updated!' : 'Announcement posted!' });
    } catch { onToast({ type: 'error', message: 'Could not save. Please try again.' }); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await pb.collection('announcements').delete(confirmId);
      setRecords(p => p.filter(r => r.id !== confirmId)); setConfirmId(null);
      onToast({ type: 'success', message: 'Announcement deleted.' });
    } catch { onToast({ type: 'error', message: 'Could not delete.' }); }
    finally { setDeleting(false); }
  };

  const filtered = records.filter(r => (r.title ?? '').toLowerCase().includes(search.toLowerCase()));
  const badgeCls = (p: string) => PRIORITIES.find(x => x.value === p)?.badge ?? 'bg-gray-600/40 text-gray-400';
  const targetLabel = (v: string | string[]) => {
    const key = Array.isArray(v) ? v[0] : v;
    return TARGETS.find(t => t.value === key)?.label ?? key;
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Announcements" subtitle={`${records.length} announcement${records.length !== 1 ? 's' : ''}`}
        action={<button onClick={openCreate} className={addBtnCls}><Plus className="w-4 h-4" /> New Announcement</button>} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search announcements…" />
      {!filtered.length
        ? <EmptyState icon={Megaphone} message={search ? 'No announcements match your search.' : 'No announcements yet.'} />
        : (
          <div className="space-y-3">
            {filtered.map(r => (
              <div key={r.id} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-white text-sm">{r.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeCls(r.priority)}`}>
                        {PRIORITIES.find(p => p.value === r.priority)?.label ?? r.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{(r.content ?? '').replace(/<[^>]*>/g, '').slice(0, 100)}{(r.content?.length ?? 0) > 100 ? '…' : ''}</p>
                    <p className="text-xs text-gray-500">For: {targetLabel(r.target_roles)} · {(r.publish_date ?? '').slice(0, 10)}</p>
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

      <Modal open={modal} title={editing ? 'Edit Announcement' : 'New Announcement'} onClose={() => setModal(false)}>
        <div className="space-y-4">
          <div><label className={labelCls}>Title *</label><input value={form.title} onChange={f('title')} className={inputCls} placeholder="e.g. School closed on Monday" /></div>
          <div><label className={labelCls}>Message *</label><textarea value={form.content} onChange={f('content')} className={inputCls} rows={4} placeholder="Write your announcement here…" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Send to</label>
              <select value={form.target_roles} onChange={f('target_roles')} className={selectCls}>
                {TARGETS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Importance</label>
              <select value={form.priority} onChange={f('priority')} className={selectCls}>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div><label className={labelCls}>Publish date</label><input type="date" value={form.publish_date} onChange={f('publish_date')} className={inputCls} /></div>
          <div className="flex gap-3 pt-2 border-t border-gray-800">
            <button onClick={save} disabled={saving} className={saveBtnCls}><Save className="w-4 h-4" />{saving ? 'Saving…' : 'Post'}</button>
            <button onClick={() => setModal(false)} className={cancelBtnCls}><X className="w-4 h-4" />Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmId} title="Delete announcement?" message="This announcement will be permanently deleted." onConfirm={remove} onCancel={() => setConfirmId(null)} loading={deleting} />
    </div>
  );
}
