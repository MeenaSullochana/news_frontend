import { useState } from 'react';
import { DEFAULT_NEWS_IMAGE, getImageUrl } from '../utils/images';

const NewsImage = ({
  src,
  alt = '',
  seed = 'news',
  className = '',
  loading = 'lazy',
  ...props
}) => {
  const initial = getImageUrl(src, seed);
  const [imgSrc, setImgSrc] = useState(initial);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (!failed) {
      setFailed(true);
      setImgSrc(DEFAULT_NEWS_IMAGE);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={handleError}
      {...props}
    />
  );
};

export default NewsImage;
