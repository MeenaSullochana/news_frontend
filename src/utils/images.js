export const DEFAULT_NEWS_IMAGE = 'https://picsum.photos/seed/great-india-news-default/800/450';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const getImageUrl = (url, seed = 'news') => {
  if (!url || url.trim() === '') {
    return `https://picsum.photos/seed/${seed}/800/450`;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/')) {
    return API_BASE ? `${API_BASE}${url}` : url;
  }
  const path = `/${url}`;
  return API_BASE ? `${API_BASE}${path}` : path;
};

export const getArticleImage = (article) =>
  getImageUrl(article?.featuredImage, article?.slug || 'article');

export const getAuthorImage = (author) =>
  getImageUrl(author?.profileImage, author?.slug || 'author');

export const getSiteUrl = () =>
  import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
