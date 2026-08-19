import { useState, useEffect } from 'react';
import { UserPlus, GraduationCap, Pencil, Trash2, Save, X } from 'lucide-react';
import pb from '../../../../lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { Modal, ConfirmDialog, SearchBar, EmptyState, SectionHeader, inputCls, labelCls, saveBtnCls, cancelBtnCls, addBtnCls } from '../shared';

interface Toast { type: 'success' | 'error'; message: string }
const EMPTY = { name: '', email: '', password: '', phone: '', address: '' };

export default function Students({ onToast }: { onToast: (t: Toast) => void }) {
  const [records, setRecords] = useState<RecordModel[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<RecordModel | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () =>
    pb.collection('users').getFullList({ filter: "role='student'", sort: 'name', requestKey: null })
      .then(setRecords).catch(() => {});

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (r: RecordModel) => {
    setEditing(r);
    setForm({ name: r.name ?? '', email: r.email ?? '', password: '', phone: r.phone ?? '', address: r.address ?? '' });
    setModal(true);
  };

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const save = async () => {
    if (!form.name.trim() || (!editing && !form.email.trim())) {
      return onToast({ type: 'error', message: 'Name and email are required.' });
    }
    if (!editing && form.password.length < 8) {
      return onToast({ type: 'error', message: 'Password must be at least 8 characters.' });
    }
    setSaving(true);
    try {
      if (editing) {
        const data: Record<string, string> = { name: form.name, phone: form.phone, address: form.address };
        if (form.password) { data.password = form.password; data.passwordConfirm = form.password; }
        await pb.collection('users').update(editing.id, data);
      } else {
        await pb.collection('users').create({
          email: form.email, name: form.name, phone: form.phone, address: form.address,
          password: form.password, passwordConfirm: form.password, role: 'student', emailVisibility: true,
        });
      }
      await load();
      setModal(false);
      onToast({ type: 'success', message: editing ? 'Student updated!' : 'Student added!' });
    } catch (err: any) {
      const msg = err?.data?.data?.email?.message?.includes('unique')
        ? 'That email is already registered.'
        : 'Could not save. Please check the details and try again.';
      onToast({ type: 'error', message: msg });
    } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await pb.collection('users').delete(confirmId);
      setRecords(prev => prev.filter(r => r.id !== confirmId));
      setConfirmId(null);
      onToast({ type: 'success', message: 'Student removed.' });
    } catch { onToast({ type: 'error', message: 'Could not remove student. They may have linked records.' }); }
    finally { setDeleting(false); }
  };

  const filtered = records.filter(r =>
    (r.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (r.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <SectionHeader title="Students" subtitle={`${records.length} registered student${records.length !== 1 ? 's' : ''}`}
        action={<button onClick={openCreate} className={addBtnCls}><UserPlus className="w-4 h-4" /> Add Student</button>} />

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" />

      {!filtered.length
        ? <EmptyState icon={GraduationCap} message={search ? 'No students match your search.' : 'No students yet. Add your first one!'} />
        : (
          <div className="space-y-2">
            {filtered.map(r => (
              <div key={r.id} className="flex items-center gap-3 bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3">
                <div className="w-9 h-9 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0 text-amber-400 font-bold text-sm uppercase">
                  {(r.name?.[0] ?? r.email?.[0] ?? '?')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{r.name || '(no name)'}</p>
                  <p className="text-xs text-gray-400 truncate">{r.email}{r.phone ? ` · ${r.phone}` : ''}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(r)} className="p-1.5 text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setConfirmId(r.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      <Modal open={modal} title={editing ? 'Edit Student' : 'Add New Student'} onClose={() => setModal(false)}>
        <div className="space-y-4">
          <div><label className={labelCls}>Full name *</label><input value={form.name} onChange={f('name')} className={inputCls} placeholder="e.g. Nong Ploy" /></div>
          {!editing && <div><label className={labelCls}>Email address *</label><input type="email" value={form.email} onChange={f('email')} className={inputCls} placeholder="student@example.com" /></div>}
          <div>
            <label className={labelCls}>{editing ? 'New password (leave blank to keep current)' : 'Password *'}</label>
            <input type="password" value={form.password} onChange={f('password')} className={inputCls} placeholder="At least 8 characters" />
          </div>
          <div><label className={labelCls}>Phone number</label><input value={form.phone} onChange={f('phone')} className={inputCls} placeholder="+66 xx xxx xxxx" /></div>
          <div><label className={labelCls}>Address</label><textarea value={form.address} onChange={f('address')} className={inputCls} rows={2} placeholder="Home address" /></div>
          <div className="flex gap-3 pt-2 border-t border-gray-800">
            <button onClick={save} disabled={saving} className={saveBtnCls}><Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save'}</button>
            <button onClick={() => setModal(false)} className={cancelBtnCls}><X className="w-4 h-4" />Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmId} title="Remove this student?"
        message="This will permanently remove this student and their account. This cannot be undone."
        onConfirm={remove} onCancel={() => setConfirmId(null)} loading={deleting} />
    </div>
  );
}
