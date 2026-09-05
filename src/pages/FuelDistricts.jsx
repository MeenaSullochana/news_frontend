import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { featureService } from '../services/articleService';
import { FeatureIcon } from '../features/FeatureIcons';

const DistrictCard = ({ item }) => (
  <Link
    to={`/explore/fuel/${item.slug || item.district.toLowerCase()}`}
    className="hub-card p-4 hover:border-brand-300 hover:shadow-md transition-all group"
  >
    <p className="font-semibold text-slate-900 truncate group-hover:text-brand-800">{item.district}</p>
    <div className="mt-3 space-y-1.5">
      <p className="text-sm text-slate-600">
        Petrol <span className="font-bold text-slate-900">₹{item.petrol}</span>
      </p>
      <p className="text-sm text-slate-600">
        Diesel <span className="font-bold text-slate-900">₹{item.diesel}</span>
      </p>
    </div>
    {item.live && <p className="text-[10px] text-emerald-700 mt-2 font-medium">Live</p>}
  </Link>
);

const FuelDistricts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    featureService
      .getFuelDistricts()
      .then(({ data: res }) => setData(res.data))
      .catch(() => setError('Could not load fuel prices. Please try again.'))
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
        <title>Tamil Nadu Fuel Prices — All Districts | The Great India News</title>
      </Helmet>

      <div className="border-b border-stone-200/80 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/40">
        <div className="container-news py-6 sm:py-8">
          <Link to="/explore" className="text-xs font-semibold text-brand-700 hover:text-brand-900">
            ← Explore All Features
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <FeatureIcon name="fuel" className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-900">
                {data?.state || 'Tamil Nadu'} Fuel Prices
              </h1>
              <p className="text-sm text-slate-600 font-tamil mt-0.5">தமிழ்நாடு எரிபொருள் விலை</p>
            </div>
          </div>

          {data && (
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <span className="hub-pill bg-white">
                {data.defaultDistrict || 'Chennai'}: Petrol ₹{data.petrol} · Diesel ₹{data.diesel}
              </span>
              {data.summary && (
                <>
                  <span className="hub-pill bg-white">
                    Highest petrol: {data.summary.highestPetrol?.district} ₹{data.summary.highestPetrol?.petrol}
                  </span>
                  <span className="hub-pill bg-white">
                    Avg: ₹{data.summary.avgPetrol} / ₹{data.summary.avgDiesel}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container-news py-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search district…"
          className="w-full max-w-md px-4 py-2.5 rounded-xl border border-stone-200 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl skeleton" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-2xl px-4 py-3">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((item) => (
              <DistrictCard key={item.district} item={item} />
            ))}
          </div>
        )}

        {data?.source && (
          <p className="text-[11px] text-slate-400 mt-6">Live via {data.source} · Updated daily</p>
        )}
      </div>
    </div>
  );
};

export default FuelDistricts;
