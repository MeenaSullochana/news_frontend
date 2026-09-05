import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { featureService } from '../services/articleService';
import { FeatureIcon } from '../features/FeatureIcons';

const WeatherDistrictDetail = () => {
  const { district } = useParams();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    featureService
      .getWeatherDistrict(district)
      .then(({ data }) => setWeather(data.data))
      .catch(() => setError('Could not load weather for this district.'))
      .finally(() => setLoading(false));
  }, [district]);

  const title = weather?.district || district;

  return (
    <div className="min-h-[50vh]">
      <Helmet>
        <title>{title} Weather | The Great India News</title>
      </Helmet>

      <div className="border-b border-stone-200/80 bg-white/60">
        <div className="container-news py-6 sm:py-8">
          <Link to="/explore/weather" className="text-xs font-semibold text-brand-700 hover:text-brand-900">
            ← All Tamil Nadu Districts
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <FeatureIcon name="cloud" className="w-7 h-7 text-brand-600" />
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-900">{title}</h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">Tamil Nadu · Live weather</p>
        </div>
      </div>

      <div className="container-news py-6">
        <div className="max-w-md hub-card p-5 sm:p-6">
          {loading && (
            <div className="space-y-3 animate-pulse">
              <div className="h-10 w-24 bg-stone-200 rounded-lg" />
              <div className="h-4 w-32 bg-stone-200 rounded" />
              <div className="h-4 w-40 bg-stone-200 rounded" />
            </div>
          )}

          {error && <p className="text-sm text-rose-600">{error}</p>}

          {!loading && !error && weather && (
            <>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {weather.temp}°{weather.unit || 'C'}
              </p>
              <p className="text-sm text-slate-600 mt-1">{weather.condition}</p>
              <p className="text-xs text-slate-500 mt-2">
                H {weather.high}° · L {weather.low}°
                {weather.feelsLike != null && ` · Feels like ${weather.feelsLike}°`}
              </p>
              {weather.humidity != null && (
                <p className="text-xs text-slate-500 mt-1">
                  Humidity {weather.humidity}% · Wind {weather.windSpeed ?? '—'} km/h {weather.windDirection}
                </p>
              )}

              {weather.forecast?.length > 0 && (
                <div className="mt-5 pt-5 border-t border-stone-200">
                  <p className="text-xs font-semibold text-slate-700 mb-2">3-day forecast</p>
                  <div className="grid grid-cols-3 gap-2">
                    {weather.forecast.map((day) => (
                      <div key={day.date} className="text-center rounded-xl bg-stone-50 px-2 py-2">
                        <p className="text-[10px] text-slate-500">
                          {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                        </p>
                        <p className="text-sm font-bold text-slate-900">{day.high}°</p>
                        <p className="text-[10px] text-slate-500">{day.low}°</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {weather.hourly?.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Next 24 hours</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {weather.hourly.slice(0, 12).map((h) => (
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

              <p className="text-[10px] text-slate-400 mt-4">Live via Open-Meteo</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherDistrictDetail;
