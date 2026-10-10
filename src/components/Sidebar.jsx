import React from 'react';
import {
  LayoutDashboard,
  CalendarRange,
  Layers,
  LayoutGrid,
  Users,
  CreditCard,
  Ticket,
  BadgePercent,
  Percent,
  HandCoins,
  Wallet,
  ChartColumn,
  AlertCircle,
  Receipt,
  CalendarCheck,
  Megaphone,
  CalendarDays,
  NotebookPen,
  ClipboardCheck,
  ClipboardList,
  FileText,
  UserCog,
  Settings,
  DatabaseBackup,
  BellRing,
  Building,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const adminGroups = [
  {
    label: null,
    items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Academic Management',
    items: [
      { id: 'sessions', label: 'Academic Sessions', icon: CalendarRange },
      { id: 'classes', label: 'Classes', icon: Layers },
      { id: 'sections', label: 'Sections', icon: LayoutGrid },
      { id: 'students', label: 'Students', icon: Users },
      { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
      { id: 'notices', label: 'Notice Board', icon: Megaphone },
      { id: 'timetable', label: 'Timetable', icon: CalendarDays },
      { id: 'homework', label: 'Homework', icon: NotebookPen },
      { id: 'tests', label: 'Tests & Exams', icon: ClipboardList },
      { id: 'papers', label: 'Question Papers', icon: FileText },
      { id: 'exams', label: 'Exam Results', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Fee Management',
    items: [
      { id: 'fees', label: 'Fee Collection', icon: CreditCard },
      { id: 'vouchers', label: 'Vouchers', icon: Ticket },
      { id: 'fines', label: 'Fine Settings', icon: BadgePercent },
      { id: 'discounts', label: 'Discounts', icon: Percent },
      { id: 'concessions', label: 'Concessions', icon: HandCoins },
      { id: 'payment-methods', label: 'Payment Methods', icon: Wallet },
      { id: 'reminders', label: 'Fee Reminders', icon: BellRing },
    ],
  },
  {
    label: 'Reports',
    items: [
      { id: 'reports', label: 'Reports', icon: ChartColumn },
      { id: 'defaulters', label: 'Defaulters Report', icon: AlertCircle },
      { id: 'collection-report', label: 'Collection Report', icon: Receipt },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'staff', label: 'User Management', icon: UserCog },
      { id: 'expenses', label: 'Expenses', icon: Receipt },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'backup', label: 'Backup & Restore', icon: DatabaseBackup },
    ],
  },
];

const teacherGroups = [
  {
    label: null,
    items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'My Class',
    items: [
      { id: 'students', label: 'Students', icon: Users },
      { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
      { id: 'timetable', label: 'Timetable', icon: CalendarDays },
      { id: 'homework', label: 'Homework', icon: NotebookPen },
      { id: 'tests', label: 'Tests', icon: ClipboardList },
      { id: 'papers', label: 'Papers', icon: FileText },
      { id: 'exams', label: 'Exam Results', icon: ClipboardCheck },
      { id: 'notices', label: 'Notice Board', icon: Megaphone },
    ],
  },
];

export default function Sidebar({ activeTab, setActiveTab, role, open, onClose, session, onSessionChange, schoolName }) {
  const { setRole } = useAuth();
  const groups = role === 'Teacher' ? teacherGroups : adminGroups;

  return (
    <>
      {open && (
        <button type="button" aria-label="Close menu" className="fixed inset-0 bg-slate-950/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`w-[270px] max-w-[86vw] bg-[#0E1726] text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-50 transform transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-bold text-white tracking-wide truncate">{schoolName || 'Sky Education'}</h2>
            <span className="text-[11px] text-slate-400">School Fee Management</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close sidebar" className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 pb-3 overflow-y-auto">
          {groups.map((group) => (
            <div key={group.label || 'top'} className="mb-1">
              {group.label && (
                <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium mb-0.5 transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-2">
          <div className="flex bg-white/5 p-1 rounded-lg text-xs lg:hidden">
            <button type="button" onClick={() => setRole('Admin')} className={`flex-1 py-1.5 rounded-md font-medium ${role === 'Admin' ? 'bg-white text-blue-700' : 'text-slate-400'}`}>Admin</button>
            <button type="button" onClick={() => setRole('Teacher')} className={`flex-1 py-1.5 rounded-md font-medium ${role === 'Teacher' ? 'bg-white text-indigo-700' : 'text-slate-400'}`}>Teacher</button>
          </div>
          <label className="block bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2">
            <span className="text-[10px] uppercase tracking-wide text-slate-500">Active Session</span>
            <span className="flex items-center gap-1">
              <select
                value={session}
                onChange={(e) => onSessionChange(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white outline-none appearance-none"
              >
                <option className="text-slate-900">2024-2025</option>
                <option className="text-slate-900">2025-2026</option>
                <option className="text-slate-900">2026-2027</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </span>
          </label>
        </div>
      </aside>
    </>
  );
}
