import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Home,
  DoorOpen,
  GraduationCap,
  Sparkles,
  Wallet,
  ClipboardCheck,
  Users,
  LayoutGrid,
  Settings,
  FileText,
  MessageSquare,
  LifeBuoy,
  Search,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Menu,
  X,
  List,
  Building2,
  CircleDot,
} from 'lucide-react';
import {
  MANAGEMENT_MENUS,
  CONFIG_MENUS,
  CONFIG_LINKS,
  flattenNavItems,
  BRAND,
} from '../../navConfig';
import { useAuth } from '../../context/AuthContext';

const ICONS = {
  home: Home,
  'front-desk': DoorOpen,
  admissions: GraduationCap,
  extras: Sparkles,
  finance: Wallet,
  'exam-att': ClipboardCheck,
  hrm: Users,
  general: LayoutGrid,
  core: Settings,
  'config-exam': Settings,
  'config-hrm': Settings,
  admin: Building2,
  docs: FileText,
  messages: MessageSquare,
  support: LifeBuoy,
};

function MenuDropdown({ menu, open, onToggle, onNavigate, align = 'left' }) {
  const Icon = ICONS[menu.icon] || LayoutGrid;
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const update = () => {
      const r = btnRef.current.getBoundingClientRect();
      if (align === 'right') {
        setPos({ top: r.bottom, left: Math.max(8, r.right - 300) });
      } else {
        setPos({ top: r.bottom, left: Math.max(8, Math.min(r.left, window.innerWidth - 320)) });
      }
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, align]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        className={`flex items-center gap-1 px-2.5 py-[10px] text-[13px] font-medium whitespace-nowrap transition ${
          open ? 'bg-[#f6d365] text-[#0a3d3d]' : 'text-white hover:bg-white/10'
        }`}
      >
        <Icon className={`w-[15px] h-[15px] shrink-0 ${open ? 'text-[#0a3d3d]' : 'text-[#f6d365]'}`} />
        <span>{menu.label}</span>
        {menu.groups && <ChevronDown className="w-3 h-3 opacity-70" />}
      </button>

      {open && menu.groups && (
        <div
          data-nav-dropdown="1"
          className="fixed z-[9999] min-w-[300px] max-w-[360px] max-h-[min(72vh,560px)] overflow-y-auto bg-white border border-slate-200 shadow-2xl rounded-b-md"
          style={{ top: pos.top, left: pos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          {menu.groups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'border-t border-slate-100' : ''}>
              {group.title && (
                <p className="px-3 pt-2.5 pb-1 text-[12px] font-bold text-slate-700 flex items-center gap-1.5 sticky top-0 bg-white z-10">
                  <CircleDot className="w-3 h-3 text-sky-500" />
                  {group.title}
                </p>
              )}
              {group.items.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavigate(it);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-[8px] text-left text-[13px] text-[#1565c0] hover:bg-[#0a6666] hover:text-white transition"
                >
                  <span className="w-4 h-4 rounded-sm bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                    <CircleDot className="w-2.5 h-2.5" />
                  </span>
                  <span className="flex-1 leading-snug">{it.label}</span>
                  {it.badge != null && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full px-1.5">{it.badge}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopNav({ onNavigate, activeMenuId, searchQuery, onSearchChange }) {
  const { logout, role } = useAuth();
  const [openMenu, setOpenMenu] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const rootRef = useRef(null);
  const allItems = useMemo(() => flattenNavItems(), []);

  useEffect(() => {
    const onDoc = (e) => {
      const t = e.target;
      if (t?.closest?.('[data-nav-dropdown="1"]')) return;
      if (rootRef.current?.contains(t)) {
        // clicks inside header on non-dropdown still close other menus unless on a menu button
        return;
      }
      setOpenMenu(null);
      setProfileOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const searchHits = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (q.length < 2) return [];
    return allItems.filter((it) => it.label?.toLowerCase().includes(q)).slice(0, 12);
  }, [searchQuery, allItems]);

  const goHome = () => {
    onNavigate({ id: 'home', label: 'Home', href: 'dashboard' });
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const handleNav = (item) => {
    onNavigate({ ...item, menuId: item.menuId || openMenu || item.id });
    setOpenMenu(null);
    setProfileOpen(false);
    setMobileOpen(false);
  };

  const toggleMenu = (id) => {
    setProfileOpen(false);
    setOpenMenu((cur) => (cur === id ? null : id));
  };

  return (
    <header ref={rootRef} className="sticky top-0 z-[100] shadow-md bg-[#005a5a] overflow-visible">
      <div className="hidden md:block bg-[#005a5a] text-white overflow-visible">
        <div className="flex items-center justify-between gap-2 px-2 pt-1.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-teal-100/90 px-1">
            <List className="w-3 h-3" /> Management
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-100/90">
              <Settings className="w-3 h-3" /> Configuration
            </span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-teal-300 absolute left-2.5 top-2" />
              <input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search menus..."
                className="w-40 lg:w-48 bg-[#0a4545] border border-teal-700/80 text-white text-[12px] rounded-full pl-8 pr-3 py-1.5 placeholder:text-teal-400/80 focus:outline-none focus:ring-1 focus:ring-teal-400"
              />
              {searchHits.length > 0 && (
                <div className="absolute right-0 top-full mt-1 w-72 bg-white shadow-xl border border-slate-200 rounded-md overflow-hidden z-[10000]">
                  {searchHits.map((hit) => (
                    <button
                      key={`${hit.menuId}-${hit.id}`}
                      type="button"
                      onClick={() => {
                        handleNav(hit);
                        onSearchChange('');
                      }}
                      className="w-full text-left px-3 py-2 text-[13px] text-slate-700 hover:bg-teal-50 border-b border-slate-50 last:border-0"
                    >
                      <span className="font-medium">{hit.label}</span>
                      <span className="text-slate-400 text-[11px] ml-2">{hit.menuLabel || hit.zone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="relative p-1.5 text-teal-100 hover:text-white" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full px-1 min-w-[16px] text-center">
                9+
              </span>
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(null);
                  setProfileOpen((v) => !v);
                }}
                className="p-1.5 text-teal-100 hover:text-white flex items-center gap-0.5"
              >
                <User className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white shadow-xl border border-slate-200 rounded-md overflow-hidden z-[10000]" data-nav-dropdown="1">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="px-2 py-0.5 rounded bg-sky-600 text-white text-[12px] font-semibold">admin</span>
                  </div>
                  <button type="button" className="w-full text-left px-4 py-2 text-[13px] text-sky-800 hover:bg-sky-50">
                    My Profile
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="w-[calc(100%-1rem)] flex items-center justify-center gap-2 m-2 px-3 py-2 rounded bg-[#0a6666] text-white text-[13px] font-semibold"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                  <p className="px-3 pb-2 text-[10px] text-slate-400 text-center">
                    {role} · {BRAND.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 overflow-visible">
          <div className="flex items-center flex-wrap">
            {MANAGEMENT_MENUS.map((menu) =>
              menu.href ? (
                <button
                  key={menu.id}
                  type="button"
                  onClick={goHome}
                  className={`flex items-center gap-1 px-2.5 py-[10px] text-[13px] font-medium ${
                    activeMenuId === 'home' && !openMenu ? 'bg-[#f6d365] text-[#0a3d3d]' : 'hover:bg-white/10'
                  }`}
                >
                  <Home className={`w-[15px] h-[15px] ${activeMenuId === 'home' && !openMenu ? 'text-[#0a3d3d]' : 'text-[#f6d365]'}`} />
                  Home
                </button>
              ) : (
                <MenuDropdown
                  key={menu.id}
                  menu={menu}
                  open={openMenu === menu.id}
                  onToggle={() => toggleMenu(menu.id)}
                  onNavigate={handleNav}
                />
              )
            )}
          </div>
          <div className="flex items-center flex-wrap justify-end">
            {CONFIG_MENUS.map((menu) => (
              <MenuDropdown
                key={menu.id}
                menu={menu}
                open={openMenu === menu.id}
                onToggle={() => toggleMenu(menu.id)}
                onNavigate={handleNav}
                align="right"
              />
            ))}
            {CONFIG_LINKS.map((link) => {
              const Icon = ICONS[link.id] || FileText;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNav(link)}
                  className="relative flex items-center gap-1 px-2.5 py-[10px] text-[13px] font-medium hover:bg-white/10"
                >
                  <Icon className="w-[15px] h-[15px] text-[#f6d365]" />
                  {link.label}
                  {link.badge && (
                    <span className="absolute top-1 right-0.5 bg-rose-500 text-[9px] font-bold rounded-full px-1 leading-4">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="md:hidden flex items-center gap-2 px-3 py-2 text-white">
        <button type="button" onClick={goHome} className="font-bold text-sm">
          {BRAND.name}
        </button>
        <div className="flex-1" />
        <button type="button" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden max-h-[75vh] overflow-y-auto bg-[#0a6666] border-t border-teal-800 text-white">
          <button type="button" onClick={goHome} className="w-full text-left px-4 py-3 text-sm font-medium border-b border-teal-800/50">
            Home
          </button>
          {[...MANAGEMENT_MENUS.filter((m) => !m.href), ...CONFIG_MENUS].map((menu) => (
            <details key={menu.id} className="border-b border-teal-800/50">
              <summary className="px-4 py-3 text-sm font-semibold cursor-pointer list-none flex items-center justify-between">
                {menu.label}
                <ChevronDown className="w-4 h-4 opacity-70" />
              </summary>
              {(menu.groups || []).flatMap((g) => g.items).map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => handleNav(it)}
                  className="w-full text-left px-6 py-2 text-[13px] text-white/90 hover:bg-white/10"
                >
                  {it.label}
                </button>
              ))}
            </details>
          ))}
        </div>
      )}
    </header>
  );
}
