import { Link } from 'react-router-dom';
import { timeAgo } from '../utils/helpers';
import NewsImage from './NewsImage';

const NewsCard = ({ article, variant = 'default' }) => {
  if (!article) return null;

  if (variant === 'horizontal') {
    return (
      <Link to={`/news/${article.slug}`} className="flex gap-3 group">
        <div className="flex-shrink-0 w-24 h-16 md:w-32 md:h-20 overflow-hidden rounded-md">
          <NewsImage
            src={article.featuredImage}
            seed={article.slug}
            alt={article.imageAlt || article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          {article.category && (
            <span className="text-xs text-brand-600 font-medium">
              {article.category.nameTamil || article.category.name}
            </span>
          )}
          <h3 className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-brand-600 line-clamp-2 leading-snug mt-0.5">
            {article.title}
          </h3>
          <span className="text-xs text-gray-400 mt-1 block">{timeAgo(article.publishedAt)}</span>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/news/${article.slug}`} className="block group py-2 border-b border-gray-100 last:border-0">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-brand-600 line-clamp-2">
          {article.title}
        </h3>
        <span className="text-xs text-gray-400">{timeAgo(article.publishedAt)}</span>
      </Link>
    );
  }

  return (
    <Link to={`/news/${article.slug}`} className="card-news group block">
      <div className="aspect-video overflow-hidden">
        <NewsImage
          src={article.featuredImage}
          seed={article.slug}
          alt={article.imageAlt || article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        {article.category && (
          <span className="inline-block text-xs text-brand-600 font-semibold uppercase tracking-wide mb-1">
            {article.category.nameTamil || article.category.name}
          </span>
        )}
        <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-600 line-clamp-2 leading-snug font-headline">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{article.excerpt}</p>
        )}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <span>{timeAgo(article.publishedAt)}</span>
          {article.author && <span>{article.author.name}</span>}
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
