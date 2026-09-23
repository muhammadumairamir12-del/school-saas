import React, { useEffect, useRef, useState } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { CLASS_SECTIONS, WEEK_DAYS } from '../../schoolData';
import Modal from '../Modal';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';

const SAMPLE = [
  { id: 'tt-1', classSection: 'Class 10 - A', day: 'Monday', start: '08:00', end: '08:45', subject: 'Mathematics', teacher: 'Vikram Malhotra' },
  { id: 'tt-2', classSection: 'Class 10 - A', day: 'Monday', start: '08:45', end: '09:30', subject: 'English', teacher: 'Priya Nair' },
  { id: 'tt-3', classSection: 'Class 10 - A', day: 'Tuesday', start: '08:00', end: '08:45', subject: 'Science', teacher: 'Priya Nair' },
  { id: 'tt-4', classSection: 'Class 10 - A', day: 'Wednesday', start: '09:30', end: '10:15', subject: 'Computer', teacher: 'Vikram Malhotra' },
  { id: 'tt-5', classSection: 'Class 9 - B', day: 'Monday', start: '08:00', end: '08:45', subject: 'Mathematics', teacher: 'Vikram Malhotra' },
  { id: 'tt-6', classSection: 'Class 9 - B', day: 'Thursday', start: '10:15', end: '11:00', subject: 'Social Studies', teacher: 'Priya Nair' },
];

const emptyForm = { classSection: 'Class 10 - A', day: 'Monday', start: '08:00', end: '08:45', subject: '', teacher: '' };

export default function Timetable() {
  const { role, assignedClass } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [klass, setKlass] = useState(role === 'Teacher' ? assignedClass : 'Class 10 - A');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const triedSeed = useRef(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'timetable'), async (snap) => {
      if (snap.empty && !triedSeed.current) {
        triedSeed.current = true;
        try {
          for (const item of SAMPLE) {
            await setDoc(doc(db, 'timetable', item.id), item);
          }
        } catch (err) {
          console.error(err);
          setRows(SAMPLE);
          setLoading(false);
        }
        return;
      }
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => String(a.start).localeCompare(String(b.start)));
      setRows(list);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const classRows = rows.filter((r) => r.classSection === klass);

  const savePeriod = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.teacher.trim()) {
      setError('Subject and teacher are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const id = `tt-${Date.now()}`;
      await setDoc(doc(db, 'timetable', id), { ...form, id, subject: form.subject.trim(), teacher: form.teacher.trim() });
      setOpen(false);
      setForm({ ...emptyForm, classSection: klass });
    } catch (err) {
      console.error(err);
      setError('Could not save this period.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Class Timetable</h2>
            <p className="text-xs text-slate-500">Weekly periods by class, subject, and teacher</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {role === 'Admin' ? (
            <select value={klass} onChange={(e) => setKlass(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
              {CLASS_SECTIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          ) : (
            <span className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm font-semibold text-amber-800">{assignedClass}</span>
          )}
          {role === 'Admin' && (
            <button
              type="button"
              onClick={() => { setForm({ ...emptyForm, classSection: klass }); setOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Period
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm">Loading timetable...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {WEEK_DAYS.map((day) => {
            const periods = classRows.filter((r) => r.day === day);
            return (
              <section key={day} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <h3 className="px-4 py-3 bg-indigo-50 text-indigo-800 text-sm font-bold border-b border-indigo-100">{day}</h3>
                {periods.length === 0 ? (
                  <p className="px-4 py-6 text-xs text-slate-400">No periods</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {periods.map((p) => (
                      <li key={p.id} className="px-4 py-3 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{p.subject}</p>
                          <p className="text-xs text-slate-500">{p.teacher}</p>
                          <p className="text-[11px] font-mono text-indigo-600 mt-1">{p.start} – {p.end}</p>
                        </div>
                        {role === 'Admin' && (
                          <button type="button" aria-label="Remove period" onClick={() => deleteDoc(doc(db, 'timetable', p.id))} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add a period">
        {error && <div className="mb-3 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm">{error}</div>}
        <form onSubmit={savePeriod} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-600">Class
            <select value={form.classSection} onChange={(e) => setForm({ ...form, classSection: e.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
              {CLASS_SECTIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-600">Day
            <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
              {WEEK_DAYS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-slate-600">Start
              <input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </label>
            <label className="block text-xs font-semibold text-slate-600">End
              <input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </label>
          </div>
          <label className="block text-xs font-semibold text-slate-600">Subject
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </label>
          <label className="block text-xs font-semibold text-slate-600">Teacher
            <input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </label>
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm disabled:opacity-60">
            {saving ? 'Saving...' : 'Save period'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
