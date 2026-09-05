import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { featureService } from '../services/articleService';
import { FeatureIcon } from '../features/FeatureIcons';

const WeatherHomeSection = () => {
  const [weather, setWeather] = useState(null);
  const [state, setState] = useState('Tamil Nadu');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    featureService
      .getWeatherLive({ district: 'Chennai' })
      .then(({ data }) => {
        setWeather(data.data);
        if (data.data?.state) setState(data.data.state);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <FeatureIcon name="cloud" className="w-5 h-5 text-brand-600 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-lg font-headline font-bold text-slate-900 truncate">{state} Weather</h2>
            <p className="text-[11px] text-slate-500 font-tamil">தமிழ்நாடு வானிலை</p>
          </div>
        </div>
        <Link
          to="/explore/weather"
          className="text-xs font-semibold text-brand-700 hover:text-brand-900 whitespace-nowrap shrink-0"
        >
          All districts →
        </Link>
      </div>

      <div className="hub-card p-4 sm:p-5">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-8 w-16 bg-stone-200 rounded-lg" />
            <div className="h-3 w-28 bg-stone-200 rounded" />
          </div>
        ) : weather ? (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] text-slate-500 font-medium">{weather.district || weather.city}</p>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {weather.temp}°{weather.unit || 'C'}
              </p>
              <p className="text-sm text-slate-600 mt-0.5">{weather.condition}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                H {weather.high}° · L {weather.low}°
              </p>
            </div>
            <Link
              to="/explore/weather"
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-brand-50 text-brand-800 hover:bg-brand-100"
            >
              View all districts
            </Link>
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            <Link to="/explore/weather" className="text-brand-700 font-semibold">
              View Tamil Nadu district weather →
            </Link>
          </p>
        )}
      </div>
    </section>
  );
};

export default WeatherHomeSection;
