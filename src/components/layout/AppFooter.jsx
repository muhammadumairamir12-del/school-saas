import React from 'react';
import { BRAND } from '../../navConfig';

export default function AppFooter() {
  return (
    <footer className="mt-auto bg-[#0a6666] text-teal-50 text-[12px] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
      <span>{BRAND.copyright}</span>
      <button type="button" className="hover:underline text-teal-100">
        {BRAND.terms}
      </button>
      <span className="w-8 hidden sm:block" />
    </footer>
  );
}
