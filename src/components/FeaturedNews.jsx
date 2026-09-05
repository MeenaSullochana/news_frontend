import { Link } from 'react-router-dom';
import { timeAgo } from '../utils/helpers';
import NewsImage from './NewsImage';

const FeaturedNews = ({ article }) => {
  if (!article) return null;

  return (
    <Link to={`/news/${article.slug}`} className="group block relative overflow-hidden rounded-2xl shadow-md ring-1 ring-black/5">
      <div className="aspect-[16/10] md:aspect-[16/9] overflow-hidden">
        <NewsImage
          src={article.featuredImage}
          seed={article.slug}
          alt={article.imageAlt || article.title}
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
        {article.category && (
          <span className="inline-block bg-brand-500/95 text-slate-900 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2">
            {article.category.nameTamil || article.category.name}
          </span>
        )}
        <h2 className="text-xl md:text-3xl font-bold font-headline leading-tight group-hover:text-brand-200 transition-colors">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-sm md:text-base text-white/75 mt-2 line-clamp-2 hidden md:block">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-white/55">
          <span>{timeAgo(article.publishedAt)}</span>
          {article.author && <span>• {article.author.name}</span>}
        </div>
      </div>
    </Link>
  );
};

export default FeaturedNews;
