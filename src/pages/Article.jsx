import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { articleService, googleNewsService } from '../services/articleService';
import { sanitizeHtml, generateArticleJsonLd } from '../utils/sanitize';
import GoogleNewsArticleView from '../components/GoogleNewsArticleView';
import { formatDateTime } from '../utils/helpers';
import { getImageUrl, getMediaUrl } from '../utils/images';
import { getYoutubeEmbedUrl } from '../utils/youtube';
import NewsImage from '../components/NewsImage';
import ShareButtons from '../components/ShareButtons';
import RelatedNews from '../components/RelatedNews';
import Advertisement from '../components/Advertisement';
import AdSenseSlot from '../components/AdSenseSlot';
import Loading from '../components/Loading';

const Article = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [googleNews, setGoogleNews] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setArticle(null);
    setGoogleNews(null);
    setRelated([]);

    articleService
      .getBySlug(slug)
      .then((articleRes) => {
        setArticle(articleRes.data.data);
        return articleService.getRelated(slug);
      })
      .then((relatedRes) => setRelated(relatedRes.data.data || []))
      .catch(() => {
        googleNewsService
          .getBySlug(slug)
          .then(({ data }) => {
            setGoogleNews(data.data);
            return googleNewsService.getRelated(slug);
          })
          .then(({ data }) => setRelated(data.data || []))
          .catch(() => setError('Article not found'));
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loading />;
  if (error || (!article && !googleNews)) {
    return (
      <div className="container-news py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  if (googleNews) {
    return <GoogleNewsArticleView item={googleNews} related={related} />;
  }

  const jsonLd = generateArticleJsonLd(article);
  const youtubeEmbed = getYoutubeEmbedUrl(article.youtubeVideoLink);
  const audioUrl = getMediaUrl(article.audioReader);

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

        {article.isMustWatch && (
          <span className="inline-flex items-center gap-1.5 ml-0 mb-2 mr-2 px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wide">
            <span aria-hidden>▶</span>
            Must Watch
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
        <AdSenseSlot
          location="article_top"
          page="article"
          category={article.category?.slug || ''}
          className="mb-6"
        />

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

        {audioUrl && (
          <div className="mb-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm font-semibold text-slate-800 mb-2">Audio Reader</p>
            <audio controls preload="metadata" className="w-full" src={audioUrl}>
              Your browser does not support audio playback.
            </audio>
          </div>
        )}

        {youtubeEmbed && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-800 mb-2">YouTube Video</p>
            <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-sm">
              <iframe
                title={`${article.title} — YouTube video`}
                src={youtubeEmbed}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
            />

            <Advertisement position="article_middle" className="my-8" />
            <AdSenseSlot
              location="article_middle"
              page="article"
              category={article.category?.slug || ''}
              className="my-8"
            />

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
              <AdSenseSlot
                location="sidebar"
                page="article"
                category={article.category?.slug || ''}
                className="mt-6"
              />
            </div>
          </aside>
        </div>

        <AdSenseSlot
          location="article_bottom"
          page="article"
          category={article.category?.slug || ''}
          className="mt-8"
        />
        <RelatedNews articles={related} />
      </article>
    </>
  );
};

export default Article;
