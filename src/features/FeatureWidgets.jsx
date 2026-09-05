import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FeatureIcon } from './FeatureIcons';
import NewsImage from '../components/NewsImage';
import { timeAgo } from '../utils/helpers';
import { marketplaceService, matrimonyService, governmentNotificationService, featureService } from '../services/articleService';

const CardShell = ({ title, titleTamil, viewAllTo, children, className = '', headerRight }) => (
  <section className={`hub-card ${className}`}>
    <div className="hub-card-header">
      <div className="min-w-0">
        <h2 className="text-sm sm:text-[15px] font-bold text-slate-900 tracking-tight truncate">{title}</h2>
        {titleTamil && <p className="text-[11px] text-slate-500 font-tamil truncate">{titleTamil}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {headerRight}
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="text-xs font-semibold text-brand-700 hover:text-brand-900 whitespace-nowrap inline-flex items-center gap-0.5"
          >
            View All
            <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </div>
    <div className="p-4 sm:p-5 flex-1">{children}</div>
  </section>
);

const ChangeBadge = ({ value, suffix = '%' }) => {
  if (value == null) return null;
  const up = Number(value) >= 0;
  return (
    <span
      className={`inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded-md mt-1 ${
        up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      }`}
    >
      {up ? '↑' : '↓'} {Math.abs(Number(value))}
      {suffix}
    </span>
  );
};

export const WeatherWidget = ({ feature, detail = false }) => {
  const fallback = feature.config || {};
  const defaultDistrict = fallback.defaultDistrict || 'Chennai';
  const stateName = fallback.state || 'Tamil Nadu';
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    featureService
      .getWeatherLive({ district: defaultDistrict })
      .then(({ data }) => {
        if (!cancelled) setWeather(data.data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [defaultDistrict]);

  const c = weather || fallback;
  const districtLabel = c.district || c.city || defaultDistrict;

  const body = loading ? (
    <div className="space-y-2 animate-pulse">
      <div className="h-8 w-16 bg-stone-200 rounded-lg" />
      <div className="h-3 w-24 bg-stone-200 rounded" />
      <div className="h-3 w-32 bg-stone-200 rounded" />
    </div>
  ) : (
    <>
      <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
        {c.temp != null ? `${c.temp}°${c.unit || 'C'}` : '—'}
      </p>
      <p className="text-xs text-slate-600 mt-0.5">{c.condition || '—'}</p>
      <p className="text-[11px] text-slate-500 mt-1.5">
        H {c.high ?? '—'}° · L {c.low ?? '—'}° · {districtLabel}
      </p>
      {!detail && (
        <p className="text-[10px] text-brand-700 font-semibold mt-1.5">{stateName} · all districts</p>
      )}
      {c.humidity != null && (
        <p className="text-[11px] text-slate-500 mt-1">
          Humidity {c.humidity}% · Wind {c.windSpeed ?? '—'} km/h {c.windDirection}
        </p>
      )}
      {error && !weather && (
        <p className="text-[11px] text-amber-700 mt-1">Live data unavailable — showing last known values.</p>
      )}
      {detail && c.forecast?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-stone-200">
          <p className="text-xs font-semibold text-slate-700 mb-2">3-day forecast</p>
          <div className="grid grid-cols-3 gap-2">
            {c.forecast.map((day) => (
              <div key={day.date} className="text-center rounded-xl bg-stone-50 px-2 py-2">
                <p className="text-[10px] text-slate-500">{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}</p>
                <p className="text-sm font-bold text-slate-900">{day.high}°</p>
                <p className="text-[10px] text-slate-500">{day.low}°</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {detail && c.hourly?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-700 mb-2">Next 24 hours</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {c.hourly.slice(0, 12).map((h) => (
              <div key={h.time} className="shrink-0 text-center rounded-lg bg-stone-50 px-2 py-1.5 min-w-[52px]">
                <p className="text-[10px] text-slate-500">
                  {new Date(h.time).toLocaleTimeString('en-IN', { hour: 'numeric' })}
                </p>
                <p className="text-xs font-bold text-slate-900">{h.temp}°</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {c.source === 'open-meteo' && (
        <p className="text-[10px] text-slate-400 mt-2">Live via Open-Meteo</p>
      )}
    </>
  );

  return (
    <CardShell
      title={detail ? `${stateName} Weather` : feature.name}
      titleTamil={feature.nameTamil}
      viewAllTo={detail ? undefined : '/explore/weather'}
      headerRight={<FeatureIcon name={feature.icon} className="w-5 h-5 text-brand-600" />}
    >
      {body}
    </CardShell>
  );
};

export const GoldPriceWidget = ({ feature, detail = false }) => {
  const fallback = feature.config || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    featureService
      .getGoldLive()
      .then(({ data: res }) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const c = data || fallback;
  const items = c.items || [];
  const gold22 = items.find((i) => i.type === 'gold' && i.purity === '22K')
    || { price: c.gold?.['22k']?.rate, unit: c.unit || '1 gram' };
  const gold24 = items.find((i) => i.type === 'gold' && i.purity === '24K')
    || { price: c.gold?.['24k']?.rate, unit: c.unit || '1 gram' };
  const stateName = c.state || 'Tamil Nadu';

  const body = loading ? (
    <div className="space-y-2 animate-pulse">
      <div className="h-7 w-20 bg-stone-200 rounded-lg" />
      <div className="h-3 w-24 bg-stone-200 rounded" />
      <div className="h-3 w-28 bg-stone-200 rounded" />
    </div>
  ) : (
    <>
      <p className="text-[11px] text-slate-600 font-medium">22K Gold · {gold22.unit || '1 gram'}</p>
      <p className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
        {gold22.price ? `₹${Number(gold22.price).toLocaleString('en-IN')}` : '—'}
      </p>
      <ChangeBadge value={gold22.change} suffix="" />
      <p className="text-[11px] text-slate-500 mt-1.5">
        24K: {gold24.price ? `₹${Number(gold24.price).toLocaleString('en-IN')}` : '—'} / {gold24.unit || '1 gram'}
      </p>
      {!detail && (
        <p className="text-[10px] text-brand-700 font-semibold mt-1">{stateName}</p>
      )}
      {error && !data && (
        <p className="text-[11px] text-amber-700 mt-1">Live data unavailable — showing config values.</p>
      )}
      {c.source && c.source !== 'config' && (
        <p className="text-[10px] text-slate-400 mt-2">Live via {c.source}</p>
      )}
    </>
  );

  if (detail) {
    return (
      <CardShell
        title={`${stateName} Gold Price`}
        titleTamil={feature.nameTamil}
        viewAllTo="/explore/gold"
        headerRight={<FeatureIcon name={feature.icon} className="w-5 h-5 text-brand-600" />}
      >
        {body}
      </CardShell>
    );
  }

  return (
    <div className="util-tile">
      <div className="flex items-center justify-between gap-2 text-brand-800 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center text-brand-700 shrink-0">
            <FeatureIcon name={feature.icon} className="w-3.5 h-3.5" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider truncate">{feature.name}</span>
        </div>
        <Link
          to="/explore/gold"
          className="text-[10px] font-semibold text-brand-700 hover:text-brand-900 whitespace-nowrap shrink-0"
        >
          View All →
        </Link>
      </div>
      {body}
    </div>
  );
};

export const FuelPriceWidget = ({ feature }) => {
  const fallback = feature.config || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    featureService
      .getFuelLive({ district: fallback.defaultDistrict || 'Chennai' })
      .then(({ data: res }) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fallback.defaultDistrict]);

  const c = data || fallback;
  const stateName = c.state || 'Tamil Nadu';
  const city = c.city || c.defaultDistrict || 'Chennai';

  return (
    <div className="util-tile">
      <div className="flex items-center justify-between gap-2 text-brand-800 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center text-brand-700 shrink-0">
            <FeatureIcon name={feature.icon} className="w-3.5 h-3.5" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider truncate">{feature.name}</span>
        </div>
        <Link
          to="/explore/fuel"
          className="text-[10px] font-semibold text-brand-700 hover:text-brand-900 whitespace-nowrap shrink-0"
        >
          View All →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 w-28 bg-stone-200 rounded" />
          <div className="h-4 w-24 bg-stone-200 rounded" />
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-600">
            Petrol <span className="font-bold text-slate-900">₹{c.petrol ?? '—'}</span>
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Diesel <span className="font-bold text-slate-900">₹{c.diesel ?? '—'}</span>
          </p>
          <p className="text-[10px] text-brand-700 font-semibold mt-1.5">{stateName}</p>
          <p className="text-[11px] text-slate-500">{city}</p>
          {c.source && (
            <p className="text-[10px] text-slate-400 mt-1">Live via {c.source}</p>
          )}
        </>
      )}
    </div>
  );
};

export const UtilityWidget = ({ feature }) => {
  const c = feature.config || {};
  const key = feature.key;

  let body = null;
  if (key === 'currency') {
    body = (
      <>
        <p className="text-[11px] text-slate-600 font-medium">{c.pair}</p>
        <p className="text-xl font-extrabold text-slate-900 mt-0.5">{c.rate}</p>
        <ChangeBadge value={c.changePercent} />
      </>
    );
  } else if (key === 'market') {
    body = (
      <>
        <p className="text-[11px] text-slate-600 font-medium">{c.index}</p>
        <p className="text-xl font-extrabold text-slate-900 mt-0.5">{Number(c.value).toLocaleString('en-IN')}</p>
        <ChangeBadge value={c.changePercent} />
      </>
    );
  } else if (key === 'traffic') {
    body = (
      <>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ring-4 ${c.level === 'normal' ? 'bg-emerald-500 ring-emerald-100' : 'bg-amber-500 ring-amber-100'}`} />
          <p className="text-sm font-bold text-slate-900">{c.statusLabel}</p>
        </div>
        <p className="text-[11px] text-slate-600 mt-1.5">{c.detail}</p>
        <p className="text-[11px] text-slate-500">{c.city} Traffic</p>
      </>
    );
  }

  return (
    <div className="util-tile">
      <div className="flex items-center gap-2 text-brand-800 mb-2.5">
        <span className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center text-brand-700">
          <FeatureIcon name={feature.icon} className="w-3.5 h-3.5" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider">{feature.name}</span>
      </div>
      {body}
    </div>
  );
};

export const TopNewsWidget = ({ feature, articles = [] }) => {
  const [hero, ...rest] = articles.slice(0, 4);
  return (
    <CardShell title={feature.name} titleTamil={feature.nameTamil} viewAllTo="/">
      {!hero ? (
        <p className="text-sm text-slate-600">No headlines yet.</p>
      ) : (
        <div className="grid md:grid-cols-5 gap-4 md:gap-5">
          <Link to={`/news/${hero.slug}`} className="md:col-span-3 group block">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-stone-100">
              <NewsImage
                src={hero.featuredImage || hero.image}
                seed={hero._id || hero.slug}
                alt={hero.title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
              <span className="absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider bg-white/95 text-slate-900 px-2.5 py-1 rounded-full shadow-soft">
                Top Story
              </span>
            </div>
            <h3 className="mt-3 font-headline font-bold text-slate-900 text-base sm:text-lg leading-snug group-hover:text-brand-800 font-tamil transition-colors">
              {hero.titleTamil || hero.title}
            </h3>
          </Link>
          <div className="md:col-span-2 space-y-3.5">
            {rest.map((a) => (
              <Link key={a._id || a.slug} to={`/news/${a.slug}`} className="flex gap-3 group">
                <NewsImage
                  src={a.featuredImage || a.image}
                  seed={a._id || a.slug}
                  alt=""
                  className="w-16 h-14 rounded-xl object-cover shrink-0 ring-1 ring-black/5"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-brand-800 font-tamil transition-colors">
                    {a.titleTamil || a.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">{timeAgo(a.publishedAt || a.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </CardShell>
  );
};

export const ImportantTodayWidget = ({ feature }) => (
  <CardShell title={feature.name} titleTamil={feature.nameTamil} viewAllTo={`/explore/${feature.key}`}>
    <ul className="space-y-3.5">
      {(feature.items || []).map((item) => (
        <li key={item._id} className="flex gap-3 items-start">
          <span
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-soft"
            style={{ backgroundColor: item.color || '#0d9488' }}
          >
            <FeatureIcon name={item.icon || 'alert'} className="w-4 h-4" />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-semibold text-slate-900 leading-snug">{item.titleTamil || item.title}</p>
            {item.meta?.badge && <p className="text-[11px] text-slate-600 mt-1">{item.meta.badge}</p>}
          </div>
        </li>
      ))}
    </ul>
  </CardShell>
);

const GOV_LEVEL_LABELS = {
  central: 'Central Government',
  tamil_nadu: 'Tamil Nadu Government',
  department: 'Department',
  other: 'Government',
};

const GOV_CATEGORY_LABELS = {
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

export const GovernmentNotificationsWidget = ({ feature }) => {
  const [items, setItems] = useState([]);
  const [titles, setTitles] = useState({
    title: feature.name,
    titleTa: feature.nameTamil,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    governmentNotificationService
      .getHub(3)
      .then(({ data }) => {
        if (cancelled) return;
        setItems(data.data || []);
        setTitles({
          title: data.title || feature.name,
          titleTa: data.titleTa || feature.nameTamil,
        });
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [feature.name, feature.nameTamil]);

  return (
    <CardShell
      title={titles.title}
      titleTamil={titles.titleTa}
      viewAllTo="/government-notifications"
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      ) : !items.length ? (
        <p className="text-sm text-slate-500">
          No published notifications yet.{' '}
          <Link to="/government-notifications" className="text-teal-700 font-semibold">
            View all
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item._id}>
              <Link
                to="/government-notifications"
                className="block p-2.5 -mx-1 rounded-xl hover:bg-stone-100/80 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">
                    {GOV_CATEGORY_LABELS[item.category] || item.category || 'General'}
                  </span>
                  <span className="text-[10px] text-slate-300">·</span>
                  <span className="text-[10px] font-medium text-slate-500">
                    {GOV_LEVEL_LABELS[item.level] || item.level}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                  {item.titleTamil || item.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {item.publishedAt
                    ? new Date(item.publishedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CardShell>
  );
};

export const MatrimonyWidget = ({ feature }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    matrimonyService
      .getHub(3)
      .then(({ data }) => {
        if (!cancelled) setItems(data.data || []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CardShell title={feature.name} titleTamil={feature.nameTamil} viewAllTo="/matrimony">
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      ) : !items.length ? (
        <p className="text-sm text-slate-500">
          No approved profiles yet.{' '}
          <Link to="/matrimony" className="text-teal-700 font-semibold">
            Browse matrimony
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item._id}>
              <Link
                to={`/matrimony/${item.profileId || item._id}`}
                className="flex gap-3 p-2.5 -mx-1 rounded-xl hover:bg-stone-100/80 transition-colors"
              >
                <NewsImage
                  src={item.profilePhoto}
                  seed={item._id}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover shrink-0 ring-1 ring-black/5"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <span className="truncate">{item.fullName}</span>
                    {item.isVerified && (
                      <span className="text-[10px] font-bold text-emerald-700 shrink-0">✓</span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {[item.age ? `${item.age} yrs` : null, item.profession, item.city || item.currentLocation]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.profileId}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CardShell>
  );
};

export const MarketplaceWidget = ({ feature }) => {
  const [items, setItems] = useState(feature.items || []);

  useEffect(() => {
    let cancelled = false;
    marketplaceService
      .getHubProducts(3)
      .then(({ data }) => {
        if (!cancelled && data.data?.length) setItems(data.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const list = items.length ? items : feature.items || [];

  return (
    <CardShell title={feature.name} titleTamil={feature.nameTamil} viewAllTo="/marketplace">
      {!list.length ? (
        <p className="text-sm text-slate-500">
          No live listings yet.{' '}
          <Link to="/seller/register" className="text-teal-700 font-semibold">
            Sell now
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {list.map((item) => (
            <li key={item._id}>
              <Link
                to={item.link || `/marketplace/${item._id}`}
                className="flex gap-3 p-2.5 -mx-1 rounded-xl hover:bg-stone-100/80 transition-colors"
              >
                <NewsImage src={item.image} seed={item._id} alt="" className="w-16 h-12 rounded-xl object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm font-extrabold text-teal-700">{item.meta?.price}</p>
                  <p className="text-[11px] text-slate-500">{item.meta?.location}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CardShell>
  );
};

export const DailyDoseWidget = ({ feature }) => (
  <CardShell title={feature.name} titleTamil={feature.nameTamil} viewAllTo={`/explore/${feature.key}`}>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
      {(feature.items || []).map((item) => (
        <Link
          key={item._id}
          to={item.link || `/explore/${feature.key}`}
          className="flex flex-col items-center text-center gap-2 p-3 rounded-2xl bg-stone-100/70 ring-1 ring-stone-200 hover:ring-brand-300 hover:bg-brand-50/50 transition-all"
        >
          <span
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-soft"
            style={{ backgroundColor: item.color || '#0d9488' }}
          >
            <FeatureIcon name={item.icon || 'spark'} className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold text-slate-900">{item.title}</span>
          {item.titleTamil && (
            <span className="text-[10px] text-slate-600 font-tamil leading-tight">{item.titleTamil}</span>
          )}
        </Link>
      ))}
    </div>
  </CardShell>
);

export const NewsQuizWidget = ({ feature }) => (
  <div className="rounded-2xl overflow-hidden h-full relative min-h-[168px] shadow-lift text-white p-5 sm:p-6 flex flex-col justify-between
    bg-gradient-to-br from-slate-950 via-slate-900 to-brand-800">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.25),transparent_45%)] pointer-events-none" />
    <div className="relative">
      <div className="flex items-center gap-2.5 mb-2">
        <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
          <FeatureIcon name="trophy" className="w-5 h-5 text-amber-300" />
        </span>
        <h2 className="font-bold text-lg font-headline">{feature.name}</h2>
      </div>
      <p className="text-sm text-white/70 leading-relaxed">{feature.config?.tagline || feature.description}</p>
    </div>
    <Link
      to={`/explore/${feature.key}`}
      className="relative mt-4 inline-flex self-start items-center px-5 py-2.5 rounded-2xl bg-brand-400 text-slate-900 text-sm font-bold hover:bg-brand-300 transition-colors shadow-soft"
    >
      {feature.config?.cta || 'Start Quiz'}
    </Link>
  </div>
);

export const LocalUpdatesWidget = ({ feature }) => (
  <CardShell
    title={`${feature.name}${feature.config?.city ? ` – ${feature.config.city}` : ''}`}
    titleTamil={feature.nameTamil}
    viewAllTo={`/explore/${feature.key}`}
  >
    <div className="grid grid-cols-2 gap-2.5">
      {(feature.items || []).map((item) => (
        <div key={item._id} className="rounded-2xl bg-stone-100/80 ring-1 ring-stone-200 p-3.5">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{item.title}</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{item.meta?.status}</p>
          <p className="text-[11px] text-slate-500">{item.meta?.detail}</p>
        </div>
      ))}
    </div>
  </CardShell>
);

export const TrendingWidget = ({ feature }) => (
  <CardShell title={feature.name} titleTamil={feature.nameTamil} viewAllTo={`/explore/${feature.key}`}>
    <ol className="space-y-2">
      {(feature.items || []).map((item, i) => (
        <li key={item._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-100/70 transition-colors">
          <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-800 text-xs font-extrabold flex items-center justify-center">
            {i + 1}
          </span>
          <span className="flex-1 text-sm font-semibold text-slate-900">{item.title}</span>
          <span className="text-[11px] text-slate-500 tabular-nums">{item.meta?.posts}</span>
        </li>
      ))}
    </ol>
  </CardShell>
);

export const CommunityWidget = ({ feature }) => (
  <CardShell title={feature.name} titleTamil={feature.nameTamil} viewAllTo={`/explore/${feature.key}`}>
    <ul className="space-y-4">
      {(feature.items || []).map((item) => (
        <li key={item._id} className="flex gap-3">
          <NewsImage src={item.image} seed={item._id} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-brand-100" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900">
              {item.title}{' '}
              <span className="font-normal text-slate-400">· {item.meta?.postedAgo}</span>
            </p>
            <p className="text-sm text-slate-600 mt-1 font-tamil leading-snug">{item.titleTamil || item.description}</p>
            <p className="text-[11px] text-slate-400 mt-1.5">
              ♥ {item.meta?.likes || 0} · 💬 {item.meta?.comments || 0}
            </p>
          </div>
        </li>
      ))}
    </ul>
  </CardShell>
);

export const PortalWidget = ({ feature }) => (
  <CardShell title={feature.name} titleTamil={feature.nameTamil}>
    <div className="flex flex-wrap gap-2">
      {(feature.config?.links || []).map((link) => (
        <Link key={link.path} to={link.path} className="hub-pill">
          {link.labelTamil || link.label}
        </Link>
      ))}
    </div>
  </CardShell>
);

export const FEATURE_RENDERERS = {
  weather: WeatherWidget,
  gold_price: GoldPriceWidget,
  currency: UtilityWidget,
  market: UtilityWidget,
  fuel_price: FuelPriceWidget,
  traffic: UtilityWidget,
  top_news: TopNewsWidget,
  important_today: ImportantTodayWidget,
  jobs: GovernmentNotificationsWidget,
  government_notifications: GovernmentNotificationsWidget,
  matrimony: MatrimonyWidget,
  marketplace: MarketplaceWidget,
  daily_dose: DailyDoseWidget,
  news_quiz: NewsQuizWidget,
  local_updates: LocalUpdatesWidget,
  trending: TrendingWidget,
  community_feed: CommunityWidget,
  portal_news: PortalWidget,
};

export const FeatureModule = ({ feature, articles, detail = false }) => {
  const Renderer = FEATURE_RENDERERS[feature.key];
  if (!Renderer) {
    return (
      <CardShell title={feature.name} titleTamil={feature.nameTamil} viewAllTo={`/explore/${feature.key}`}>
        <p className="text-sm text-slate-600">{feature.description || 'Module coming soon.'}</p>
        <p className="text-xs text-amber-700 mt-2">Add a renderer for key “{feature.key}” to customize this widget.</p>
      </CardShell>
    );
  }
  if (feature.key === 'top_news') {
    return <Renderer feature={feature} articles={articles} />;
  }
  if (feature.key === 'weather') {
    return <Renderer feature={feature} detail={detail} />;
  }
  if (feature.key === 'gold_price') {
    return <Renderer feature={feature} detail={detail} />;
  }
  return <Renderer feature={feature} />;
};
