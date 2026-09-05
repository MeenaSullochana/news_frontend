import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { featureService } from '../services/articleService';
import { FeatureIcon } from '../features/FeatureIcons';

const weatherEmoji = (code) => {
  if (code == null) return '🌡️';
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 55) return '🌧️';
  if (code <= 82) return '🌦️';
  return '⛈️';
};

const DistrictCard = ({ item }) => (
  <Link
    to={`/explore/weather/${item.slug}`}
    className="hub-card p-4 hover:border-brand-300 hover:shadow-md transition-all group"
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="font-semibold text-slate-900 truncate group-hover:text-brand-800">{item.district}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{item.condition || '—'}</p>
      </div>
      <span className="text-xl shrink-0" aria-hidden>
        {weatherEmoji(item.weatherCode)}
      </span>
    </div>
    <div className="mt-3 flex items-end justify-between">
      <p className="text-2xl font-extrabold text-slate-900">
        {item.temp != null ? `${item.temp}°` : '—'}
      </p>
      <p className="text-[11px] text-slate-500">
        H {item.high ?? '—'}° · L {item.low ?? '—'}°
      </p>
    </div>
  </Link>
);

const WeatherDistricts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    featureService
      .getWeatherDistricts()
      .then(({ data: res }) => setData(res.data))
      .catch(() => setError('Could not load district weather. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const list = data?.districts || [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((d) => d.district.toLowerCase().includes(q));
  }, [data, search]);

  return (
    <div className="min-h-[50vh]">
      <Helmet>
        <title>Tamil Nadu Weather — All Districts | The Great India News</title>
        <meta
          name="description"
          content="Live weather for all Tamil Nadu districts — temperature, conditions, and forecasts."
        />
      </Helmet>

      <div className="border-b border-stone-200/80 bg-gradient-to-br from-sky-50/80 via-white to-cyan-50/40">
        <div className="container-news py-6 sm:py-8">
          <Link to="/explore" className="text-xs font-semibold text-brand-700 hover:text-brand-900">
            ← Explore All Features
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <FeatureIcon name="cloud" className="w-8 h-8 text-brand-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-900">
                {data?.state || 'Tamil Nadu'} Weather
              </h1>
              <p className="text-sm text-slate-600 font-tamil mt-0.5">தமிழ்நாடு மாவட்ட வானிலை</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-3 max-w-2xl">
            Live temperature and conditions for every district in Tamil Nadu. Tap a district for detailed forecast.
          </p>

          {data?.summary && (
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <span className="hub-pill bg-white">
                Hottest: {data.summary.hottest.district} {data.summary.hottest.temp}°
              </span>
              <span className="hub-pill bg-white">
                Coolest: {data.summary.coolest.district} {data.summary.coolest.temp}°
              </span>
              <span className="hub-pill bg-white">{data.summary.count} districts live</span>
            </div>
          )}
        </div>
      </div>

      <div className="container-news py-6">
        <div className="mb-5">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search district…"
            className="w-full max-w-md px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl skeleton" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-2xl px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((item) => (
              <DistrictCard key={item.slug || item.district} item={item} />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-slate-600">No districts match “{search}”.</p>
        )}

        {data?.source && (
          <p className="text-[11px] text-slate-400 mt-6">Live data via Open-Meteo · Updates every 10 minutes</p>
        )}
      </div>
    </div>
  );
};

export default WeatherDistricts;
