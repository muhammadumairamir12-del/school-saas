import React, { useEffect, useRef, useState } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { CLASS_SECTIONS } from '../../schoolData';
import Modal from '../Modal';
import { NotebookPen, Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];
const SAMPLE = [
  { id: 'hw-1', title: 'Algebra worksheet 4', subject: 'Mathematics', classSection: 'Class 10 - A', dueDate: today, details: 'Complete questions 1 to 12 from chapter 4.', done: false },
  { id: 'hw-2', title: 'Essay: My city', subject: 'English', classSection: 'Class 10 - A', dueDate: today, details: 'Write 250 words and submit in the next English period.', done: false },
  { id: 'hw-3', title: 'Lab diagram', subject: 'Science', classSection: 'Class 9 - B', dueDate: today, details: 'Draw and label the human heart.', done: true },
];

export default function Homework() {
  const { role, assignedClass } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [klass, setKlass] = useState(role === 'Teacher' ? assignedClass : 'All');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', subject: '', classSection: assignedClass || 'Class 10 - A', dueDate: today, details: '' });
  const triedSeed = useRef(false);
  const canEdit = role === 'Admin' || role === 'Teacher';

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'homework'), async (snap) => {
      if (snap.empty && !triedSeed.current) {
        triedSeed.current = true;
        try {
          for (const item of SAMPLE) await setDoc(doc(db, 'homework', item.id), item);
        } catch (err) {
          console.error(err);
          setItems(SAMPLE);
          setLoading(false);
        }
        return;
      }
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
      setItems(list);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const visible = items.filter((item) => {
    if (role === 'Teacher') return item.classSection === assignedClass;
    if (klass === 'All') return true;
    return item.classSection === klass;
  });

  const pending = visible.filter((i) => !i.done).length;

  const saveItem = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subject.trim()) {
      setError('Title and subject are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const id = `hw-${Date.now()}`;
      await setDoc(doc(db, 'homework', id), {
        ...form,
        id,
        title: form.title.trim(),
        subject: form.subject.trim(),
        details: form.details.trim(),
        done: false,
        classSection: role === 'Teacher' ? assignedClass : form.classSection,
      });
      setOpen(false);
      setForm({ title: '', subject: '', classSection: assignedClass || 'Class 10 - A', dueDate: today, details: '' });
    } catch (err) {
      console.error(err);
      setError('Could not save homework.');
    } finally {
      setSaving(false);
    }
  };

  const toggleDone = async (item) => {
    if (!canEdit) return;
    await setDoc(doc(db, 'homework', item.id), { done: !item.done }, { merge: true });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <NotebookPen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Homework</h2>
            <p className="text-xs text-slate-500">{pending} pending in this view</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {role === 'Admin' && (
            <select value={klass} onChange={(e) => setKlass(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
              <option value="All">All classes</option>
              {CLASS_SECTIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          )}
          {canEdit && (
            <button type="button" onClick={() => setOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Assign
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm">Loading homework...</div>
      ) : visible.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">No homework for this class yet.</div>
      ) : (
        <div className="space-y-3">
          {visible.map((item) => (
            <article key={item.id} className={`bg-white rounded-2xl border p-4 flex gap-3 ${item.done ? 'border-emerald-200' : 'border-slate-200'}`}>
              <button type="button" onClick={() => toggleDone(item)} className="mt-0.5 shrink-0" aria-label={item.done ? 'Mark pending' : 'Mark done'}>
                {item.done ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-300" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`font-bold text-slate-800 ${item.done ? 'line-through text-slate-400' : ''}`}>{item.title}</h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">{item.subject}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{item.details}</p>
                <p className="text-[11px] text-slate-400 mt-2">{item.classSection} · Due {item.dueDate}</p>
              </div>
              {canEdit && (
                <button type="button" aria-label="Delete homework" onClick={() => deleteDoc(doc(db, 'homework', item.id))} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg self-start">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </article>
          ))}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Assign homework">
        {error && <div className="mb-3 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm">{error}</div>}
        <form onSubmit={saveItem} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-600">Title
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </label>
          <label className="block text-xs font-semibold text-slate-600">Subject
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </label>
          {role === 'Admin' && (
            <label className="block text-xs font-semibold text-slate-600">Class
              <select value={form.classSection} onChange={(e) => setForm({ ...form, classSection: e.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                {CLASS_SECTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          )}
          <label className="block text-xs font-semibold text-slate-600">Due date
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </label>
          <label className="block text-xs font-semibold text-slate-600">Details
            <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} rows={3} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </label>
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-orange-500 text-white font-bold rounded-xl text-sm disabled:opacity-60">
            {saving ? 'Saving...' : 'Save homework'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
