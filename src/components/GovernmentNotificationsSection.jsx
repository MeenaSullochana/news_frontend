import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

const NotifCard = ({ item, alert = false }) => (
  <article
    className={`rounded-2xl border p-4 transition-colors ${
      alert ? 'border-rose-200 bg-rose-50/40' : 'border-stone-200 bg-white hover:border-brand-300'
    }`}
  >
    <div className="flex flex-wrap items-center gap-2 mb-1.5">
      <span className="text-[10px] uppercase font-semibold tracking-wide text-teal-700">
        {CATEGORY_LABELS[item.category] || item.category}
      </span>
      {item.department && (
        <span className="text-[10px] text-slate-400 truncate max-w-[60%]">{item.department}</span>
      )}
    </div>
    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
      {item.titleTamil || item.title}
    </h3>
    {item.titleTamil && item.title && item.titleTamil !== item.title && (
      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.title}</p>
    )}
    {(item.summaryTamil || item.summary) && (
      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{item.summaryTamil || item.summary}</p>
    )}
    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-[10px] text-slate-400">
      <span>{item.sourceName || 'Official'}</span>
      {item.publishedAt && <time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString()}</time>}
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

const GovernmentNotificationsSection = () => {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    governmentNotificationService
      .getPublic({ limit: 8 })
      .then(({ data }) => setPayload(data))
      .catch(() => setPayload(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !payload?.enabled) return null;

  const { latest = [], alerts = [], titles = {}, widgets = {} } = payload.data || {};
  if (!widgets.latest && !widgets.alerts) return null;
  if (!latest.length && !alerts.length) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: titles.latest || 'Government Notifications',
    itemListElement: (latest.length ? latest : alerts).slice(0, 8).map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.title,
      url: item.officialUrl || undefined,
      datePublished: item.publishedAt,
    })),
  };

  return (
    <section className="mb-10">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {widgets.alerts && alerts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold font-headline text-slate-900">
              {titles.alertsTa || titles.alerts || 'Important Government Alerts'}
            </h2>
            <Link
              to="/government-notifications?important=1"
              className="text-sm text-brand-600 hover:underline font-medium shrink-0"
            >
              அனைத்தும் →
            </Link>
          </div>
          {titles.alerts && titles.alertsTa && (
            <p className="text-xs text-slate-400 mb-4">{titles.alerts}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {alerts.slice(0, 4).map((item) => (
              <NotifCard key={item._id} item={item} alert />
            ))}
          </div>
        </div>
      )}

      {widgets.latest && latest.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold font-headline text-slate-900">
              {titles.latestTa || titles.latest || 'Latest Government Notifications'}
            </h2>
            <Link
              to="/government-notifications"
              className="text-sm text-brand-600 hover:underline font-medium shrink-0"
            >
              அனைத்தும் →
            </Link>
          </div>
          {titles.latest && titles.latestTa && (
            <p className="text-xs text-slate-400 mb-4">{titles.latest}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {latest.map((item) => (
              <NotifCard key={item._id} item={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default GovernmentNotificationsSection;
