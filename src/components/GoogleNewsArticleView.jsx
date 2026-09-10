import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { formatDateTime } from '../utils/helpers';
import { getImageUrl } from '../utils/images';
import { cleanGoogleNewsContent, toArticleParagraphs, truncateExcerpt } from '../utils/text';
import NewsImage from './NewsImage';
import GoogleNewsCard from './GoogleNewsCard';
import ShareButtons from './ShareButtons';

const GoogleNewsArticleView = ({ item, related = [] }) => {
  const title = item.title || '';
  const rawContent = item.content || item.description || '';
  const cleanedContent = cleanGoogleNewsContent(rawContent);
  const paragraphs = toArticleParagraphs(rawContent);
  const summary = truncateExcerpt(cleanedContent, 160);
  const imageSeed = item.guid || item.slug || item._id || title;
  const hasImage = Boolean(item.image?.trim()) && !item.image.includes('picsum.photos') && !item.image.includes('googleusercontent.com');

  return (
    <>
      <Helmet>
        <title>{title} - The Great India News</title>
        <meta name="description" content={summary} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={summary} />
        {hasImage && <meta property="og:image" content={getImageUrl(item.image, imageSeed)} />}
        <meta property="og:type" content="article" />
      </Helmet>

      <article className="container-news py-6">
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-brand-600">முகப்பு</Link>
          <span className="mx-2">/</span>
          <Link to="/google-news" className="hover:text-brand-600">Google News</Link>
        </nav>

        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Via Google News</p>

        {item.category && (
          <span className="inline-block text-sm text-brand-600 font-semibold mb-2 mr-2">{item.category}</span>
        )}
        {item.isMustRead && (
          <span className="inline-flex px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase mr-2">
            Must Read
          </span>
        )}

        <h1 className="text-2xl md:text-4xl font-bold font-headline text-news-dark leading-tight mb-4 mt-2">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6 pb-4 border-b">
          {item.sourceName && <span className="font-medium text-gray-700">{item.sourceName}</span>}
          <span>•</span>
          <time dateTime={item.publishedAt}>{formatDateTime(item.publishedAt)}</time>
        </div>

        {hasImage && (
          <figure className="mb-8">
            <NewsImage
              src={item.image}
              seed={imageSeed}
              alt={title}
              noPlaceholder
              className="w-full rounded-xl max-h-[560px] object-cover"
              placeholderClassName="w-full rounded-xl aspect-video"
              loading="eager"
            />
          </figure>
        )}

        {paragraphs.length > 0 ? (
          <div className="prose prose-slate max-w-none mb-8">
            <div className="article-content text-slate-800 leading-relaxed text-base md:text-lg">
              {paragraphs.map((para, index) => (
                <p key={index} className="mb-5 last:mb-0">
                  {para}
                </p>
              ))}
            </div>
          </div>
        ) : cleanedContent ? (
          <div className="prose prose-slate max-w-none mb-8">
            <p className="article-content text-slate-800 leading-relaxed text-base md:text-lg">{cleanedContent}</p>
          </div>
        ) : (
          <p className="text-slate-600 mb-8">No description available.</p>
        )}

        {item.link && (
          <p className="text-sm mb-8">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 font-semibold hover:underline"
            >
              Read full story at {item.sourceName || 'original source'} →
            </a>
          </p>
        )}

        {item.sourceName && (
          <p className="text-sm text-slate-500 mb-8 border-t pt-4">
            Source: <span className="font-medium text-slate-700">{item.sourceName}</span>
          </p>
        )}

        <ShareButtons title={title} />

        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t" aria-labelledby="related-google-news">
            <h2 id="related-google-news" className="text-xl font-bold font-headline text-slate-900 mb-6">
              Related News
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {related.map((rel) => (
                <GoogleNewsCard key={rel._id} item={rel} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
};

export default GoogleNewsArticleView;
