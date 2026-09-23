import React, { useEffect, useRef, useState } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { CLASS_SECTIONS } from '../../schoolData';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import { Megaphone, Plus, Search, Trash2, Pin } from 'lucide-react';

const SAMPLE = [
  {
    id: 'notice-welcome',
    title: 'Parent-teacher meeting',
    message: 'PTM for all classes is on Saturday, 10:00 AM in the main hall. Please inform guardians.',
    audience: 'All',
    pinned: true,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'notice-sports',
    title: 'Sports day practice',
    message: 'Class 10 - A will practice for the annual sports day after the last period this week.',
    audience: 'Class 10 - A',
    pinned: false,
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'notice-fee',
    title: 'Fee reminder',
    message: 'Monthly fee for this month is due by the 10th. Defaulters will appear on the fee report.',
    audience: 'All',
    pinned: false,
    date: new Date().toISOString().split('T')[0],
  },
];

export default function NoticeBoard() {
  const { role, assignedClass } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('All');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', message: '', audience: 'All', pinned: false });
  const [removing, setRemoving] = useState(null);
  const triedSeed = useRef(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notices'), async (snap) => {
      if (snap.empty && !triedSeed.current) {
        triedSeed.current = true;
        try {
          for (const item of SAMPLE) {
            await setDoc(doc(db, 'notices', item.id), { ...item, createdAt: new Date().toISOString() });
          }
        } catch (err) {
          console.error(err);
          setNotices(SAMPLE);
          setLoading(false);
        }
        return;
      }
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => Number(b.pinned) - Number(a.pinned) || String(b.date).localeCompare(String(a.date)));
      setNotices(list);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const visible = notices.filter((n) => {
    if (role === 'Teacher' && n.audience !== 'All' && n.audience !== assignedClass) return false;
    if (role === 'Admin' && audienceFilter !== 'All' && n.audience !== audienceFilter && n.audience !== 'All') return false;
    const q = search.toLowerCase();
    return !q || n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q);
  });

  const saveNotice = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      setError('Add a title and a message.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const id = `notice-${Date.now()}`;
      await setDoc(doc(db, 'notices', id), {
        id,
        title: form.title.trim(),
        message: form.message.trim(),
        audience: form.audience,
        pinned: form.pinned,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      });
      setOpen(false);
      setForm({ title: '', message: '', audience: 'All', pinned: false });
    } catch (err) {
      console.error(err);
      setError('Could not save the notice.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!removing) return;
    try {
      await deleteDoc(doc(db, 'notices', removing.id));
    } catch (err) {
      console.error(err);
    }
    setRemoving(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Notice Board</h2>
            <p className="text-xs text-slate-500">Announcements for the school and for each class</p>
          </div>
        </div>
        {role === 'Admin' && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md flex items-center gap-2 self-start"
          >
            <Plus className="w-4 h-4" />
            New Notice
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notices..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        {role === 'Admin' ? (
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="All">All audiences</option>
            {CLASS_SECTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        ) : (
          <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 font-medium">
            Showing notices for All and {assignedClass}
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm">Loading notices...</div>
      ) : visible.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">No notices match this view.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((notice) => (
            <article key={notice.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {notice.pinned && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{notice.audience}</span>
                    <span className="text-[11px] text-slate-400">{notice.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-800">{notice.title}</h3>
                </div>
                {role === 'Admin' && (
                  <button type="button" onClick={() => setRemoving(notice)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" aria-label="Delete notice">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{notice.message}</p>
            </article>
          ))}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Post a notice">
        {error && <div className="mb-3 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm">{error}</div>}
        <form onSubmit={saveNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Audience</label>
            <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
              <option value="All">Whole school</option>
              {CLASS_SECTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
            Pin this notice
          </label>
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm disabled:opacity-60">
            {saving ? 'Saving...' : 'Publish notice'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={confirmDelete}
        title="Delete notice"
        message={removing ? `Remove “${removing.title}” from the notice board?` : ''}
      />
    </div>
  );
}
