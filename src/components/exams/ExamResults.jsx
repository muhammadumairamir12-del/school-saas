import React, { useEffect, useMemo, useRef, useState } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { CLASS_SECTIONS, SUBJECTS, percentGrade } from '../../schoolData';
import { DEMO_EXAMS } from '../../mockData';
import { readLocalCollection, writeLocalCollection, upsertLocal, removeLocal } from '../../demoStore';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import { ClipboardCheck, Plus, Trash2, Pencil } from 'lucide-react';

export default function ExamResults() {
  const { role, assignedClass } = useAuth();
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [klass, setKlass] = useState(role === 'Teacher' ? assignedClass : 'Class 10 - A');
  const [examFilter, setExamFilter] = useState('All');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(null);
  const [form, setForm] = useState({ studentId: '', examName: 'Unit Test 1', subject: 'Mathematics', marks: '', total: 50 });
  const triedSeed = useRef(false);
  const useLocal = useRef(false);
  const canEdit = role === 'Admin' || role === 'Teacher';

  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStudents(list.length ? list : (readLocalCollection('students') || []));
    }, () => setStudents(readLocalCollection('students') || []));

    const unsub = onSnapshot(collection(db, 'exams'), async (snap) => {
      if (useLocal.current) return;
      if (snap.empty && !triedSeed.current) {
        triedSeed.current = true;
        const local = readLocalCollection('exams');
        if (local?.length) {
          setResults(local);
          setLoading(false);
          return;
        }
        try {
          for (const item of DEMO_EXAMS) await setDoc(doc(db, 'exams', item.id), item, { merge: true });
          writeLocalCollection('exams', DEMO_EXAMS);
        } catch {
          useLocal.current = true;
          writeLocalCollection('exams', DEMO_EXAMS);
          setResults(DEMO_EXAMS);
          setLoading(false);
        }
        return;
      }
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      writeLocalCollection('exams', list.length ? list : DEMO_EXAMS);
      setResults(list.length ? list : (readLocalCollection('exams') || DEMO_EXAMS));
      setLoading(false);
    }, () => {
      useLocal.current = true;
      setResults(readLocalCollection('exams') || DEMO_EXAMS);
      setLoading(false);
    });
    return () => { unsub(); unsubStudents(); };
  }, []);

  const classStudents = students.filter((s) => s.classSection === (role === 'Teacher' ? assignedClass : klass) && s.status !== 'Left');
  const visible = results.filter((r) => {
    const section = role === 'Teacher' ? assignedClass : klass;
    if (r.classSection !== section) return false;
    if (examFilter !== 'All' && r.examName !== examFilter) return false;
    return true;
  });
  const examNames = useMemo(() => ['All', ...new Set(results.map((r) => r.examName).filter(Boolean))], [results]);
  const average = visible.length
    ? Math.round(visible.reduce((sum, r) => sum + ((Number(r.marks) / Number(r.total || 1)) * 100), 0) / visible.length)
    : 0;

  const openCreate = () => {
    setEditing(null);
    setForm({ studentId: '', examName: 'Unit Test 1', subject: 'Mathematics', marks: '', total: 50 });
    setError('');
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      studentId: row.studentId,
      examName: row.examName,
      subject: row.subject,
      marks: row.marks,
      total: row.total,
    });
    setError('');
    setOpen(true);
  };

  const saveResult = async (e) => {
    e.preventDefault();
    const student = students.find((s) => s.id === form.studentId) || { id: form.studentId, name: editing?.studentName, classSection: editing?.classSection };
    if ((!student?.id && !editing) || !form.subject || form.marks === '') {
      setError('Choose a student, subject, and marks.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const id = editing?.id || `ex-${Date.now()}`;
      const payload = {
        id,
        studentId: student.id || editing.studentId,
        studentName: student.name || editing.studentName,
        classSection: student.classSection || editing.classSection,
        examName: form.examName,
        subject: form.subject,
        marks: Number(form.marks),
        total: Number(form.total) || 100,
        session: '2026-2027',
        updatedAt: new Date().toISOString(),
      };
      if (useLocal.current) {
        setResults([...upsertLocal('exams', payload)]);
      } else {
        try {
          await setDoc(doc(db, 'exams', id), payload, { merge: true });
          upsertLocal('exams', payload);
        } catch {
          useLocal.current = true;
          setResults([...upsertLocal('exams', payload)]);
        }
      }
      setOpen(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
      setError('Could not save this result.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!removing) return;
    try {
      if (!useLocal.current) {
        try { await deleteDoc(doc(db, 'exams', removing.id)); } catch { useLocal.current = true; }
      }
      setResults([...removeLocal('exams', removing.id)]);
    } catch (err) {
      console.error(err);
    }
    setRemoving(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Exam Results</h2>
            <p className="text-xs text-slate-500">Class average {average}% · {visible.length} entries · full edit / delete</p>
          </div>
        </div>
        {canEdit && (
          <button type="button" onClick={openCreate} className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md flex items-center gap-2 self-start">
            <Plus className="w-4 h-4" />
            Add Marks
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {role === 'Admin' ? (
          <select value={klass} onChange={(e) => setKlass(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm">
            {CLASS_SECTIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        ) : (
          <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm font-semibold text-amber-800">{assignedClass}</div>
        )}
        <select value={examFilter} onChange={(e) => setExamFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm">
          {examNames.map((name) => <option key={name} value={name}>{name === 'All' ? 'All exams' : name}</option>)}
        </select>
      </div>

      <div className="space-y-3 md:hidden">
        {loading ? <p className="p-6 text-center text-sm text-slate-500">Loading...</p> : visible.map((row) => (
          <article key={row.id} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-bold text-slate-800">{row.studentName}</p>
                <p className="text-xs text-slate-500">{row.examName} · {row.subject}</p>
                <p className="text-sm font-semibold mt-1">{row.marks}/{row.total} · {percentGrade(row.marks, row.total)}</p>
              </div>
              {canEdit && (
                <div className="flex gap-1">
                  <button type="button" onClick={() => openEdit(row)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button type="button" onClick={() => setRemoving(row)} className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading results...</div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No marks for this class yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[640px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Exam</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Marks</th>
                  <th className="py-3 px-4">Grade</th>
                  {canEdit && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 px-4 font-semibold text-slate-800">{row.studentName}</td>
                    <td className="py-3 px-4">{row.examName}</td>
                    <td className="py-3 px-4">{row.subject}</td>
                    <td className="py-3 px-4 font-mono text-xs">{row.marks} / {row.total}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200">
                        {percentGrade(row.marks, row.total)}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right">
                        <button type="button" aria-label="Edit" onClick={() => openEdit(row)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg mr-1">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" aria-label="Delete" onClick={() => setRemoving(row)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit marks' : 'Enter marks'}>
        {error && <div className="mb-3 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm">{error}</div>}
        <form onSubmit={saveResult} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-600">Student
            <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
              <option value="">Select student</option>
              {classStudents.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-600">Exam name
            <input value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </label>
          <label className="block text-xs font-semibold text-slate-600">Subject
            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-slate-600">Marks
              <input type="number" min="0" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </label>
            <label className="block text-xs font-semibold text-slate-600">Out of
              <input type="number" min="1" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </label>
          </div>
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-violet-600 text-white font-bold rounded-xl text-sm disabled:opacity-60">
            {saving ? 'Saving...' : editing ? 'Update result' : 'Save result'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={confirmDelete}
        title="Delete result"
        message={removing ? `Remove marks for ${removing.studentName}?` : ''}
      />
    </div>
  );
}
