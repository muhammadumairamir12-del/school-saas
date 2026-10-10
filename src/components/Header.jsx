import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Bell, Menu, Search, ShieldCheck } from 'lucide-react';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  students: 'Students',
  fees: 'Fee Collection',
  defaulters: 'Defaulters Report',
  'collection-report': 'Collection Report',
  reports: 'Reports',
  attendance: 'Attendance',
  staff: 'User Management',
  expenses: 'Expenses',
  notices: 'Notice Board',
  timetable: 'Timetable',
  homework: 'Homework',
  exams: 'Exam Results',
  tests: 'Tests & Exams',
  papers: 'Question Papers',
  sessions: 'Academic Sessions',
  classes: 'Classes',
  sections: 'Sections',
  vouchers: 'Vouchers',
  fines: 'Fine Settings',
  discounts: 'Discounts',
  concessions: 'Concessions',
  'payment-methods': 'Payment Methods',
  reminders: 'Fee Reminders',
  settings: 'Settings',
  backup: 'Backup & Restore',
};

export default function Header({ onMenuClick, activeTab, session, schoolName, onSearch }) {
  const { currentUser, role, setRole, logout } = useAuth();
  const pageTitle = PAGE_TITLES[activeTab] || 'Dashboard';
  const [query, setQuery] = useState('');
  const [notices, setNotices] = useState([]);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notices'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => Number(b.pinned) - Number(a.pinned));
      setNotices(list.slice(0, 4));
    }, () => {});
    return () => unsub();
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    onSearch?.(query.trim());
  };

  return (
    <header className="sticky top-0 z-20 bg-[#F4F7FB]/95 backdrop-blur px-3 sm:px-6 py-3 flex items-center gap-3">
      <button type="button" onClick={onMenuClick} aria-label="Open menu" className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-700">
        <Menu className="w-5 h-5" />
      </button>

      <div className="min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate">
          {schoolName} {pageTitle}
        </h1>
        <p className="text-[11px] text-slate-400">Active Session: {session}</p>
      </div>

      <form onSubmit={submitSearch} className="flex-1 max-w-md mx-auto hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, invoices..."
            className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button type="button" aria-label="Notifications" onClick={() => setShowNotes((v) => !v)} className="relative w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500">
            <Bell className="w-4 h-4" />
            {notices.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />}
          </button>
          {showNotes && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-30">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Notices</p>
              {notices.length === 0 ? (
                <p className="px-2 py-3 text-sm text-slate-400">No notices yet.</p>
              ) : notices.map((n) => (
                <div key={n.id} className="px-2 py-2 rounded-xl hover:bg-slate-50">
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-full p-0.5 text-[11px]">
          <button type="button" onClick={() => setRole('Admin')} className={`px-2 py-1 rounded-full font-semibold ${role === 'Admin' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Admin</button>
          <button type="button" onClick={() => setRole('Teacher')} className={`px-2 py-1 rounded-full font-semibold ${role === 'Teacher' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Teacher</button>
        </div>

        <button type="button" onClick={logout} className="flex items-center gap-2 pl-1" title="Logout">
          <span className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
            {(currentUser?.displayName || role || 'A').slice(0, 1)}
          </span>
          <span className="hidden lg:block text-left">
            <span className="block text-xs font-semibold text-slate-800 leading-tight">{role === 'Admin' ? 'Admin' : 'Teacher'}</span>
            <span className="block text-[10px] text-slate-400">{role === 'Admin' ? 'Super Admin' : 'Class Teacher'}</span>
          </span>
        </button>

        <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Live & Secure
        </span>
      </div>
    </header>
  );
}
