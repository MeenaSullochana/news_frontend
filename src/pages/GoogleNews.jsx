import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { googleNewsService } from '../services/articleService';
import GoogleNewsCard from '../components/GoogleNewsCard';
import { SkeletonCard } from '../components/Loading';

const GoogleNews = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('Google News');
  const [titleTa, setTitleTa] = useState('கூகுள் நியூஸ்');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    googleNewsService
      .getPublicList({ page, limit: 18, q: search || undefined, category: category || undefined })
      .then(({ data }) => {
        setItems(data.data || []);
        setCategories(data.categories || []);
        setTitle(data.title || 'Google News');
        setTitleTa(data.titleTa || 'கூகுள் நியூஸ்');
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [page, search, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(q.trim());
  };

  return (
    <div className="min-h-[50vh]">
      <Helmet>
        <title>{title} | The Great India News</title>
        <meta name="description" content="Google News listing with original images and full summaries." />
      </Helmet>

      <div className="border-b border-stone-200 bg-white/70">
        <div className="container-news py-8">
          <Link to="/" className="text-xs font-semibold text-brand-700 hover:underline">← முகப்பு</Link>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-3">Via Google News</p>
          <h1 className="text-3xl font-headline font-bold text-slate-900 mt-1">{titleTa || title}</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Original images and complete summaries from Google News. Open any story to read the full available content on our site.
          </p>
          <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Google News…"
              className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white"
            />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm bg-white sm:w-44"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button type="submit" className="btn-primary text-sm shrink-0">Search</button>
          </form>
        </div>
      </div>

      <div className="container-news py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : !items.length ? (
          <div className="text-center py-16 text-slate-500">
            <p className="font-medium text-slate-700">No published Google News yet.</p>
            <Link to="/" className="text-brand-700 font-semibold mt-3 inline-block">Back to home</Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 mb-4">{pagination.total} stories</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {items.map((item) => (
                <GoogleNewsCard key={item._id} item={item} />
              ))}
            </div>
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="btn-secondary text-sm disabled:opacity-40">Previous</button>
                <span className="text-sm text-slate-500">Page {pagination.page} / {pagination.pages}</span>
                <button type="button" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="btn-secondary text-sm disabled:opacity-40">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleNews;
