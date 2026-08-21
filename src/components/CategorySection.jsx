import NewsCard from './NewsCard';
import { Link } from 'react-router-dom';

const CategorySection = ({ title, articles, slug, loading }) => {
  if (loading) {
    return (
      <section className="mb-8">
        <div className="skeleton h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-64 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (!articles?.length) return null;

  const [main, ...rest] = articles;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">{title}</h2>
        {slug && (
          <Link to={`/${slug}`} className="text-sm text-brand-600 hover:underline font-medium">
            அனைத்தும் →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <NewsCard article={main} />
        </div>
        <div className="space-y-4">
          {rest.slice(0, 4).map((article) => (
            <NewsCard key={article._id} article={article} variant="horizontal" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
