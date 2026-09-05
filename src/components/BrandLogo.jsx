import { useEffect, useRef, useState } from 'react';
import { getBrandAssetUrl, getBrandPosterUrl, isBrandVideo } from '../utils/images';

const BrandVideo = ({ src, poster, className, label, priority = false, lazy = false }) => {
  const ref = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(!lazy || priority);

  useEffect(() => {
    if (!lazy || priority || shouldLoad) return undefined;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [lazy, priority, shouldLoad]);

  return (
    <span ref={ref} className="inline-flex flex-shrink-0">
      {shouldLoad ? (
        <video
          src={src}
          poster={poster || undefined}
          autoPlay
          loop
          muted
          playsInline
          preload={priority ? 'auto' : 'metadata'}
          className={className}
          aria-label={label}
        />
      ) : poster ? (
        <img src={poster} alt="" className={className} aria-hidden="true" decoding="async" />
      ) : (
        <span className={`${className} bg-transparent`} aria-hidden="true" />
      )}
    </span>
  );
};

const BrandLogo = ({ asset, className, label, priority = false, lazyVideo = false }) => {
  const url = getBrandAssetUrl(asset);
  if (!url) return null;

  const mediaKey = asset?.version || url;

  if (isBrandVideo(asset)) {
    const poster = getBrandPosterUrl(asset);
    return (
      <BrandVideo
        key={mediaKey}
        src={url}
        poster={poster}
        className={className}
        label={label}
        priority={priority}
        lazy={lazyVideo}
      />
    );
  }

  return (
    <img
      key={mediaKey}
      src={url}
      alt={label}
      className={className}
      fetchPriority={priority ? 'high' : 'auto'}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
};

export default BrandLogo;
