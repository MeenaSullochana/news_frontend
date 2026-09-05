import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { travelNotificationService } from '../services/articleService';

const MODE_LABELS = { train: 'Train', bus: 'Bus', flight: 'Flight' };

const statusColor = {
  on_time: 'text-emerald-700 bg-emerald-50',
  delayed: 'text-amber-700 bg-amber-50',
  cancelled: 'text-rose-700 bg-rose-50',
  arrived: 'text-sky-700 bg-sky-50',
  departed: 'text-indigo-700 bg-indigo-50',
  scheduled: 'text-slate-600 bg-slate-100',
  diverted: 'text-orange-700 bg-orange-50',
  info: 'text-slate-600 bg-slate-100',
};

const TravelUpdates = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('Travel Updates');
  const [titleTa, setTitleTa] = useState('பயண அறிவிப்புகள்');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState(searchParams.get('mode') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    const next = new URLSearchParams();
    if (mode !== 'all') next.set('mode', mode);
    if (status !== 'all') next.set('status', status);
    setSearchParams(next, { replace: true });
  }, [mode, status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    travelNotificationService
      .getPublicList({
        page,
        limit: 18,
        mode: mode === 'all' ? undefined : mode,
        status: status === 'all' ? undefined : status,
      })
      .then(({ data }) => {
        setItems(data.data || []);
        setTitle(data.title || 'Travel Updates');
        setTitleTa(data.titleTa || 'பயண அறிவிப்புகள்');
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [page, mode, status]);

  return (
    <div className="min-h-[50vh]">
      <Helmet>
        <title>{titleTa || title} | The Great India News</title>
        <meta name="description" content="Live train, bus and flight status updates." />
      </Helmet>

      <div className="border-b border-stone-200 bg-white/70">
        <div className="container-news py-8">
          <Link to="/" className="text-xs font-semibold text-brand-700 hover:underline">
            ← முகப்பு
          </Link>
          <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700 mt-3">Travel</p>
          <h1 className="text-3xl font-headline font-bold text-slate-900 mt-1">{titleTa || title}</h1>
          {title && titleTa && title !== titleTa && (
            <p className="text-sm text-slate-500 mt-1">{title}</p>
          )}
        </div>
      </div>

      <div className="container-news py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {['all', 'train', 'bus', 'flight'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setPage(1); }}
                className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg capitalize ${
                  mode === m ? 'bg-slate-900 text-white' : 'bg-white border border-stone-200 text-slate-600'
                }`}
              >
                {MODE_LABELS[m] || m}
              </button>
            ))}
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="text-sm border border-stone-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">All statuses</option>
            <option value="on_time">On time</option>
            <option value="delayed">Delayed</option>
            <option value="cancelled">Cancelled</option>
            <option value="arrived">Arrived</option>
            <option value="departed">Departed</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="font-medium">No travel updates available</p>
            <p className="text-sm mt-1">Check back later for train, bus and flight status.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <article
                  key={item._id}
                  className="rounded-2xl border border-stone-200 bg-white p-4 hover:border-brand-300 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-semibold tracking-wide text-teal-700">
                      {MODE_LABELS[item.mode] || item.mode}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                        statusColor[item.status] || statusColor.info
                      }`}
                    >
                      {(item.status || 'info').replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{item.title}</h3>
                  {item.message && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.message}</p>
                  )}
                  <div className="mt-3 text-[11px] text-slate-400 flex flex-wrap gap-x-2 gap-y-1">
                    {item.transportNumber && (
                      <span className="font-mono text-slate-600">{item.transportNumber}</span>
                    )}
                    {(item.route || item.fromLocation) && (
                      <span>
                        {item.route || `${item.fromLocation}${item.toLocation ? ` → ${item.toLocation}` : ''}`}
                      </span>
                    )}
                    {item.platform && <span>Platform {item.platform}</span>}
                    {item.gate && <span>Gate {item.gate}</span>}
                    {item.delayMinutes > 0 && <span className="text-amber-600">+{item.delayMinutes}m</span>}
                  </div>
                  {item.lastFetchedAt && (
                    <p className="text-[10px] text-slate-400 mt-2">
                      Updated {new Date(item.lastFetchedAt).toLocaleString()}
                    </p>
                  )}
                </article>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 text-sm rounded-lg border border-stone-200 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-slate-500">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  type="button"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 text-sm rounded-lg border border-stone-200 disabled:opacity-40"
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

export default TravelUpdates;
