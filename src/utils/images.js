export const DEFAULT_NEWS_IMAGE = 'https://picsum.photos/seed/great-india-news-default/800/450';

export const getImageUrl = (url, seed = 'news') => {
  if (!url || url.trim() === '') {
    return `https://picsum.photos/seed/${seed}/800/450`;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/')) {
    return url;
  }
  return `/${url}`;
};

export const getArticleImage = (article) =>
  getImageUrl(article?.featuredImage, article?.slug || 'article');

export const getAuthorImage = (author) =>
  getImageUrl(author?.profileImage, author?.slug || 'author');
