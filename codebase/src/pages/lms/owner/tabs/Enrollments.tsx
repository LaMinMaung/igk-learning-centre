import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, Save, X } from 'lucide-react';
import pb from '../../../../lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { Modal, ConfirmDialog, SearchBar, EmptyState, SectionHeader, inputCls, selectCls, labelCls, saveBtnCls, cancelBtnCls, addBtnCls } from '../shared';

interface Toast { type: 'success' | 'error'; message: string }

const STATUS_OPTS = [
  { value: 'active',    label: '▶ Active' },
  { value: 'completed', label: '✓ Completed' },
  { value: 'dropped',   label: '✕ Dropped' },
];
const statusBadge = (s: string) => ({
  active:    'bg-emerald-500/20 text-emerald-400',
  completed: 'bg-blue-500/20 text-blue-400',
  dropped:   'bg-red-500/20 text-red-400',
}[s] ?? 'bg-gray-600/40 text-gray-400');

export default function Enrollments({ onToast }: { onToast: (t: Toast) => void }) {
  const [records, setRecords] = useState<RecordModel[]>([]);
  const [students, setStudents] = useState<RecordModel[]>([]);
  const [courses, setCourses] = useState<RecordModel[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ student: '', course: '', enrolled_date: new Date().toISOString().slice(0, 10), status: 'active' });
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const [e, s, c] = await Promise.all([
      pb.collection('enrollments').getFullList({ expand: 'student,course', sort: '-created', requestKey: null }),
      pb.collection('users').getFullList({ filter: "role='student'", sort: 'name', requestKey: null }),
      pb.collection('courses').getFullList({ sort: 'title', requestKey: null }),
    ]);
    setRecords(e); setStudents(s); setCourses(c);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const updated = await pb.collection('enrollments').update(id, { status });
      setRecords(p => p.map(r => r.id === id ? { ...r, status } : r));
      onToast({ type: 'success', message: 'Status updated!' });
    } catch { onToast({ type: 'error', message: 'Could not update status.' }); }
  };

  const save = async () => {
    if (!form.student || !form.course) return onToast({ type: 'error', message: 'Please select a student and a course.' });
    setSaving(true);
    try {
      await pb.collection('enrollments').create({ ...form, progress_percentage: 0 });
      await load(); setModal(false);
      onToast({ type: 'success', message: 'Student enrolled!' });
    } catch { onToast({ type: 'error', message: 'Could not enroll. The student may already be enrolled in this course.' }); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await pb.collection('enrollments').delete(confirmId);
      setRecords(p => p.filter(r => r.id !== confirmId)); setConfirmId(null);
      onToast({ type: 'success', message: 'Enrollment removed.' });
    } catch { onToast({ type: 'error', message: 'Could not remove enrollment.' }); }
    finally { setDeleting(false); }
  };

  const filtered = records.filter(r => {
    const name = (r.expand?.student?.name ?? '').toLowerCase();
    const course = (r.expand?.course?.title ?? '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || course.includes(q);
  });

  return (
    <div className="space-y-5">
      <SectionHeader title="Enrollments" subtitle={`${records.length} enrollment${records.length !== 1 ? 's' : ''}`}
        action={<button onClick={() => { setForm({ student: '', course: '', enrolled_date: new Date().toISOString().slice(0, 10), status: 'active' }); setModal(true); }} className={addBtnCls}><Plus className="w-4 h-4" /> Enroll Student</button>} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search by student or course…" />
      {!filtered.length
        ? <EmptyState icon={ClipboardList} message={search ? 'No enrollments match your search.' : 'No enrollments yet.'} />
        : (
          <div className="space-y-2">
            {filtered.map(r => (
              <div key={r.id} className="flex items-center gap-3 bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{r.expand?.student?.name ?? r.student}</p>
                  <p className="text-xs text-gray-400">{r.expand?.course?.title ?? r.course} · {r.enrolled_date?.slice(0, 10)}</p>
                </div>
                <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer bg-transparent outline-none ${statusBadge(r.status)}`}>
                  {STATUS_OPTS.map(s => <option key={s.value} value={s.value} className="bg-gray-800 text-white">{s.label}</option>)}
                </select>
                <div className="text-xs text-gray-500">{r.progress_percentage ?? 0}%</div>
                <button onClick={() => setConfirmId(r.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}

      <Modal open={modal} title="Enroll a Student" onClose={() => setModal(false)}>
        <div className="space-y-4">
          <div><label className={labelCls}>Student *</label>
            <select value={form.student} onChange={e => setForm(p => ({ ...p, student: e.target.value }))} className={selectCls}>
              <option value="">— Select student —</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Course *</label>
            <select value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} className={selectCls}>
              <option value="">— Select course —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Start date</label>
            <input type="date" value={form.enrolled_date} onChange={e => setForm(p => ({ ...p, enrolled_date: e.target.value }))} className={inputCls} />
          </div>
          <div><label className={labelCls}>Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={selectCls}>
              {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-800">
            <button onClick={save} disabled={saving} className={saveBtnCls}><Save className="w-4 h-4" />{saving ? 'Enrolling…' : 'Enroll'}</button>
            <button onClick={() => setModal(false)} className={cancelBtnCls}><X className="w-4 h-4" />Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmId} title="Remove enrollment?" message="This will remove the student from this course. Their progress data will also be removed." onConfirm={remove} onCancel={() => setConfirmId(null)} loading={deleting} />
    </div>
  );
}
