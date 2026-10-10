import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Printer,
  Download,
  RefreshCw,
  ChevronRight,
  Home,
  Pencil,
  Eye,
  Trash2,
  X,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { getModulePage } from '../../modulePages';
import { BRAND } from '../../navConfig';
import { readLocalCollection, writeLocalCollection, upsertLocal, removeLocal } from '../../demoStore';

function collectionName(moduleId) {
  return `mod:${moduleId}`;
}

function blankFromColumns(columns, formFields) {
  if (formFields?.length) {
    return Object.fromEntries(formFields.map((f) => [f.key, '']));
  }
  return Object.fromEntries((columns || []).map((c) => [c, '']));
}

function rowToForm(row, columns, formFields) {
  if (formFields?.length) {
    return Object.fromEntries(formFields.map((f) => [f.key, row?.[f.key] ?? '']));
  }
  return Object.fromEntries((columns || []).map((c) => [c, row?.[c] ?? '']));
}

function exportCsv(filename, columns, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [columns.map(esc).join(',')];
  rows.forEach((r) => lines.push(columns.map((c) => esc(r[c])).join(',')));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ModulePage({ moduleId, onNavigate }) {
  const meta = useMemo(() => getModulePage(moduleId), [moduleId]);
  const columns = meta.columns || [];
  const formFields = meta.formFields || null;
  const fieldDefs = formFields?.length
    ? formFields
    : columns.map((c) => ({ key: c, label: c }));

  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [flash, setFlash] = useState('');
  const [mode, setMode] = useState(null); // 'add' | 'edit' | 'view'
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [confirmId, setConfirmId] = useState(null);

  const storeKey = collectionName(moduleId);

  const reload = () => {
    const saved = readLocalCollection(storeKey);
    if (saved?.length) {
      setRows(saved);
      return;
    }
    const seed = (meta.rows || []).map((r) => ({ ...r }));
    writeLocalCollection(storeKey, seed);
    setRows(seed);
  };

  useEffect(() => {
    setQuery('');
    setMode(null);
    setEditingId(null);
    setConfirmId(null);
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      columns.some((c) => String(row[c] ?? '').toLowerCase().includes(q))
    );
  }, [rows, columns, query]);

  const toast = (msg) => {
    setFlash(msg);
    setTimeout(() => setFlash(''), 2800);
  };

  const openAdd = () => {
    setForm(blankFromColumns(columns, formFields));
    setEditingId(null);
    setMode('add');
  };

  const openEdit = (row) => {
    setForm(rowToForm(row, columns, formFields));
    setEditingId(row.id);
    setMode('edit');
  };

  const openView = (row) => {
    setForm(rowToForm(row, columns, formFields));
    setEditingId(row.id);
    setMode('view');
  };

  const save = () => {
    const required = fieldDefs[0]?.key;
    if (required && !String(form[required] || '').trim()) {
      toast(`Please fill “${fieldDefs[0].label}”.`);
      return;
    }
    const id = editingId || `${moduleId}-${Date.now()}`;
    const next = { id, ...form };
    // keep unknown keys from original on edit
    if (editingId) {
      const prev = rows.find((r) => r.id === editingId) || {};
      Object.assign(next, { ...prev, ...form, id });
    }
    const list = upsertLocal(storeKey, next);
    setRows(list);
    setMode(null);
    setEditingId(null);
    toast(editingId ? 'Record updated.' : 'Record added.');
  };

  const doDelete = (id) => {
    const list = removeLocal(storeKey, id);
    setRows(list);
    setConfirmId(null);
    if (editingId === id) {
      setMode(null);
      setEditingId(null);
    }
    toast('Record deleted.');
  };

  const doPrint = () => {
    window.print();
  };

  const doExport = () => {
    exportCsv(meta.title || moduleId, columns, filtered);
    toast('CSV downloaded.');
  };

  return (
    <div className="space-y-3 print:p-0">
      <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-slate-500 print:hidden">
        <button
          type="button"
          onClick={() => onNavigate?.({ id: 'home', href: 'dashboard', label: 'Home' })}
          className="inline-flex items-center gap-1 text-teal-700 hover:underline font-medium"
        >
          <Home className="w-3.5 h-3.5" />
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-800 font-semibold">{meta.title}</span>
        <span className="ml-auto text-[11px] text-slate-400">{BRAND.name}</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 flex flex-wrap items-start gap-3 justify-between bg-gradient-to-r from-[#0a6666] to-[#0d7a7a] print:bg-teal-800">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">{meta.title}</h1>
            <p className="text-[12px] text-teal-100 mt-0.5 max-w-2xl">{meta.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/15 text-white text-[12px] font-medium hover:bg-white/25"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              type="button"
              onClick={doPrint}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/15 text-white text-[12px] font-medium hover:bg-white/25"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              type="button"
              onClick={doExport}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white text-teal-800 text-[12px] font-semibold hover:bg-teal-50"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>

        <div className="px-4 py-3 flex flex-wrap items-end gap-2 bg-[#f7fafb] border-b border-slate-100 print:hidden">
          {(meta.filters || []).map((f) => (
            <label key={f} className="text-[11px] font-semibold text-slate-500">
              {f}
              <select className="mt-1 block min-w-[130px] border border-slate-200 rounded-md bg-white px-2 py-1.5 text-[13px] text-slate-700">
                <option>All</option>
                <option>This month</option>
                <option>This session</option>
              </select>
            </label>
          ))}
          <label className="text-[11px] font-semibold text-slate-500 flex-1 min-w-[200px]">
            Search
            <div className="relative mt-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search records..."
                className="w-full border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
            </div>
          </label>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#0a6666] text-white text-[12px] font-semibold hover:bg-teal-800 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add new
          </button>
          {(meta.actions || [])
            .filter((a) => !/add|create|new|register/i.test(a))
            .slice(0, 3)
            .map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => {
                  if (/export|download/i.test(action)) doExport();
                  else if (/print|report/i.test(action)) doPrint();
                  else openAdd();
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-teal-700 text-teal-800 text-[12px] font-semibold hover:bg-teal-50"
              >
                {action}
              </button>
            ))}
        </div>

        {flash && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-md bg-emerald-50 text-emerald-800 text-[13px] border border-emerald-200 flex items-center gap-2 print:hidden">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {flash}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-[#eef5f5] text-slate-600 border-b border-slate-200">
                <th className="px-3 py-2.5 w-10 font-semibold">#</th>
                {columns.map((col) => (
                  <th key={col} className="px-3 py-2.5 font-semibold whitespace-nowrap">
                    {col}
                  </th>
                ))}
                <th className="px-3 py-2.5 font-semibold text-right w-36 print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={row.id} className={`border-b border-slate-100 hover:bg-teal-50/50 ${idx % 2 ? 'bg-slate-50/40' : 'bg-white'}`}>
                  <td className="px-3 py-2.5 text-slate-400">{idx + 1}</td>
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-2.5 text-slate-700 whitespace-nowrap">
                      {String(row[col] ?? '—')}
                    </td>
                  ))}
                  <td className="px-3 py-2.5 print:hidden">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" title="View" onClick={() => openView(row)} className="p-1.5 rounded text-teal-700 hover:bg-teal-100">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" title="Edit" onClick={() => openEdit(row)} className="p-1.5 rounded text-sky-700 hover:bg-sky-100">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" title="Delete" onClick={() => setConfirmId(row.id)} className="p-1.5 rounded text-rose-600 hover:bg-rose-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-16 text-center text-slate-400">
                    No records yet — click <strong>Add new</strong> to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[12px] text-slate-500 bg-[#fafbfc] print:hidden">
          <span>
            Showing <strong className="text-slate-700">{filtered.length}</strong> of{' '}
            <strong className="text-slate-700">{rows.length}</strong> records
          </span>
        </div>
      </div>

      {/* Add / Edit / View modal */}
      {mode && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/45 print:hidden">
          <div className="w-full max-w-xl bg-white rounded-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-4 py-3 bg-[#0a6666] text-white font-semibold flex items-center justify-between">
              <span>
                {mode === 'add' ? 'Add' : mode === 'edit' ? 'Edit' : 'View'} — {meta.title}
              </span>
              <button type="button" onClick={() => setMode(null)} className="p-1 rounded hover:bg-white/15">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto">
              {fieldDefs.map((f) => (
                <label key={f.key} className="text-[11px] font-semibold text-slate-500">
                  {f.label}
                  {mode === 'view' ? (
                    <div className="mt-1 w-full border border-slate-100 rounded-md px-3 py-2 text-[13px] text-slate-800 bg-slate-50 min-h-[38px]">
                      {String(form[f.key] ?? '—')}
                    </div>
                  ) : (
                    <input
                      value={form[f.key] ?? ''}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/25"
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setMode(null)}
                className="px-3 py-1.5 rounded-md border border-slate-200 text-[13px] font-medium text-slate-600"
              >
                {mode === 'view' ? 'Close' : 'Cancel'}
              </button>
              {mode === 'view' ? (
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-sky-600 text-white text-[13px] font-semibold"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={save}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#0a6666] text-white text-[13px] font-semibold"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmId && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-900/45 print:hidden">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="px-4 py-3 font-semibold text-slate-800 border-b border-slate-100">Delete record?</div>
            <p className="px-4 py-3 text-[13px] text-slate-600">This will remove the record from this module. You can add it again later.</p>
            <div className="px-4 py-3 flex justify-end gap-2 bg-slate-50 border-t border-slate-100">
              <button type="button" onClick={() => setConfirmId(null)} className="px-3 py-1.5 rounded-md border border-slate-200 text-[13px]">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => doDelete(confirmId)}
                className="px-3 py-1.5 rounded-md bg-rose-600 text-white text-[13px] font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
