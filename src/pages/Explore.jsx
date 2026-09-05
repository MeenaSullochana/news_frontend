import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { featureService, articleService } from '../services/articleService';
import { FeatureModule } from '../features/FeatureWidgets';
import { colSpanClass, StatusPill } from '../features/FeatureIcons';

const Explore = () => {
  const [features, setFeatures] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      featureService.getHub(),
      articleService.getFeatured().catch(() => ({ data: { data: [] } })),
      articleService.getLatest(6).catch(() => ({ data: { data: [] } })),
    ])
      .then(([hubRes, featuredRes, latestRes]) => {
        if (cancelled) return;
        setFeatures(hubRes.data?.data?.features || []);
        const featured = featuredRes.data?.data || [];
        const latest = latestRes.data?.data || [];
        const merged = [...featured];
        latest.forEach((a) => {
          if (!merged.find((x) => x._id === a._id)) merged.push(a);
        });
        setArticles(merged);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load features. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byRow = useMemo(() => {
    const map = new Map();
    features.forEach((f) => {
      const row = f.row || 1;
      if (!map.has(row)) map.set(row, []);
      map.get(row).push(f);
    });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [features]);

  const utilities = features.filter((f) => f.category === 'utilities');
  const restRows = byRow.filter(([, items]) => items.some((f) => f.category !== 'utilities'));

  return (
    <div className="min-h-[60vh]">
      <Helmet>
        <title>Explore All Features | The Great India News</title>
        <meta
          name="description"
          content="Weather, gold rates, government notifications, matrimony, marketplace, quizzes, local updates and more — one hub for every Great India News feature."
        />
      </Helmet>

      <div className="relative overflow-hidden border-b border-stone-200/80">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/80 via-transparent to-cyan-50/40 pointer-events-none" />
        <div className="container-news py-8 sm:py-10 relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700 mb-2">All-in-one hub</p>
          <h1 className="text-3xl sm:text-4xl font-headline font-bold text-slate-900 tracking-tight">
            Explore Everything
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Live utilities, news, government notifications, matrimony, marketplace, quizzes and community — one clean dashboard for every service.
          </p>

          <div className="mt-6 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {features.map((f) => (
                <Link key={f.key} to={`/explore/${f.key}`} className="hub-pill">
                  {f.name}
                  <StatusPill status={f.status} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-news py-6 sm:py-8 space-y-5 sm:space-y-6">
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl skeleton" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-2xl px-4 py-3 shadow-soft">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {utilities.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {utilities.map((feature) => (
                  <FeatureModule key={feature.key} feature={feature} />
                ))}
              </div>
            )}

            {restRows.map(([row, items]) => {
              const modules = items.filter((f) => f.category !== 'utilities');
              if (!modules.length) return null;
              return (
                <div key={row} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {modules.map((feature) => (
                    <div key={feature.key} className={`col-span-1 ${colSpanClass(feature.colSpan)}`}>
                      <FeatureModule feature={feature} articles={articles} />
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
