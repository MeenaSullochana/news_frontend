/** Shared UI bits for Match Details */

export const EmptyState = ({ title = 'Not available', message = 'This data was not provided by the sports API for this match.' }) => (
  <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/80 px-4 py-10 text-center">
    <p className="text-sm font-semibold text-slate-700">{title}</p>
    <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">{message}</p>
  </div>
);

export const StatPair = ({ label, home, away }) => {
  if (home == null && away == null) return null;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center py-2 border-b border-stone-50 last:border-0 text-sm">
      <span className="font-mono text-right font-semibold">{home ?? '—'}</span>
      <span className="text-[11px] uppercase text-slate-400 text-center px-2">{label}</span>
      <span className="font-mono font-semibold">{away ?? '—'}</span>
    </div>
  );
};

export const DataTable = ({ columns, rows, emptyTitle = 'No rows' }) => {
  if (!rows?.length) return <EmptyState title={emptyTitle} />;
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
      <table className="w-full text-xs sm:text-sm min-w-[320px]">
        <thead>
          <tr className="text-left text-slate-400 border-b border-stone-100 bg-stone-50/80">
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2.5 font-medium whitespace-nowrap">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.key || i} className="border-b border-stone-50 last:border-0">
              {columns.map((c) => (
                <td key={c.key} className={`px-3 py-2 ${c.className || ''}`}>
                  {c.render ? c.render(row) : row[c.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const Collapsible = ({ title, defaultOpen = true, children, badge }) => {
  return (
    <details open={defaultOpen} className="rounded-2xl border border-stone-200 bg-white overflow-hidden group">
      <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-2 border-b border-stone-100 bg-stone-50/60 [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-semibold text-slate-900">{title}</span>
        <span className="flex items-center gap-2">
          {badge != null && badge !== '' && (
            <span className="text-[10px] font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
          <span className="text-slate-400 text-xs group-open:rotate-180 transition-transform">▼</span>
        </span>
      </summary>
      <div className="p-3 sm:p-4">{children}</div>
    </details>
  );
};

export const TeamLogo = ({ src, name, size = 'md' }) => {
  const dim = size === 'lg' ? 'h-14 w-14 sm:h-16 sm:w-16' : 'h-10 w-10';
  if (src) {
    return (
      <img
        src={src}
        alt={name || ''}
        className={`${dim} rounded-full object-contain bg-white border border-stone-100`}
        loading="lazy"
      />
    );
  }
  const initials = String(name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div
      className={`${dim} rounded-full bg-teal-50 text-teal-800 border border-teal-100 flex items-center justify-center text-xs font-bold`}
      aria-hidden
    >
      {initials || '?'}
    </div>
  );
};

export const MatchSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-40 rounded-2xl bg-stone-200/70" />
    <div className="flex gap-2 overflow-hidden">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-9 w-24 rounded-lg bg-stone-200/70 shrink-0" />
      ))}
    </div>
    <div className="h-64 rounded-2xl bg-stone-200/60" />
  </div>
);
