import React from 'react';
import { MessageCircle } from 'lucide-react';
import TopNav from './TopNav';
import UtilityBar from './UtilityBar';
import AppFooter from './AppFooter';

export default function AppShell({
  children,
  onNavigate,
  activeMenuId,
  searchQuery,
  onSearchChange,
  bookmarks,
  recent,
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f8]">
      <TopNav
        onNavigate={onNavigate}
        activeMenuId={activeMenuId}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <UtilityBar bookmarks={bookmarks} recent={recent} onNavigate={onNavigate} />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-4 py-3 pb-20">{children}</main>
      <AppFooter />
      <button
        type="button"
        aria-label="Support chat"
        className="fixed bottom-5 right-5 z-30 w-12 h-12 rounded-full bg-[#0a6666] text-white shadow-lg flex items-center justify-center hover:bg-teal-800"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
