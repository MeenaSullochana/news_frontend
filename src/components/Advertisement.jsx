import { useEffect, useState } from 'react';
import { adService } from '../services/articleService';
import NewsImage from './NewsImage';

const Advertisement = ({ position, className = '', label = true }) => {
  const [ads, setAds] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    adService
      .getByPosition(position)
      .then(({ data }) => {
        if (!cancelled) setAds(data.data || []);
      })
      .catch(() => {
        if (!cancelled) setAds([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [position]);

  if (!loaded || !ads.length) return null;

  const ad = ads[0];
  const hasImage = ad.type === 'image' && ad.image?.trim();
  const hasCode = ad.type === 'code' && ad.code?.trim();
  const clickUrl = ad.link?.trim();
  const isClickable = Boolean(clickUrl && clickUrl !== '#');

  if (!hasImage && !hasCode) return null;

  const imageBlock = hasImage ? (
    <NewsImage
      src={ad.image}
      seed={`ad-${ad._id || position}`}
      alt={ad.title || 'Advertisement'}
      className="w-full rounded-md max-h-64 object-contain mx-auto bg-stone-50"
      loading="lazy"
    />
  ) : (
    <div className="overflow-hidden" dangerouslySetInnerHTML={{ __html: ad.code }} />
  );

  return (
    <div className={`ad-container ${className}`} data-ad-position={position}>
      {label && (
        <p className="text-[10px] text-gray-400 text-center mb-1 uppercase tracking-wider">
          Advertisement
        </p>
      )}
      {isClickable ? (
        <a
          href={clickUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block"
          aria-label={ad.title || 'Advertisement'}
        >
          {imageBlock}
        </a>
      ) : (
        <div className="block">{imageBlock}</div>
      )}
    </div>
  );
};

export default Advertisement;
