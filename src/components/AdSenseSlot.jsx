import { useEffect, useRef, useState } from 'react';
import { adSenseService } from '../services/articleService';

const loadedPublishers = new Set();

const ensureAdSenseScript = (publisherId) => {
  if (!publisherId || typeof document === 'undefined') return;
  if (loadedPublishers.has(publisherId)) return;
  const existing = document.querySelector(`script[data-adsense-pub="${publisherId}"]`);
  if (existing) {
    loadedPublishers.add(publisherId);
    return;
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
  script.crossOrigin = 'anonymous';
  script.dataset.adsensePub = publisherId;
  document.head.appendChild(script);
  loadedPublishers.add(publisherId);
  window.adsbygoogle = window.adsbygoogle || [];
};

const AdUnit = ({ placement, className = '' }) => {
  const insRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!placement?.publisherId || !placement?.adSlotId) return;
    ensureAdSenseScript(placement.publisherId);
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense may throw if blocked or already filled
    }
  }, [placement]);

  if (!placement) return null;

  const style =
    placement.sizeMode === 'fixed'
      ? {
          display: 'inline-block',
          width: `${placement.width || 336}px`,
          height: `${placement.height || 280}px`,
          maxWidth: '100%',
        }
      : { display: 'block', width: '100%' };

  return (
    <div className={`ad-container ${className}`} data-adsense-location={placement.location}>
      <p className="text-[10px] text-gray-400 text-center mb-1 uppercase tracking-wider">Advertisement</p>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={placement.publisherId}
        data-ad-slot={placement.adSlotId}
        data-ad-format={placement.adFormat || 'auto'}
        data-full-width-responsive={placement.sizeMode === 'responsive' ? 'true' : 'false'}
      />
    </div>
  );
};

/**
 * Renders active AdSense placements for a location.
 * @param {string} location - e.g. header, article_top, homepage
 * @param {string} page - home | article | category | …
 * @param {string} category - optional category slug
 */
const AdSenseSlot = ({ location, customLocation = '', page = 'all', category = '', className = '' }) => {
  const [placements, setPlacements] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!location && !customLocation) return undefined;
    let cancelled = false;
    setLoaded(false);
    adSenseService
      .getPublic({ location, customLocation: customLocation || undefined, page, category: category || undefined })
      .then(({ data }) => {
        if (!cancelled) setPlacements(data.data || []);
      })
      .catch(() => {
        if (!cancelled) setPlacements([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [location, customLocation, page, category]);

  if (!loaded || !placements.length) return null;

  return (
    <>
      {placements.map((p) => (
        <AdUnit key={p._id} placement={p} className={className} />
      ))}
    </>
  );
};

export default AdSenseSlot;
