import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { articleService } from '../services/articleService';
import NewsCard from '../components/NewsCard';
import { SkeletonCard } from '../components/Loading';
import Advertisement from '../components/Advertisement';

const CATEGORY_TITLES = {
  'tamil-nadu': 'தமிழ்நாடு',
  chennai: 'சென்னை',
  india: 'இந்தியா',
  world: 'உலகம்',
  politics: 'அரசியல்',
  business: 'வணிகம்',
  sports: 'விளையாட்டு',
  cinema: 'சினிமா',
  technology: 'தொழில்நுட்பம்',
  education: 'கல்வி',
  jobs: 'வேலைவாய்ப்பு',
  spiritual: 'ஆன்மிகம்',
  special: 'சிறப்பு',
  district: 'மாவட்ட செய்திகள்',
};

const Category = () => {
  const location = useLocation();
  const categorySlug = location.pathname.replace(/^\//, '');
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    articleService
      .getByCategory(categorySlug, page, 12)
      .then(({ data }) => {
        setArticles(data.data || []);
        setCategory(data.category);
        setPagination(data.pagination);
      })
      .catch(() => setError('Failed to load articles'))
      .finally(() => setLoading(false));
  }, [categorySlug, page]);

  const title = category?.nameTamil || CATEGORY_TITLES[categorySlug] || categorySlug;

  return (
    <>
      <Helmet>
        <title>{title} - The Great India News</title>
        <meta name="description" content={`${title} news - Latest updates from The Great India News`} />
      </Helmet>

      <div className="container-news py-6">
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-brand-600">முகப்பு</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{title}</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold font-headline text-news-dark mb-6">{title}</h1>

        <Advertisement position="top_banner" className="mb-6" />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={() => setPage(1)} className="btn-primary">Retry</button>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>இந்த பிரிவில் செய்திகள் இல்லை.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {articles.map((article) => (
                <NewsCard key={article._id} article={article} />
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.pages}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Category;
