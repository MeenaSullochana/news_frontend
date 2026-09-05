import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

const TravelUpdatesSection = () => {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('Travel Updates');
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('all');

  useEffect(() => {
    setLoading(true);
    travelNotificationService
      .getPublic({ limit: 12, mode: mode === 'all' ? undefined : mode })
      .then(({ data }) => {
        setItems(data.data || []);
        setTitle(data.title || 'Travel Updates');
        setEnabled(data.enabled !== false);
      })
      .catch(() => {
        setItems([]);
        setEnabled(false);
      })
      .finally(() => setLoading(false));
  }, [mode]);

  if (loading || !enabled || items.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-headline text-slate-900">{title}</h2>
          <Link to="/travel-updates" className="text-xs font-semibold text-brand-700 hover:underline mt-1 inline-block">
            View all travel updates →
          </Link>
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {['all', 'train', 'bus', 'flight'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg capitalize ${
                mode === m ? 'bg-slate-900 text-white' : 'bg-white border border-stone-200 text-slate-600'
              }`}
            >
              {MODE_LABELS[m] || m}
            </button>
          ))}
        </div>
      </div>

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
              {item.transportNumber && <span className="font-mono text-slate-600">{item.transportNumber}</span>}
              {(item.route || item.fromLocation) && (
                <span>{item.route || `${item.fromLocation}${item.toLocation ? ` → ${item.toLocation}` : ''}`}</span>
              )}
              {item.delayMinutes > 0 && <span className="text-amber-600">+{item.delayMinutes}m</span>}
            </div>
            {item.lastUpdatedAt && (
              <p className="text-[10px] text-slate-400 mt-2">
                Updated {new Date(item.lastUpdatedAt).toLocaleString()}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default TravelUpdatesSection;
