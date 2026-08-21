import DOMPurify from 'dompurify';

const config = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
};

export const sanitizeHtml = (html) => {
  if (!html) return '';
  return DOMPurify.sanitize(html, config);
};

export const generateArticleJsonLd = (article, siteName = 'The Great India News') => {
  if (!article) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || article.metaDescription,
    image: article.featuredImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.author?.name || 'Staff Reporter',
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: '/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `/news/${article.slug}`,
    },
    articleSection: article.category?.nameTamil || article.category?.name,
  };
};
