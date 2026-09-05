import { Link } from 'react-router-dom';
import NewsImage from './NewsImage';
import { getGoogleNewsExcerpt } from '../utils/text';
import { formatDateTime } from '../utils/helpers';

const GoogleNewsCard = ({ item }) => {
  if (!item) return null;

  const title = item.title || '';
  const excerpt = getGoogleNewsExcerpt(item);
  const description = excerpt || 'No description available.';
  const href = item.slug ? `/news/${item.slug}` : null;
  const imageSeed = item.guid || item.slug || item._id || title;
  const hasImage = Boolean(item.image?.trim()) && !item.image.includes('picsum.photos') && !item.image.includes('googleusercontent.com');

  if (!href) return null;

  return (
    <Link
      to={href}
      className="group flex flex-col rounded-2xl border border-stone-200 bg-white overflow-hidden hover:border-brand-300 hover:shadow-md transition-all h-full min-h-[320px]"
    >
      <div className="aspect-video overflow-hidden bg-stone-100 shrink-0">
        {hasImage ? (
          <NewsImage
            src={item.image}
            seed={imageSeed}
            alt={title}
            noPlaceholder
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            placeholderClassName="w-full h-full aspect-video"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <span className="text-xs font-semibold text-slate-500 px-3 text-center line-clamp-2">
              {item.sourceName || 'News'}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {item.category && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">{item.category}</span>
          )}
          {item.isMustRead && (
            <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Must Read</span>
          )}
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-brand-700 line-clamp-3 leading-snug">
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed flex-1">{description}</p>
        <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 gap-2">
          <span className="truncate">{item.sourceName || 'Source'}</span>
          {item.publishedAt && (
            <time dateTime={item.publishedAt} className="shrink-0 whitespace-nowrap">
              {formatDateTime(item.publishedAt)}
            </time>
          )}
        </div>
        <span className="inline-block mt-3 text-xs font-semibold text-brand-700 group-hover:underline">Read More →</span>
      </div>
    </Link>
  );
};

export default GoogleNewsCard;
