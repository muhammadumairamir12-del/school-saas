import React, { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, FileText } from 'lucide-react';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import { exportFeeVoucherPDF } from '../../utils/pdfExport';
import {
  listStudents,
  saveStudent,
  removeStudent,
  listClasses,
  classLabel,
  money,
} from '../../store';

const empty = {
  name: '',
  rollNo: '',
  classId: '',
  gender: 'Male',
  phone: '',
  guardian: '',
  monthlyFee: 3000,
  status: 'Active',
};

export default function StudentsPage() {
  const [tick, setTick] = useState(0);
  const students = useMemo(() => listStudents(), [tick]);
  const classes = useMemo(() => listClasses(), [tick]);
  const [q, setQ] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [form, setForm] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = students.filter((s) => {
    if (classFilter && s.classId !== classFilter) return false;
    if (!q.trim()) return true;
    const hay = `${s.name} ${s.rollNo} ${s.guardian} ${s.phone}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  const openNew = () =>
    setForm({ ...empty, classId: classes[0]?.id || '', id: undefined });

  const openEdit = (s) => setForm({ ...s });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.rollNo.trim() || !form.classId) return;
    saveStudent({
      ...form,
      monthlyFee: Number(form.monthlyFee) || 0,
      id: form.id || `s${Date.now()}`,
    });
    setForm(null);
    setTick((n) => n + 1);
  };

  const confirmDelete = () => {
    removeStudent(deleteId);
    setDeleteId(null);
    setTick((n) => n + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, roll, phone…"
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/25"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
          >
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.section}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0a6666] text-white rounded-lg text-sm font-semibold hover:bg-[#064e4e]"
        >
          <Plus className="w-4 h-4" />
          Add student
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Roll</th>
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Class</th>
                <th className="text-left px-4 py-3 font-semibold">Guardian</th>
                <th className="text-left px-4 py-3 font-semibold">Fee</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium">{s.rollNo}</td>
                    <td className="px-4 py-3">
                      <div>{s.name}</div>
                      <div className="text-xs text-slate-500">{s.phone}</div>
                    </td>
                    <td className="px-4 py-3">{classLabel(s.classId, classes)}</td>
                    <td className="px-4 py-3 text-slate-600">{s.guardian || '—'}</td>
                    <td className="px-4 py-3">{money(s.monthlyFee)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          s.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const curMonth = new Date().toISOString().slice(0, 7);
                          const dueDate = `${curMonth}-10`;
                          exportFeeVoucherPDF(
                            { id: s.id, name: s.name, classSection: classLabel(s.classId, classes) },
                            dueDate,
                            s.monthlyFee || 3500,
                            curMonth
                          );
                        }}
                        title="Download Fee Voucher PDF"
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 inline-flex mr-1"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 inline-flex"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(s.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 inline-flex"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? 'Edit student' : 'Add student'}
        maxWidth="max-w-xl"
      >
        {form && (
          <form onSubmit={submit} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Full name">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="field"
                />
              </Field>
              <Field label="Roll no">
                <input
                  required
                  value={form.rollNo}
                  onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                  className="field"
                />
              </Field>
              <Field label="Class">
                <select
                  required
                  value={form.classId}
                  onChange={(e) => setForm({ ...form, classId: e.target.value })}
                  className="field"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.section}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Gender">
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="field"
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </Field>
              <Field label="Phone">
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="field"
                />
              </Field>
              <Field label="Guardian">
                <input
                  value={form.guardian}
                  onChange={(e) => setForm({ ...form, guardian: e.target.value })}
                  className="field"
                />
              </Field>
              <Field label="Monthly fee">
                <input
                  type="number"
                  min="0"
                  value={form.monthlyFee}
                  onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })}
                  className="field"
                />
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="field"
                >
                  <option>Active</option>
                  <option>Left</option>
                </select>
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded-lg bg-[#0a6666] text-white font-semibold"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete student?"
        message="This will remove the student from the list."
      />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="text-xs font-semibold text-slate-500 mb-1 block">{label}</span>
      {children}
    </label>
  );
}
