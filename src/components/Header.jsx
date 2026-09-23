import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, BookOpen, Menu } from 'lucide-react';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  students: 'Students',
  fees: 'Fees',
  attendance: 'Attendance',
  staff: 'Staff',
  expenses: 'Expenses',
  notices: 'Notices',
  timetable: 'Timetable',
  homework: 'Homework',
  exams: 'Exams',
};

export default function Header({ onMenuClick, activeTab }) {
  const { currentUser, role, setRole, assignedClass, logout } = useAuth();
  const pageTitle = PAGE_TITLES[activeTab] || 'Sky Education';

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-3 sm:px-6 flex items-center justify-between shadow-xs gap-2">
      {/* Left Title & Branch info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden shrink-0 p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-bold text-slate-800 tracking-tight truncate">
            <span className="lg:hidden">{pageTitle}</span>
            <span className="hidden lg:inline">Sky Education</span>
          </h1>
          <p className="lg:hidden text-[11px] text-slate-400 leading-none">Sky Education</p>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 shrink-0">
          Main Branch
        </span>
        <span className="hidden md:inline-block text-xs text-slate-400 shrink-0">| Academic Year 2024-2025</span>
      </div>

      {/* Right User Actions & Role Switcher */}
      <div className="flex items-center gap-4">
        {/* Role Toggle Switcher (for Demo convenience) */}
        <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setRole('Admin')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              role === 'Admin' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setRole('Teacher')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              role === 'Teacher' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Teacher
          </button>
        </div>

        {role === 'Teacher' && (
          <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            {assignedClass}
          </span>
        )}

        {/* User Profile Info */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-300 text-slate-700">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800">
              {currentUser?.displayName || (role === 'Admin' ? 'Administrator' : 'Teacher View')}
            </p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <Shield className="w-2.5 h-2.5 text-blue-600" />
              {role}
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
