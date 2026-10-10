import React, { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import { listClasses, saveClass, removeClass, listStudents } from '../../store';

const empty = { name: '', section: 'A', capacity: 35 };

export default function ClassesPage() {
  const [tick, setTick] = useState(0);
  const classes = useMemo(() => listClasses(), [tick]);
  const students = useMemo(() => listStudents(), [tick]);
  const [form, setForm] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const countIn = (classId) =>
    students.filter((s) => s.classId === classId && s.status !== 'Left').length;

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    saveClass({
      ...form,
      capacity: Number(form.capacity) || 30,
      id: form.id || `c${Date.now()}`,
    });
    setForm(null);
    setTick((n) => n + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-3">
        <p className="text-sm text-slate-600">
          Set up classes and sections for your school. Students are enrolled into these.
        </p>
        <button
          type="button"
          onClick={() => setForm({ ...empty })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a6666] text-white rounded-lg text-sm font-semibold shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add class
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {classes.map((c) => {
          const enrolled = countIn(c.id);
          return (
            <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-800">
                    {c.name} - {c.section}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {enrolled} / {c.capacity} students
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setForm({ ...c })}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(c.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-700 rounded-full"
                  style={{
                    width: `${Math.min(100, (enrolled / Math.max(c.capacity, 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? 'Edit class' : 'Add class'}
      >
        {form && (
          <form onSubmit={submit} className="space-y-3">
            <label className="block text-sm">
              <span className="text-xs font-semibold text-slate-500 mb-1 block">Class name</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="field"
                placeholder="Class 1 / Nursery / KG"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="text-xs font-semibold text-slate-500 mb-1 block">Section</span>
                <input
                  required
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                  className="field"
                  placeholder="A"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-semibold text-slate-500 mb-1 block">Capacity</span>
                <input
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="field"
                />
              </label>
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
        onConfirm={() => {
          removeClass(deleteId);
          setDeleteId(null);
          setTick((n) => n + 1);
        }}
        title="Delete class?"
        message="Students linked to this class will keep the old class id until you reassign them."
      />
    </div>
  );
}
