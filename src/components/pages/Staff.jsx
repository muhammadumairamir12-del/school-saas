import React, { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import { listStaff, saveStaff, removeStaff, money } from '../../store';

const empty = {
  name: '',
  role: 'Teacher',
  subject: '',
  phone: '',
  salary: 40000,
  status: 'Active',
};

export default function StaffPage() {
  const [tick, setTick] = useState(0);
  const staff = useMemo(() => listStaff(), [tick]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = staff.filter((s) => {
    if (!q.trim()) return true;
    const hay = `${s.name} ${s.role} ${s.subject} ${s.phone}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    saveStaff({
      ...form,
      salary: Number(form.salary) || 0,
      id: form.id || `t${Date.now()}`,
    });
    setForm(null);
    setTick((n) => n + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search staff…"
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/25"
          />
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...empty })}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0a6666] text-white rounded-lg text-sm font-semibold hover:bg-[#064e4e]"
        >
          <Plus className="w-4 h-4" />
          Add staff
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Role</th>
                <th className="text-left px-4 py-3 font-semibold">Subject</th>
                <th className="text-left px-4 py-3 font-semibold">Phone</th>
                <th className="text-left px-4 py-3 font-semibold">Salary</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{s.role}</td>
                  <td className="px-4 py-3 text-slate-600">{s.subject || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.phone}</td>
                  <td className="px-4 py-3">{money(s.salary)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setForm({ ...s })}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? 'Edit staff' : 'Add staff'}
      >
        {form && (
          <form onSubmit={submit} className="space-y-3">
            <label className="block text-sm">
              <span className="text-xs font-semibold text-slate-500 mb-1 block">Name</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="field"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="text-xs font-semibold text-slate-500 mb-1 block">Role</span>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="field"
                >
                  <option>Teacher</option>
                  <option>Admin</option>
                  <option>Accountant</option>
                  <option>Support</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-xs font-semibold text-slate-500 mb-1 block">Subject</span>
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="field"
                  placeholder="Math / English…"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-semibold text-slate-500 mb-1 block">Phone</span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="field"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-semibold text-slate-500 mb-1 block">Salary</span>
                <input
                  type="number"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
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
          removeStaff(deleteId);
          setDeleteId(null);
          setTick((n) => n + 1);
        }}
        title="Delete staff?"
        message="This person will be removed from the staff list."
      />
    </div>
  );
}
