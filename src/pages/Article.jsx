import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { articleService } from '../services/articleService';
import { sanitizeHtml, generateArticleJsonLd } from '../utils/sanitize';
import { formatDateTime } from '../utils/helpers';
import { getImageUrl } from '../utils/images';
import NewsImage from '../components/NewsImage';
import ShareButtons from '../components/ShareButtons';
import RelatedNews from '../components/RelatedNews';
import Advertisement from '../components/Advertisement';
import Loading from '../components/Loading';

const Article = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      articleService.getBySlug(slug),
      articleService.getRelated(slug),
    ])
      .then(([articleRes, relatedRes]) => {
        setArticle(articleRes.data.data);
        setRelated(relatedRes.data.data || []);
      })
      .catch(() => setError('Article not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loading />;
  if (error || !article) {
    return (
      <div className="container-news py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  const jsonLd = generateArticleJsonLd(article);

  return (
    <>
      <Helmet>
        <title>{article.seoTitle || article.title} - The Great India News</title>
        <meta name="description" content={article.metaDescription || article.excerpt} />
        {article.canonicalUrl && <link rel="canonical" href={article.canonicalUrl} />}
        <meta property="og:title" content={article.ogTitle || article.title} />
        <meta property="og:description" content={article.ogDescription || article.excerpt} />
        <meta property="og:image" content={getImageUrl(article.ogImage || article.featuredImage)} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.twitterTitle || article.title} />
        <meta name="twitter:description" content={article.twitterDescription || article.excerpt} />
        <meta name="twitter:image" content={getImageUrl(article.twitterImage || article.featuredImage)} />
        {jsonLd && (
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        )}
      </Helmet>

      <article className="container-news py-6">
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-brand-600">முகப்பு</Link>
          {article.category && (
            <>
              <span className="mx-2">/</span>
              <Link to={`/${article.category.slug}`} className="hover:text-brand-600">
                {article.category.nameTamil || article.category.name}
              </Link>
            </>
          )}
        </nav>

        {article.category && (
          <span className="inline-block text-sm text-brand-600 font-semibold mb-2">
            {article.category.nameTamil || article.category.name}
          </span>
        )}

        <h1 className="text-2xl md:text-4xl font-bold font-headline text-news-dark leading-tight mb-4">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6 pb-4 border-b">
          {article.author && (
            <Link to={`/author/${article.author.slug}`} className="font-medium text-gray-700 hover:text-brand-600">
              {article.author.name}
            </Link>
          )}
          <span>•</span>
          <time dateTime={article.publishedAt}>{formatDateTime(article.publishedAt)}</time>
          {article.updatedAt && article.updatedAt !== article.publishedAt && (
            <>
              <span>•</span>
              <span>Updated: {formatDateTime(article.updatedAt)}</span>
            </>
          )}
          {article.views > 0 && (
            <>
              <span>•</span>
              <span>{article.views} views</span>
            </>
          )}
        </div>

        <Advertisement position="article_top" className="mb-6" />

        {article.isLive && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <span className="inline-flex items-center gap-2 text-red-600 font-bold text-sm">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              LIVE
            </span>
            {article.liveUpdates?.length > 0 && (
              <div className="mt-4 space-y-4">
                {[...article.liveUpdates].reverse().map((update, i) => (
                  <div key={i} className="border-l-2 border-red-300 pl-4">
                    <time className="text-xs text-red-500 font-medium">{update.time}</time>
                    <p className="text-gray-800 mt-1">{update.updateText}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <figure className="mb-6">
          <NewsImage
            src={article.featuredImage}
            seed={article.slug}
            alt={article.imageAlt || article.title}
            className="w-full rounded-xl"
            loading="eager"
          />
            {article.imageCaption && (
              <figcaption className="text-sm text-gray-500 mt-2 text-center italic">
                {article.imageCaption}
              </figcaption>
            )}
        </figure>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
            />

            <Advertisement position="article_middle" className="my-8" />

            {article.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-brand-50 hover:text-brand-600"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t">
              <ShareButtons title={article.title} />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="sticky top-24">
              <ShareButtons title={article.title} />
              <Advertisement position="sidebar" className="mt-6" />
            </div>
          </aside>
        </div>

        <Advertisement position="article_bottom" className="mt-8" />
        <RelatedNews articles={related} />
      </article>
    </>
  );
};

export default Article;
