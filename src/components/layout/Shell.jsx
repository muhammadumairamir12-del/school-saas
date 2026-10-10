import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCog,
  School,
  CalendarCheck,
  Wallet,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getState } from '../../store';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'staff', label: 'Staff', icon: UserCog },
  { id: 'classes', label: 'Classes', icon: School },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'fees', label: 'Fees', icon: Wallet },
  { id: 'diary', label: 'Diary', icon: BookOpen },
  { id: 'notices', label: 'Notices', icon: Megaphone },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Shell({ page, onNavigate, children }) {
  const { currentUser, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const settings = getState().settings;

  const items = role === 'Teacher'
    ? NAV.filter((n) => ['dashboard', 'students', 'attendance', 'diary', 'notices'].includes(n.id))
    : NAV;

  return (
    <div className="min-h-screen bg-[#f0f4f5] flex">
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#064e4e] text-white flex flex-col transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-amber-300" />
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate leading-tight">{settings.schoolName}</p>
            <p className="text-xs text-teal-200 truncate">{settings.session}</p>
          </div>
          <button type="button" className="lg:hidden ml-auto p-1" onClick={() => setOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  active
                    ? 'bg-white text-teal-900 font-semibold'
                    : 'text-teal-50 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {item.id === 'diary' ? (role === 'Admin' ? 'View All Diaries' : 'Diary') : item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-teal-200 truncate mb-2">
            {currentUser?.displayName} · {role}
          </p>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setOpen(true)}
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 capitalize">
              {page === 'diary' ? (role === 'Admin' ? 'View All Diaries' : 'Teacher Diary') : page}
            </h1>
            <p className="text-xs text-slate-500">{settings.campus}</p>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
