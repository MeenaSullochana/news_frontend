import { Link } from 'react-router-dom';
import { timeAgo } from '../utils/helpers';
import NewsImage from './NewsImage';

const FeaturedNews = ({ article }) => {
  if (!article) return null;

  return (
    <Link to={`/news/${article.slug}`} className="group block relative overflow-hidden rounded-xl">
      <div className="aspect-[16/10] md:aspect-[16/9] overflow-hidden">
        <NewsImage
          src={article.featuredImage}
          seed={article.slug}
          alt={article.imageAlt || article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
        {article.category && (
          <span className="inline-block bg-brand-600 text-xs font-bold px-2 py-0.5 rounded mb-2">
            {article.category.nameTamil || article.category.name}
          </span>
        )}
        <h2 className="text-xl md:text-3xl font-bold font-headline leading-tight group-hover:text-brand-200 transition-colors">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-sm md:text-base text-gray-200 mt-2 line-clamp-2 hidden md:block">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-300">
          <span>{timeAgo(article.publishedAt)}</span>
          {article.author && <span>• {article.author.name}</span>}
        </div>
      </div>
    </Link>
  );
};

export default FeaturedNews;
