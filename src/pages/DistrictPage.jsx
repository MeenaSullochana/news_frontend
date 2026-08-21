import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { articleService } from '../services/articleService';
import NewsCard from '../components/NewsCard';
import Loading, { SkeletonCard } from '../components/Loading';

const DistrictPage = () => {
  const { district } = useParams();
  const [articles, setArticles] = useState([]);
  const [districtInfo, setDistrictInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    setLoading(true);
    articleService
      .getByDistrict(district, page, 12)
      .then(({ data }) => {
        setArticles(data.data || []);
        setDistrictInfo(data.district);
        setPagination(data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [district, page]);

  const title = districtInfo?.nameTamil || district;

  return (
    <>
      <Helmet>
        <title>{title} News - The Great India News</title>
        <meta name="description" content={`${title} district news - Latest updates from Tamil Nadu`} />
      </Helmet>

      <div className="container-news py-6">
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-brand-600">முகப்பு</Link>
          <span className="mx-2">/</span>
          <Link to="/tamil-nadu" className="hover:text-brand-600">தமிழ்நாடு</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{title}</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold font-headline text-news-dark mb-6">
          {title} செய்திகள்
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>இந்த மாவட்டத்தில் செய்திகள் இல்லை.</p>
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
                <span className="px-4 py-2 text-sm">{page} / {pagination.pages}</span>
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

export default DistrictPage;
