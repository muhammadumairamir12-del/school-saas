import React, { useState } from 'react';
import { getState, updateSettings, resetDemoData } from '../../store';

export default function SettingsPage() {
  const [form, setForm] = useState(() => getState().settings);
  const [saved, setSaved] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => {
    if (!window.confirm('Reset all demo school data? Your current data will be cleared.')) return;
    resetDemoData();
    setForm(getState().settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-xl space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="font-bold text-slate-800 mb-1">School profile</h2>
        <p className="text-sm text-slate-500 mb-4">
          Basic info used across the app. Keep it simple.
        </p>

        <form onSubmit={submit} className="space-y-3">
          <label className="block text-sm">
            <span className="text-xs font-semibold text-slate-500 mb-1 block">School name</span>
            <input
              value={form.schoolName}
              onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
              className="field"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold text-slate-500 mb-1 block">Campus</span>
            <input
              value={form.campus}
              onChange={(e) => setForm({ ...form, campus: e.target.value })}
              className="field"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold text-slate-500 mb-1 block">Session</span>
            <input
              value={form.session}
              onChange={(e) => setForm({ ...form, session: e.target.value })}
              className="field"
              placeholder="2026-2027"
            />
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-xs font-semibold text-slate-500 mb-1 block">Phone</span>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="field"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-semibold text-slate-500 mb-1 block">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="field"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-xs font-semibold text-slate-500 mb-1 block">Address</span>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="field"
            />
          </label>

          {saved && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              Saved.
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-[#0a6666] text-white font-semibold"
            >
              Save settings
            </button>
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-700"
            >
              Reset demo data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
