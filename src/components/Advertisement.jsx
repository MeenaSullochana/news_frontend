import { useEffect, useState } from 'react';
import { adService } from '../services/articleService';
import NewsImage from './NewsImage';

const Advertisement = ({ position, className = '' }) => {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    adService
      .getByPosition(position)
      .then(({ data }) => setAds(data.data || []))
      .catch(() => {});
  }, [position]);

  if (!ads.length) return null;

  const ad = ads[0];

  return (
    <div className={`ad-container ${className}`}>
      <p className="text-[10px] text-gray-400 text-center mb-1 uppercase tracking-wider">Advertisement</p>
      {ad.type === 'code' ? (
        <div dangerouslySetInnerHTML={{ __html: ad.code }} />
      ) : ad.image ? (
        <a href={ad.link || '#'} target="_blank" rel="noopener noreferrer sponsored">
          <NewsImage
            src={ad.image}
            seed={`ad-${ad._id}`}
            alt={ad.title}
            className="w-full rounded-md"
            loading="lazy"
          />
        </a>
      ) : null}
    </div>
  );
};

export default Advertisement;
