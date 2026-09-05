import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { featureService } from '../services/articleService';
import { FeatureIcon } from '../features/FeatureIcons';

const METAL_META = {
  gold: { emoji: '🥇', tamil: 'தங்கம்', color: 'from-amber-50 to-yellow-50 border-amber-200' },
  silver: { emoji: '🥈', tamil: 'வெள்ளி', color: 'from-slate-50 to-zinc-50 border-slate-200' },
  platinum: { emoji: '⚪', tamil: 'பிளாட்டினம்', color: 'from-stone-50 to-neutral-50 border-stone-200' },
  diamond: { emoji: '💎', tamil: 'வைரம்', color: 'from-sky-50 to-cyan-50 border-cyan-200' },
};

const formatPrice = (item) => {
  if (!item.price || item.price === 0) return '—';
  return `₹${Number(item.price).toLocaleString('en-IN')}`;
};

const sourceLabel = (item) => {
  if (!item.live) return null;
  if (item.source === 'ibja') return 'Live · IBJA India';
  if (item.source === 'goldprice.dev') return 'Live · goldprice.dev';
  if (item.source === 'yahoo-finance') return 'Live · market spot';
  if (item.source === 'indicative') return 'Indicative reference';
  return 'Live rate';
};

const MetalCard = ({ item }) => {
  const meta = METAL_META[item.type] || { emoji: '◆', tamil: '', color: 'from-stone-50 to-white border-stone-200' };
  const title = item.purity ? `${item.purity} ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}` : item.label || item.type;

  return (
    <div className={`hub-card p-4 sm:p-5 bg-gradient-to-br ${meta.color}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{item.type}</p>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">{title}</h2>
          {meta.tamil && <p className="text-[11px] text-slate-500 font-tamil">{meta.tamil}</p>}
        </div>
        <span className="text-2xl" aria-hidden>{meta.emoji}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
        {formatPrice(item)}
      </p>
      <p className="text-[11px] text-slate-500 mt-1">per {item.unit || 'unit'}</p>
      {item.change != null && item.change !== 0 && (
        <p className={`text-[11px] font-bold mt-2 ${item.change >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
          {item.change >= 0 ? '↑' : '↓'} ₹{Math.abs(item.change).toLocaleString('en-IN')} today
        </p>
      )}
      {item.live && sourceLabel(item) && (
        <p className="text-[10px] text-emerald-700 mt-2 font-medium">{sourceLabel(item)}</p>
      )}
      {item.type === 'diamond' && item.note && (
        <p className="text-[10px] text-slate-500 mt-2">{item.note}</p>
      )}
      {!item.live && item.price > 0 && (
        <p className="text-[10px] text-slate-500 mt-2">Admin rate</p>
      )}
    </div>
  );
};

const PreciousMetalsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    featureService
      .getGoldLive()
      .then(({ data: res }) => setData(res.data))
      .catch(() => setError('Could not load precious metals rates.'))
      .finally(() => setLoading(false));
  }, []);

  const stateName = data?.state || 'Tamil Nadu';
  const items = data?.items || [];

  const goldItems = items.filter((i) => i.type === 'gold');
  const otherItems = items.filter((i) => i.type !== 'gold');

  return (
    <div className="min-h-[50vh]">
      <Helmet>
        <title>{stateName} Gold, Silver & Precious Metals | The Great India News</title>
      </Helmet>

      <div className="border-b border-stone-200/80 bg-gradient-to-br from-amber-50/60 via-white to-stone-50/40">
        <div className="container-news py-6 sm:py-8">
          <Link to="/explore" className="text-xs font-semibold text-brand-700 hover:text-brand-900">
            ← Explore All Features
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <FeatureIcon name="gold" className="w-8 h-8 text-amber-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-900">
                {stateName} Precious Metals
              </h1>
              <p className="text-sm text-slate-600 font-tamil mt-0.5">தங்கம் · வெள்ளி · வைரம் · பிளாட்டினம்</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-3 max-w-2xl">
            Live gold, silver and platinum for Tamil Nadu — fetched from IBJA India rates when available, with international market fallback.
          </p>
        </div>
      </div>

      <div className="container-news py-6 space-y-8">
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl skeleton" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-2xl px-4 py-3">{error}</div>
        )}

        {!loading && !error && (
          <>
            {goldItems.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Gold · தங்கம்</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {goldItems.map((item) => (
                    <MetalCard key={`${item.type}-${item.purity}`} item={item} />
                  ))}
                </div>
              </section>
            )}

            {otherItems.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Other metals</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherItems.map((item) => (
                    <MetalCard key={item.type} item={item} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {data?.source && (
          <p className="text-[11px] text-slate-400">
            Live via {data.source} · {data.note}
            {data.updatedAt && (
              <> · Updated {new Date(data.updatedAt).toLocaleString('en-IN')}</>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default PreciousMetalsPage;
