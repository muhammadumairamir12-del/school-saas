import React, { useState } from 'react';
import { Settings, RefreshCw, Palette } from 'lucide-react';
import { loadFullDemoData } from '../../demoStore';

const DEFAULTS = {
  schoolName: 'SkyEagle Demo School',
  branch: 'Main Branch',
  currency: 'Rs.',
  dueDay: '10',
  theme: 'blue',
};

const THEMES = [
  { id: 'blue', label: 'Ocean Blue', primary: '#2563EB' },
  { id: 'teal', label: 'Teal', primary: '#0D9488' },
  { id: 'indigo', label: 'Indigo', primary: '#4F46E5' },
  { id: 'emerald', label: 'Emerald', primary: '#059669' },
];

export function readSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('sky-settings') || '{}') };
  } catch {
    return DEFAULTS;
  }
}

export function applyTheme(themeId) {
  const t = THEMES.find((x) => x.id === themeId) || THEMES[0];
  document.documentElement.style.setProperty('--sky-primary', t.primary);
  document.documentElement.dataset.theme = t.id;
}

export default function SettingsPage({ onSaved }) {
  const [form, setForm] = useState(readSettings);
  const [saved, setSaved] = useState(false);
  const [demoStatus, setDemoStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const save = (e) => {
    e.preventDefault();
    localStorage.setItem('sky-settings', JSON.stringify(form));
    applyTheme(form.theme);
    onSaved?.(form);
    setSaved(true);
  };

  const reloadDemo = async () => {
    setBusy(true);
    setDemoStatus('Loading full mock school data...');
    try {
      localStorage.removeItem('sky-demo-loaded');
      await loadFullDemoData();
      setDemoStatus('Demo data loaded. Refresh the page to see every module filled.');
    } catch (err) {
      console.error(err);
      setDemoStatus('Loaded into local storage. Refresh if some lists look empty.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl">
      <form onSubmit={save} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Settings & Theme</h2>
            <p className="text-xs text-slate-500">School identity and accent color</p>
          </div>
        </div>
        {[
          ['schoolName', 'School name'],
          ['branch', 'Branch'],
          ['currency', 'Currency label'],
          ['dueDay', 'Fee due day of month'],
        ].map(([key, label]) => (
          <label key={key} className="block text-xs font-semibold text-slate-600">
            {label}
            <input
              value={form[key]}
              onChange={(e) => { setSaved(false); setForm({ ...form, [key]: e.target.value }); }}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-normal"
            />
          </label>
        ))}

        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" /> Accent theme
          </p>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setSaved(false); setForm({ ...form, theme: t.id }); applyTheme(t.id); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold ${
                  form.theme === t.id ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-600'
                }`}
              >
                <span className="w-4 h-4 rounded-full" style={{ background: t.primary }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-sm">
          Save settings
        </button>
        {saved && <p className="text-sm text-emerald-600 font-medium">Settings saved on this device.</p>}
      </form>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">Demo mock data</h3>
        <p className="text-xs text-slate-500">
          Reload a full sample school: 12 students, 8 staff, classes, sections, tests, papers, results, fees, vouchers, and more.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={reloadDemo}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
          {busy ? 'Loading...' : 'Load / reset full demo data'}
        </button>
        {demoStatus && <p className="text-sm text-slate-600">{demoStatus}</p>}
      </div>
    </div>
  );
}
