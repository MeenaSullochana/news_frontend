import { useState } from 'react';
import { getImageUrl } from '../utils/images';

/**
 * News image with optional placeholder.
 * noPlaceholder=true → hide broken/missing images (no random dummy photos).
 */
const NewsImage = ({
  src,
  alt = '',
  seed = 'news',
  className = '',
  loading = 'lazy',
  noPlaceholder = false,
  placeholderClassName = '',
  ...props
}) => {
  const hasSrc = Boolean(src?.trim());
  const initial = hasSrc ? getImageUrl(src, seed) : '';
  const [imgSrc, setImgSrc] = useState(initial);
  const [failed, setFailed] = useState(!hasSrc);

  const handleError = () => {
    if (!failed) {
      setFailed(true);
      if (!noPlaceholder) {
        setImgSrc(getImageUrl('', seed));
      }
    }
  };

  if (failed && noPlaceholder) {
    return (
      <div
        className={`bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 ${placeholderClassName || className}`}
        aria-hidden
      >
        <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={handleError}
      {...props}
    />
  );
};

export default NewsImage;
