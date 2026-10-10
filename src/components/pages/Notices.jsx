import React, { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import { listNotices, saveNotice, removeNotice } from '../../store';

export default function NoticesPage() {
  const [tick, setTick] = useState(0);
  const notices = useMemo(() => listNotices(), [tick]);
  const [form, setForm] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    saveNotice({
      ...form,
      id: form.id || `n${Date.now()}`,
      date: form.date || new Date().toISOString().slice(0, 10),
    });
    setForm(null);
    setTick((n) => n + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-3">
        <p className="text-sm text-slate-600">Post simple notices for staff and parents.</p>
        <button
          type="button"
          onClick={() =>
            setForm({ title: '', body: '', date: new Date().toISOString().slice(0, 10) })
          }
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a6666] text-white rounded-lg text-sm font-semibold shrink-0"
        >
          <Plus className="w-4 h-4" />
          New notice
        </button>
      </div>

      <div className="space-y-3">
        {notices.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
            No notices yet.
          </div>
        ) : (
          notices.map((n) => (
            <article
              key={n.id}
              className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800">{n.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{n.date}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteId(n.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap">{n.body}</p>
            </article>
          ))
        )}
      </div>

      <Modal isOpen={!!form} onClose={() => setForm(null)} title="New notice">
        {form && (
          <form onSubmit={submit} className="space-y-3">
            <label className="block text-sm">
              <span className="text-xs font-semibold text-slate-500 mb-1 block">Title</span>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="field"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold text-slate-500 mb-1 block">Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="field"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold text-slate-500 mb-1 block">Message</span>
              <textarea
                rows={4}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="field"
              />
            </label>
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
                Publish
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          removeNotice(deleteId);
          setDeleteId(null);
          setTick((n) => n + 1);
        }}
        title="Delete notice?"
        message="This notice will be removed."
      />
    </div>
  );
}
