import React, { useEffect, useMemo, useRef, useState } from 'react';
import { db } from '../../firebase';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import { Plus, Trash2, Pencil, Search, Filter } from 'lucide-react';
import { readLocalCollection, writeLocalCollection, upsertLocal, removeLocal } from '../../demoStore';

function blankForm(fields) {
  return Object.fromEntries(fields.map((f) => [f.key, f.default ?? '']));
}

function rowToForm(fields, row) {
  return Object.fromEntries(fields.map((f) => [f.key, row?.[f.key] ?? f.default ?? '']));
}

export default function CatalogPage({
  title,
  subtitle,
  collectionName,
  fields,
  seed = [],
  icon: Icon,
  accent = 'bg-blue-600',
  canEdit = true,
  canDelete = true,
  canAdd = true,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(() => blankForm(fields));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const triedSeed = useRef(false);
  const useLocal = useRef(false);

  const statusField = fields.find((f) => f.key === 'status');

  useEffect(() => {
    triedSeed.current = false;
    useLocal.current = false;
    setLoading(true);

    const applyRows = (list) => {
      setRows(list);
      setLoading(false);
    };

    const unsub = onSnapshot(
      collection(db, collectionName),
      async (snap) => {
        if (useLocal.current) return;
        if (snap.empty && seed.length && !triedSeed.current) {
          triedSeed.current = true;
          const local = readLocalCollection(collectionName);
          if (local?.length) {
            applyRows(local);
            return;
          }
          try {
            for (const item of seed) await setDoc(doc(db, collectionName, item.id), item, { merge: true });
            writeLocalCollection(collectionName, seed);
          } catch (err) {
            console.error(err);
            writeLocalCollection(collectionName, seed);
            useLocal.current = true;
            applyRows(seed);
          }
          return;
        }
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (list.length) writeLocalCollection(collectionName, list);
        applyRows(list.length ? list : (readLocalCollection(collectionName) || seed));
      },
      () => {
        useLocal.current = true;
        const local = readLocalCollection(collectionName) || seed;
        if (!readLocalCollection(collectionName) && seed.length) writeLocalCollection(collectionName, seed);
        applyRows(readLocalCollection(collectionName) || seed);
      }
    );
    return () => unsub();
  }, [collectionName, seed]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter !== 'All' && String(row.status || '') !== statusFilter) return false;
      if (!q) return true;
      return fields.some((f) => String(row[f.key] ?? '').toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter, fields]);

  const openCreate = () => {
    setEditing(null);
    setForm(blankForm(fields));
    setError('');
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm(rowToForm(fields, row));
    setError('');
    setOpen(true);
  };

  const applyLocalSave = (payload) => {
    const list = upsertLocal(collectionName, payload);
    setRows([...list]);
  };

  const save = async (e) => {
    e.preventDefault();
    const req = fields.find((f) => f.required && !String(form[f.key] ?? '').trim());
    if (req) {
      setError(`${req.label} is required.`);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const id = editing?.id || `${collectionName}-${Date.now()}`;
      const payload = {
        id,
        updatedAt: new Date().toISOString(),
        ...(editing ? {} : { createdAt: new Date().toISOString() }),
      };
      fields.forEach((f) => {
        payload[f.key] = f.type === 'number' ? Number(form[f.key] || 0) : String(form[f.key] ?? '').trim();
      });

      if (useLocal.current) {
        applyLocalSave(payload);
      } else {
        try {
          await setDoc(doc(db, collectionName, id), payload, { merge: true });
          upsertLocal(collectionName, payload);
        } catch (err) {
          console.warn(err);
          useLocal.current = true;
          applyLocalSave(payload);
        }
      }
      setOpen(false);
      setEditing(null);
      setForm(blankForm(fields));
    } catch (err) {
      console.error(err);
      setError('Could not save this record.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!removing) return;
    try {
      if (!useLocal.current) {
        try {
          await deleteDoc(doc(db, collectionName, removing.id));
        } catch {
          useLocal.current = true;
        }
      }
      const list = removeLocal(collectionName, removing.id);
      setRows([...list]);
    } catch (err) {
      console.error(err);
    }
    setRemoving(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 ${accent}`}>
            {Icon ? <Icon className="w-5 h-5" /> : null}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-800 truncate">{title}</h2>
            <p className="text-xs text-slate-500">{subtitle} · {filtered.length} records</p>
          </div>
        </div>
        {canAdd && (
          <button type="button" onClick={openCreate} className="self-start bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Add new
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {statusField ? (
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm appearance-none"
            >
              <option value="All">All statuses</option>
              {(statusField.options || ['Active', 'Inactive']).map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>

      <div className="space-y-3 md:hidden">
        {loading ? (
          <p className="p-6 text-center text-sm text-slate-500">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400 bg-white rounded-2xl border border-slate-200">No records match.</p>
        ) : (
          filtered.map((row) => (
            <article key={row.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{row[fields[0]?.key] || row.id}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {fields.slice(1, 3).map((f) => row[f.key]).filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {canEdit && (
                    <button type="button" aria-label="Edit" onClick={() => openEdit(row)} className="p-2 text-blue-600 bg-blue-50 rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button type="button" aria-label="Delete" onClick={() => setRemoving(row)} className="p-2 text-rose-600 bg-rose-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {fields.slice(0, 6).map((f) => (
                  <div key={f.key} className="bg-slate-50 rounded-lg px-2.5 py-2">
                    <dt className="text-slate-400 font-medium">{f.label}</dt>
                    <dd className="text-slate-800 font-semibold truncate">{row[f.key] ?? '—'}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))
        )}
      </div>

      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-400">No records match.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[640px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100 bg-slate-50/80">
                  {fields.map((f) => <th key={f.key} className="px-4 py-3 font-semibold">{f.label}</th>)}
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    {fields.map((f) => (
                      <td key={f.key} className="px-4 py-3 text-slate-700">
                        {f.key === 'status' ? (
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                            String(row.status).includes('Active') || row.status === 'Paid' || row.status === 'Published' || row.status === 'Ready' || row.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : String(row.status).includes('Unpaid') || row.status === 'Draft'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {row[f.key] ?? '—'}
                          </span>
                        ) : (
                          row[f.key] ?? '—'
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {canEdit && (
                        <button type="button" aria-label="Edit" onClick={() => openEdit(row)} className="inline-flex p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg mr-1">
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button type="button" aria-label="Delete" onClick={() => setRemoving(row)} className="inline-flex p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? `Edit ${title}` : `Add ${title}`} maxWidth="max-w-lg">
        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}
        <form onSubmit={save} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((f) => (
              <label key={f.key} className={`block text-xs font-semibold text-slate-600 ${f.type === 'textarea' || f.full ? 'sm:col-span-2' : ''}`}>
                {f.label}{f.required ? ' *' : ''}
                {f.type === 'select' ? (
                  <select
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-normal"
                  >
                    {(f.options || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-normal"
                  />
                ) : (
                  <input
                    type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'month' ? 'month' : 'text'}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-normal"
                  />
                )}
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm disabled:opacity-60">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={confirmDelete}
        title="Delete record"
        message={removing ? `Delete “${removing[fields[0]?.key] || removing.id}”? This cannot be undone.` : ''}
      />
    </div>
  );
}
