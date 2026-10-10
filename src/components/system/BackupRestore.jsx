import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { DatabaseBackup, Download, Upload } from 'lucide-react';

const COLLECTIONS = ['students', 'fees', 'attendance', 'staff', 'expenses', 'notices', 'timetable', 'homework', 'exams', 'sessions', 'classes', 'sections', 'vouchers', 'fines', 'discounts', 'concessions', 'paymentMethods', 'reminders'];

export default function BackupRestore() {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const exportData = async () => {
    setBusy(true);
    setStatus('Preparing backup...');
    try {
      const payload = { exportedAt: new Date().toISOString(), collections: {} };
      for (const name of COLLECTIONS) {
        const snap = await getDocs(collection(db, name));
        payload.collections[name] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sky-education-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus('Backup downloaded.');
    } catch (err) {
      console.error(err);
      setStatus('Backup failed. Check the connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const importData = async (file) => {
    if (!file) return;
    setBusy(true);
    setStatus('Restoring backup...');
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const groups = payload.collections || {};
      let count = 0;
      for (const [name, rows] of Object.entries(groups)) {
        if (!Array.isArray(rows)) continue;
        for (const row of rows) {
          if (!row.id) continue;
          await setDoc(doc(db, name, row.id), row, { merge: true });
          count += 1;
        }
      }
      setStatus(`Restored ${count} records.`);
    } catch (err) {
      console.error(err);
      setStatus('That file could not be restored.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center">
          <DatabaseBackup className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Backup & Restore</h2>
          <p className="text-xs text-slate-500">Download every record, or merge a backup file back in</p>
        </div>
      </div>
      <button type="button" disabled={busy} onClick={exportData} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
        <Download className="w-4 h-4" />
        Download backup
      </button>
      <label className="w-full border border-dashed border-slate-300 rounded-xl py-6 flex flex-col items-center gap-2 text-sm text-slate-500 cursor-pointer hover:bg-slate-50">
        <Upload className="w-5 h-5" />
        Choose a backup JSON file
        <input
          type="file"
          accept="application/json"
          className="hidden"
          disabled={busy}
          onChange={(e) => importData(e.target.files?.[0])}
        />
      </label>
      {status && <p className="text-sm text-slate-600">{status}</p>}
    </div>
  );
}
