import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  CalendarCheck, 
  UserCheck, 
  Receipt,
  GraduationCap,
  Megaphone,
  CalendarDays,
  NotebookPen,
  ClipboardCheck,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, role, open, onClose }) {
  const { setRole } = useAuth();
  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#1E5B8C' },
    { id: 'students', label: 'Students', icon: Users, color: '#D4A017' },
    { id: 'fees', label: 'Fees & Defaulters', icon: CreditCard, color: '#E91E8C' },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, color: '#3B82F6' },
    { id: 'notices', label: 'Notice Board', icon: Megaphone, color: '#0284C7' },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays, color: '#4F46E5' },
    { id: 'homework', label: 'Homework', icon: NotebookPen, color: '#F97316' },
    { id: 'exams', label: 'Exam Results', icon: ClipboardCheck, color: '#7C3AED' },
    { id: 'staff', label: 'Staff Management', icon: UserCheck, color: '#8B5CF6' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, color: '#10B981' },
  ];

  const teacherNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#1E5B8C' },
    { id: 'students', label: 'My Students', icon: Users, color: '#D4A017' },
    { id: 'attendance', label: 'Mark Attendance', icon: CalendarCheck, color: '#3B82F6' },
    { id: 'notices', label: 'Notice Board', icon: Megaphone, color: '#0284C7' },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays, color: '#4F46E5' },
    { id: 'homework', label: 'Homework', icon: NotebookPen, color: '#F97316' },
    { id: 'exams', label: 'Exam Results', icon: ClipboardCheck, color: '#7C3AED' },
  ];

  const navItems = role === 'Teacher' ? teacherNavItems : adminNavItems;

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 bg-slate-950/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
    <aside
      className={`w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-50 border-r border-slate-800 shadow-xl transform transition-transform duration-300 ease-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:w-64`}
    >
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800 bg-slate-950">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-white tracking-wide truncate">Sky Education</h2>
          <span className="text-xs text-blue-400 font-medium">Management Portal</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Main Menu ({role})
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                  : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className="p-1.5 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: isActive ? item.color : 'rgba(255,255,255,0.05)',
                  color: isActive ? '#FFFFFF' : item.color
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Role Badge */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-3">
        <div className="flex bg-slate-800 p-1 rounded-lg text-xs lg:hidden">
          <button
            type="button"
            onClick={() => setRole('Admin')}
            className={`flex-1 py-1.5 rounded-md font-medium transition ${
              role === 'Admin' ? 'bg-white text-blue-700 font-semibold' : 'text-slate-400'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setRole('Teacher')}
            className={`flex-1 py-1.5 rounded-md font-medium transition ${
              role === 'Teacher' ? 'bg-white text-indigo-700 font-semibold' : 'text-slate-400'
            }`}
          >
            Teacher
          </button>
        </div>
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Current View</p>
            <p className="text-sm font-semibold text-white">{role} Mode</p>
          </div>
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${role === 'Admin' ? 'bg-amber-400' : 'bg-purple-400'}`}></span>
        </div>
      </div>
    </aside>
    </>
  );
}
