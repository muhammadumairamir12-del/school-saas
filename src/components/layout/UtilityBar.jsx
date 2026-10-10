import React, { useState } from 'react';
import { ChevronDown, Bookmark, Clock } from 'lucide-react';

const REPORT_LINKS = [
  { id: 'daily-snapshot', label: 'Daily Snapshot Report', pageType: 'module' },
  { id: 'detail-fee-report', label: 'Detail Fee Report', pageType: 'module' },
  { id: 'payment-history', label: 'Payment History', pageType: 'module' },
  { id: 'fee-defaulters-total', label: 'Fee Defaulters', pageType: 'existing', existingKey: 'defaulters' },
  { id: 'fee-defaulters-month', label: 'Fee Defaulters Month Wise', pageType: 'module' },
  { id: 'class-wise-fee-particular', label: 'Class Wise Fee Particular', pageType: 'module' },
  { id: 'student-wise-fee-status', label: 'Student Wise Fee Status', pageType: 'module' },
  { id: 'combine-attendance-report', label: 'Combine Attendance Report', pageType: 'module' },
  { id: 'examination-reports', label: 'Examination Reports', pageType: 'module' },
  { id: 'employee-salary-report', label: 'Employee Salary Report', pageType: 'module' },
  { id: 'trial-balance', label: 'Trial Balance', pageType: 'module' },
  { id: 'pl-statement', label: 'P & L Statement', pageType: 'module' },
];

export default function UtilityBar({ bookmarks = [], recent = [], onNavigate }) {
  const [reportsOpen, setReportsOpen] = useState(false);

  return (
    <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] relative shadow-sm">
      <div className="relative">
        <button
          type="button"
          onClick={() => setReportsOpen((v) => !v)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#c2185b] text-white font-semibold shadow-sm hover:bg-[#ad1457]"
        >
          Reports
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        {reportsOpen && (
          <>
            <button type="button" className="fixed inset-0 z-30" aria-label="Close" onClick={() => setReportsOpen(false)} />
            <div className="absolute left-0 top-full mt-1 z-40 min-w-[260px] max-h-[60vh] overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-md overflow-hidden">
              {REPORT_LINKS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    onNavigate?.(r);
                    setReportsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-[13px] text-[#1565c0] hover:bg-[#0a6666] hover:text-white border-b border-slate-50 last:border-0"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
        <Bookmark className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-amber-300" />
        <span className="font-semibold tracking-wide text-slate-600">BOOKMARKS:</span>
        <span className="truncate text-slate-400">
          {bookmarks.length ? bookmarks.map((b) => b.label).join(', ') : 'No bookmarks saved'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-semibold tracking-wide text-slate-600">RECENT:</span>
        <span className="truncate text-slate-400">
          {recent.length ? (
            recent.slice(0, 5).map((r, i) => (
              <button
                key={r.id + i}
                type="button"
                onClick={() => onNavigate?.(r)}
                className="text-teal-700 hover:underline mr-2 font-medium"
              >
                {r.label}
              </button>
            ))
          ) : (
            'No recent links'
          )}
        </span>
      </div>
    </div>
  );
}
