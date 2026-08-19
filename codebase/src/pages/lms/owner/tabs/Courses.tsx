import { useState, useEffect } from 'react';
import { BookOpen, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import pb from '../../../../lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { Modal, ConfirmDialog, SearchBar, EmptyState, SectionHeader, inputCls, selectCls, labelCls, saveBtnCls, cancelBtnCls, addBtnCls } from '../shared';

interface Toast { type: 'success' | 'error'; message: string }

const LEVELS = [
  { value: 'nursery',   label: 'Nursery' },
  { value: 'primary',   label: 'Primary School' },
  { value: 'secondary', label: 'Secondary School' },
  { value: 'exam_prep', label: 'Exam Preparation' },
];
const STATUSES = [
  { value: 'published', label: '✓ Visible to students' },
  { value: 'draft',     label: '◌ Hidden (draft)' },
  { value: 'archived',  label: '⊘ Archived' },
];

const EMPTY = { title: '', description: '', level: 'primary', status: 'draft', duration_weeks: '' };

export default function Courses({ onToast }: { onToast: (t: Toast) => void }) {
  const [records, setRecords] = useState<RecordModel[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<RecordModel | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () =>
    pb.collection('courses').getFullList({ sort: 'title', requestKey: null })
      .then(setRecords).catch(() => {});
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (r: RecordModel) => {
    setEditing(r);
    setForm({ title: r.title ?? '', description: r.description?.replace(/<[^>]*>/g, '') ?? '', level: r.level ?? 'primary', status: r.status ?? 'draft', duration_weeks: String(r.duration_weeks ?? '') });
    setModal(true);
  };
  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const save = async () => {
    if (!form.title.trim()) return onToast({ type: 'error', message: 'Course title is required.' });
    setSaving(true);
    try {
      const data = {
        title: form.title,
        description: form.description ? `<p>${form.description}</p>` : '<p></p>',
        level: form.level,
        status: form.status,
        duration_weeks: form.duration_weeks ? Number(form.duration_weeks) : null,
        ...(!editing ? { created_by: pb.authStore.record?.id } : {}),
      };
      if (editing) await pb.collection('courses').update(editing.id, data);
      else await pb.collection('courses').create(data);
      await load(); setModal(false);
      onToast({ type: 'success', message: editing ? 'Course updated!' : 'Course created!' });
    } catch { onToast({ type: 'error', message: 'Could not save. Please try again.' }); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await pb.collection('courses').delete(confirmId);
      setRecords(p => p.filter(r => r.id !== confirmId)); setConfirmId(null);
      onToast({ type: 'success', message: 'Course deleted.' });
    } catch { onToast({ type: 'error', message: 'Could not delete. The course may have student enrollments.' }); }
    finally { setDeleting(false); }
  };

  const filtered = records.filter(r => (r.title ?? '').toLowerCase().includes(search.toLowerCase()));

  const statusBadge = (s: string) => ({
    published: 'bg-emerald-500/20 text-emerald-400',
    draft:     'bg-gray-600/40 text-gray-400',
    archived:  'bg-red-500/20 text-red-400',
  }[s] ?? 'bg-gray-600/40 text-gray-400');

  const levelLabel = (v: string) => LEVELS.find(l => l.value === v)?.label ?? v;

  return (
    <div className="space-y-5">
      <SectionHeader title="Courses" subtitle={`${records.length} course${records.length !== 1 ? 's' : ''}`}
        action={<button onClick={openCreate} className={addBtnCls}><Plus className="w-4 h-4" /> New Course</button>} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search courses…" />
      {!filtered.length
        ? <EmptyState icon={BookOpen} message={search ? 'No courses match your search.' : 'No courses yet. Create the first one!'} />
        : (
          <div className="space-y-2">
            {filtered.map(r => (
              <div key={r.id} className="flex items-center gap-3 bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3">
                <div className="w-9 h-9 bg-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white text-sm">{r.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(r.status)}`}>
                      {STATUSES.find(s => s.value === r.status)?.label ?? r.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{levelLabel(r.level)}{r.duration_weeks ? ` · ${r.duration_weeks} weeks` : ''}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(r)} className="p-1.5 text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setConfirmId(r.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

      <Modal open={modal} title={editing ? 'Edit Course' : 'New Course'} onClose={() => setModal(false)}>
        <div className="space-y-4">
          <div><label className={labelCls}>Course title *</label><input value={form.title} onChange={f('title')} className={inputCls} placeholder="e.g. Cambridge Year 7 Mathematics" /></div>
          <div><label className={labelCls}>Description</label><textarea value={form.description} onChange={f('description')} className={inputCls} rows={3} placeholder="What will students learn in this course?" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Level</label>
              <select value={form.level} onChange={f('level')} className={selectCls}>
                {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Duration (weeks)</label><input type="number" min="1" value={form.duration_weeks} onChange={f('duration_weeks')} className={inputCls} placeholder="e.g. 12" /></div>
          </div>
          <div><label className={labelCls}>Visibility</label>
            <select value={form.status} onChange={f('status')} className={selectCls}>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-800">
            <button onClick={save} disabled={saving} className={saveBtnCls}><Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save'}</button>
            <button onClick={() => setModal(false)} className={cancelBtnCls}><X className="w-4 h-4" />Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmId} title="Delete this course?" message="This will delete the course and all its lessons. Students' enrollment records may also be affected."
        onConfirm={remove} onCancel={() => setConfirmId(null)} loading={deleting} />
    </div>
  );
}
