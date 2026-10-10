import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, MoreHorizontal } from 'lucide-react';

const HEADER_COLORS = {
  magenta: 'bg-[#c2185b]',
  purple: 'bg-[#7e57c2]',
  blue: 'bg-[#1976d2]',
  orange: 'bg-[#ef6c00]',
  teal: 'bg-[#00897b]',
  pink: 'bg-[#d81b60]',
};

export default function DashCard({
  title,
  subtitle,
  icon: Icon,
  color = 'magenta',
  children,
  onExpand,
  onOpenReport,
  footerLeft = 'Expand',
  footerRight = 'Open report',
  showReport = true,
}) {
  const [expanded, setExpanded] = useState(true);
  const header = HEADER_COLORS[color] || HEADER_COLORS.magenta;

  return (
    <article className="bg-white border border-slate-200/80 rounded-lg shadow-sm overflow-hidden flex flex-col min-h-[180px]">
      <header className={`${header} px-3 py-2.5 text-white flex items-start gap-2`}>
        {Icon && (
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-bold leading-tight truncate">{title}</h3>
          {subtitle && <p className="text-[11px] text-white/80 leading-snug mt-0.5 line-clamp-2">{subtitle}</p>}
        </div>
        <button type="button" className="p-1 rounded hover:bg-white/10 shrink-0" aria-label="Card menu">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </header>

      {expanded && <div className="px-4 py-3 flex-1 text-slate-800">{children}</div>}

      <footer className="mt-auto px-3 py-2 border-t border-slate-100 flex items-center justify-between text-[12px] bg-slate-50/80">
        <button
          type="button"
          onClick={() => {
            setExpanded((v) => !v);
            onExpand?.();
          }}
          className="inline-flex items-center gap-1 text-slate-600 hover:text-teal-800 font-medium"
        >
          {footerLeft}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {showReport && (
          <button
            type="button"
            onClick={onOpenReport}
            className="inline-flex items-center gap-1 text-teal-700 hover:underline font-medium"
          >
            {footerRight}
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </footer>
    </article>
  );
}

export function Metric({ value, hint, badge, badgeClass = 'bg-emerald-100 text-emerald-700' }) {
  return (
    <div>
      <p className="text-[22px] font-bold leading-tight text-slate-900">{value}</p>
      {hint && <p className="text-[12px] text-slate-500 mt-1">{hint}</p>}
      {badge && (
        <span className={`inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
          {badge}
        </span>
      )}
    </div>
  );
}

export function MiniBars({ items }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="flex items-end gap-1 h-24 mt-3">
      {items.map((item) => (
        <div key={item.label} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <div
            className="w-full rounded-t"
            style={{
              height: `${Math.max(8, (item.value / max) * 100)}%`,
              background: item.color || '#7e57c2',
            }}
            title={`${item.label}: ${item.value}`}
          />
          <span className="text-[9px] text-slate-400 truncate w-full text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function HBar({ segments }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="mt-3">
      <div className="h-3 rounded-full overflow-hidden flex bg-slate-100">
        {segments.map((seg) => (
          <div
            key={seg.label}
            style={{ width: `${(seg.value / total) * 100}%`, background: seg.color }}
            title={`${seg.label}: ${seg.value}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {segments.map((seg) => (
          <span key={seg.label} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: seg.color }} />
            {seg.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ProgressLine({ percent, label }) {
  return (
    <div className="mt-3">
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full bg-teal-600 rounded-full" style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      {label && <p className="text-[11px] text-slate-500 mt-1">{label}</p>}
    </div>
  );
}

export function TagRow({ tags }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {tags.map((t) => (
        <span
          key={t.label}
          className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
        >
          {t.label} <strong>{t.value}</strong>
        </span>
      ))}
    </div>
  );
}
