import { useState, useEffect } from 'react';
import { UserPlus, Users, Pencil, Trash2, Save, X } from 'lucide-react';
import pb from '../../../../lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { Modal, ConfirmDialog, SearchBar, EmptyState, SectionHeader, inputCls, selectCls, labelCls, saveBtnCls, cancelBtnCls, addBtnCls } from '../shared';

interface Toast { type: 'success' | 'error'; message: string }
const EMPTY = { name: '', email: '', password: '', phone: '' };

export default function Teachers({ onToast }: { onToast: (t: Toast) => void }) {
  const [records, setRecords] = useState<RecordModel[]>([]);
  const [assignments, setAssignments] = useState<RecordModel[]>([]);
  const [courses, setCourses] = useState<RecordModel[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [assignModal, setAssignModal] = useState<RecordModel | null>(null);
  const [editing, setEditing] = useState<RecordModel | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const [t, a, c] = await Promise.all([
      pb.collection('users').getFullList({ filter: "role='teacher'", sort: 'name', requestKey: null }),
      pb.collection('teacher_course_assignments').getFullList({ expand: 'course', requestKey: null }),
      pb.collection('courses').getFullList({ sort: 'title', requestKey: null }),
    ]);
    setRecords(t); setAssignments(a); setCourses(c);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (r: RecordModel) => {
    setEditing(r);
    setForm({ name: r.name ?? '', email: r.email ?? '', password: '', phone: r.phone ?? '' });
    setModal(true);
  };
  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [key]: e.target.value }));

  const save = async () => {
    if (!form.name.trim() || (!editing && !form.email.trim())) return onToast({ type: 'error', message: 'Name and email are required.' });
    if (!editing && form.password.length < 8) return onToast({ type: 'error', message: 'Password must be at least 8 characters.' });
    setSaving(true);
    try {
      if (editing) {
        const data: Record<string, string> = { name: form.name, phone: form.phone };
        if (form.password) { data.password = form.password; data.passwordConfirm = form.password; }
        await pb.collection('users').update(editing.id, data);
      } else {
        await pb.collection('users').create({
          email: form.email, name: form.name, phone: form.phone,
          password: form.password, passwordConfirm: form.password, role: 'teacher', emailVisibility: true,
        });
      }
      await load(); setModal(false);
      onToast({ type: 'success', message: editing ? 'Teacher updated!' : 'Teacher added!' });
    } catch { onToast({ type: 'error', message: 'Could not save. Please check the details.' }); }
    finally { setSaving(false); }
  };

  const assign = async () => {
    if (!assignModal || !selectedCourse) return;
    try {
      await pb.collection('teacher_course_assignments').create({ teacher: assignModal.id, course: selectedCourse });
      await load(); setAssignModal(null); setSelectedCourse('');
      onToast({ type: 'success', message: 'Course assigned!' });
    } catch { onToast({ type: 'error', message: 'Could not assign course.' }); }
  };

  const unassign = async (id: string) => {
    try { await pb.collection('teacher_course_assignments').delete(id); await load(); }
    catch { onToast({ type: 'error', message: 'Could not remove assignment.' }); }
  };

  const remove = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await pb.collection('users').delete(confirmId);
      setRecords(p => p.filter(r => r.id !== confirmId)); setConfirmId(null);
      onToast({ type: 'success', message: 'Teacher removed.' });
    } catch { onToast({ type: 'error', message: 'Could not remove teacher.' }); }
    finally { setDeleting(false); }
  };

  const filtered = records.filter(r =>
    (r.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (r.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <SectionHeader title="Teachers" subtitle={`${records.length} teacher${records.length !== 1 ? 's' : ''}`}
        action={<button onClick={openCreate} className={addBtnCls}><UserPlus className="w-4 h-4" /> Add Teacher</button>} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" />
      {!filtered.length
        ? <EmptyState icon={Users} message={search ? 'No teachers match your search.' : 'No teachers yet.'} />
        : (
          <div className="space-y-2">
            {filtered.map(r => {
              const myAssignments = assignments.filter(a => a.teacher === r.id);
              return (
                <div key={r.id} className="bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0 text-blue-400 font-bold text-sm uppercase">
                      {r.name?.[0] ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">{r.name || '(no name)'}</p>
                      <p className="text-xs text-gray-400">{r.email}{r.phone ? ` · ${r.phone}` : ''}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setAssignModal(r); setSelectedCourse(''); }} className="px-2.5 py-1.5 text-xs text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-blue-500/30">
                        Assign course
                      </button>
                      <button onClick={() => openEdit(r)} className="p-1.5 text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmId(r.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {myAssignments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-12">
                      {myAssignments.map(a => (
                        <span key={a.id} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-700 rounded-full text-xs text-gray-300">
                          {a.expand?.course?.title ?? 'Course'}
                          <button onClick={() => unassign(a.id)} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      <Modal open={modal} title={editing ? 'Edit Teacher' : 'Add New Teacher'} onClose={() => setModal(false)}>
        <div className="space-y-4">
          <div><label className={labelCls}>Full name *</label><input value={form.name} onChange={f('name')} className={inputCls} placeholder="Teacher's full name" /></div>
          {!editing && <div><label className={labelCls}>Email address *</label><input type="email" value={form.email} onChange={f('email')} className={inputCls} placeholder="teacher@example.com" /></div>}
          <div><label className={labelCls}>{editing ? 'New password (leave blank to keep)' : 'Password *'}</label><input type="password" value={form.password} onChange={f('password')} className={inputCls} placeholder="At least 8 characters" /></div>
          <div><label className={labelCls}>Phone number</label><input value={form.phone} onChange={f('phone')} className={inputCls} placeholder="+66 xx xxx xxxx" /></div>
          <div className="flex gap-3 pt-2 border-t border-gray-800">
            <button onClick={save} disabled={saving} className={saveBtnCls}><Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save'}</button>
            <button onClick={() => setModal(false)} className={cancelBtnCls}><X className="w-4 h-4" />Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!assignModal} title={`Assign course to ${assignModal?.name}`} onClose={() => setAssignModal(null)}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Choose a course</label>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className={selectCls}>
              <option value="">— Select course —</option>
              {courses.filter(c => !assignments.some(a => a.teacher === assignModal?.id && a.course === c.id))
                .map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>

          </div>
          <div className="flex gap-3">
            <button onClick={assign} disabled={!selectedCourse} className={saveBtnCls}><Save className="w-4 h-4" />Assign</button>
            <button onClick={() => setAssignModal(null)} className={cancelBtnCls}><X className="w-4 h-4" />Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmId} title="Remove this teacher?" message="This will permanently remove this teacher's account." onConfirm={remove} onCancel={() => setConfirmId(null)} loading={deleting} />
    </div>
  );
}
