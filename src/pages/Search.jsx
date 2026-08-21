import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { articleService } from '../services/articleService';
import NewsCard from '../components/NewsCard';
import Loading, { SkeletonCard } from '../components/Loading';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    articleService
      .search(q, page, 12)
      .then(({ data }) => {
        setResults(data.data || []);
        setTotal(data.total || 0);
        setPagination(data.pagination);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [q, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      setPage(1);
    }
  };

  return (
    <>
      <Helmet>
        <title>Search: {q} - The Great India News</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="container-news py-6">
        <h1 className="text-2xl font-bold font-headline mb-6">🔍 Search News</h1>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-xl">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : q && results.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No results found for "{q}"</p>
            <p className="text-sm">Try different keywords</p>
          </div>
        ) : q ? (
          <>
            <p className="text-sm text-gray-500 mb-4">{total} results for "{q}"</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((article) => (
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
        ) : (
          <p className="text-gray-500">Enter a search term to find news articles.</p>
        )}
      </div>
    </>
  );
};

export default Search;
