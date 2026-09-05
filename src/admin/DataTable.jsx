import { useMemo, useState, useEffect } from 'react';

const SortIcon = ({ active, direction }) => (
  <span className={`inline-flex flex-col ml-1.5 ${active ? 'text-brand-600' : 'text-slate-300'}`}>
    <svg className={`w-2.5 h-2.5 -mb-0.5 ${active && direction === 'asc' ? 'text-brand-600' : ''}`} viewBox="0 0 10 6" fill="currentColor">
      <path d="M5 0L10 6H0z" />
    </svg>
    <svg className={`w-2.5 h-2.5 ${active && direction === 'desc' ? 'text-brand-600' : ''}`} viewBox="0 0 10 6" fill="currentColor">
      <path d="M5 6L0 0h10z" />
    </svg>
  </span>
);

const getNestedValue = (obj, key) => {
  if (!key) return '';
  return key.split('.').reduce((acc, part) => acc?.[part], obj);
};

const defaultSearch = (row, query, keys) => {
  const q = query.toLowerCase();
  return keys.some((key) => {
    const val = getNestedValue(row, key);
    return String(val ?? '').toLowerCase().includes(q);
  });
};

const DataTable = ({
  columns,
  data = [],
  loading = false,
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  onSearch,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50],
  emptyMessage = 'No records found',
  emptyAction = null,
  showIndex = true,
  keyField = '_id',
  toolbar = null,
}) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize, data.length]);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    if (onSearch) return data.filter((row) => onSearch(row, search.trim()));
    if (searchKeys.length === 0) return data;
    return data.filter((row) => defaultSearch(row, search.trim(), searchKeys));
  }, [data, search, searchKeys, onSearch]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    const getValue = col?.sortValue || ((row) => getNestedValue(row, sortKey));
    return [...filtered].sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  const handleSort = (col) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  if (loading) {
    return (
      <div className="data-table-wrap">
        <div className="data-table-toolbar skeleton h-11 rounded-xl mb-4" />
        <div className="admin-card p-0 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-12 border-b border-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="data-table-wrap">
      <div className="data-table-toolbar">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="admin-input pl-10 py-2"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {toolbar}
          <span className="text-sm text-slate-500 whitespace-nowrap">
            {sorted.length} record{sorted.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="admin-card text-center py-12">
          <p className="text-slate-500">{emptyMessage}</p>
          {emptyAction}
        </div>
      ) : (
        <div className="admin-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  {showIndex && <th className="w-12 text-center">#</th>}
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`${col.headerClassName || ''} ${col.sortable ? 'cursor-pointer select-none hover:bg-slate-100' : ''}`}
                      onClick={() => handleSort(col)}
                    >
                      <span className="inline-flex items-center">
                        {col.header}
                        {col.sortable && <SortIcon active={sortKey === col.key} direction={sortDir} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, idx) => (
                  <tr key={row[keyField] ?? start + idx}>
                    {showIndex && (
                      <td className="text-center text-slate-400 font-medium tabular-nums">{start + idx + 1}</td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={col.cellClassName || col.className || ''}>
                        {col.render ? col.render(row) : getNestedValue(row, col.key) ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="data-table-footer">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="hidden sm:inline">Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="admin-input py-1.5 px-2 w-auto min-w-[70px] text-sm"
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <p className="text-sm text-slate-500">
              {start + 1}–{Math.min(start + pageSize, sorted.length)} of {sorted.length}
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={safePage <= 1}
                className="data-table-page-btn"
                aria-label="First page"
              >
                «
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="data-table-page-btn"
                aria-label="Previous page"
              >
                ‹
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-slate-700 min-w-[80px] text-center">
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="data-table-page-btn"
                aria-label="Next page"
              >
                ›
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={safePage >= totalPages}
                className="data-table-page-btn"
                aria-label="Last page"
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
