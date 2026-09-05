import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { governmentNotificationService } from '../services/articleService';

const CATEGORY_LABELS = {
  announcement: 'Announcement',
  scheme: 'Scheme',
  job: 'Job',
  tender: 'Tender',
  order: 'Order',
  circular: 'Circular',
  welfare: 'Welfare',
  public_notice: 'Notice',
  alert: 'Alert',
  general: 'General',
};

const LEVEL_LABELS = {
  central: 'Central',
  tamil_nadu: 'Tamil Nadu',
  department: 'Department',
  other: 'Other',
};

const NotifCard = ({ item }) => (
  <article
    className={`rounded-2xl border p-4 transition-colors ${
      item.isImportant || item.category === 'alert'
        ? 'border-rose-200 bg-rose-50/40'
        : 'border-stone-200 bg-white hover:border-brand-300'
    }`}
  >
    <div className="flex flex-wrap items-center gap-2 mb-1.5">
      <span className="text-[10px] uppercase font-semibold tracking-wide text-teal-700">
        {CATEGORY_LABELS[item.category] || item.category}
      </span>
      {item.level && (
        <span className="text-[10px] text-slate-400">{LEVEL_LABELS[item.level] || item.level}</span>
      )}
      {item.department && (
        <span className="text-[10px] text-slate-400 truncate max-w-[50%]">{item.department}</span>
      )}
    </div>
    <h2 className="text-sm sm:text-base font-semibold text-slate-900 line-clamp-3 leading-snug">
      {item.titleTamil || item.title}
    </h2>
    {item.titleTamil && item.title && item.titleTamil !== item.title && (
      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.title}</p>
    )}
    {(item.summaryTamil || item.summary) && (
      <p className="text-xs text-slate-500 mt-1.5 line-clamp-3">{item.summaryTamil || item.summary}</p>
    )}
    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-[10px] text-slate-400">
      <span>{item.sourceName || 'Official'}</span>
      {item.publishedAt && (
        <time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString()}</time>
      )}
    </div>
    {item.officialUrl && (
      <a
        href={item.officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-2 text-xs font-medium text-brand-600 hover:underline"
      >
        View official source →
      </a>
    )}
  </article>
);

const GovernmentNotifications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [titles, setTitles] = useState({});
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState('all');
  const [category, setCategory] = useState('all');
  const [importantOnly, setImportantOnly] = useState(
    searchParams.get('important') === '1' || searchParams.get('important') === 'true'
  );
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (importantOnly) next.set('important', '1');
    else next.delete('important');
    setSearchParams(next, { replace: true });
  }, [importantOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    governmentNotificationService
      .getPublicList({
        page,
        limit: 18,
        level: level === 'all' ? undefined : level,
        category: category === 'all' ? undefined : category,
        important: importantOnly ? '1' : undefined,
        q: search || undefined,
      })
      .then(({ data }) => {
        setItems(data.data || []);
        setTitles(data.titles || {});
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
        setEnabled(data.enabled !== false);
      })
      .catch(() => {
        setItems([]);
        setEnabled(false);
      })
      .finally(() => setLoading(false));
  }, [page, level, category, importantOnly, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(q.trim());
  };

  const pageTitle = titles.latestTa || titles.latest || 'அரசு அறிவிப்புகள்';

  return (
    <div className="min-h-[50vh]">
      <Helmet>
        <title>{pageTitle} | The Great India News</title>
        <meta
          name="description"
          content="Official Central and Tamil Nadu government notifications, schemes, jobs, and alerts."
        />
      </Helmet>

      <div className="border-b border-stone-200 bg-white/70">
        <div className="container-news py-8">
          <Link to="/" className="text-xs font-semibold text-brand-700 hover:underline">
            ← முகப்பு
          </Link>
          <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700 mt-3">
            Official
          </p>
          <h1 className="text-3xl font-headline font-bold text-slate-900 mt-1">{pageTitle}</h1>
          {titles.latest && titles.latestTa && titles.latest !== titles.latestTa && (
            <p className="text-sm text-slate-500 mt-1">{titles.latest}</p>
          )}
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Browse published government notifications from official feeds. Always verify on the official source.
          </p>

          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-lg">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search notifications…"
              className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white"
            />
            <button type="submit" className="btn-primary text-sm">
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            <select
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                setPage(1);
              }}
              className="border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white"
            >
              <option value="all">All levels</option>
              {Object.entries(LEVEL_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white"
            >
              <option value="all">All categories</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setImportantOnly((v) => !v);
                setPage(1);
              }}
              className={`px-3 py-2 text-sm rounded-xl border font-medium ${
                importantOnly
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-slate-600 border-stone-200'
              }`}
            >
              Important only
            </button>
          </div>
        </div>
      </div>

      <div className="container-news py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-40 rounded-2xl" />
            ))}
          </div>
        ) : !enabled || !items.length ? (
          <div className="text-center py-16 text-slate-500">
            <p>No published government notifications yet.</p>
            <Link to="/" className="text-brand-700 font-semibold mt-2 inline-block">
              Back to home
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 mb-4">{pagination.total} notifications</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <NotifCard key={item._id} item={item} />
              ))}
            </div>
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn-secondary text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500">
                  Page {pagination.page} / {pagination.pages}
                </span>
                <button
                  type="button"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GovernmentNotifications;
