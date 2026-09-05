import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { marketplaceService } from '../services/articleService';
import NewsImage from '../components/NewsImage';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (query = '') => {
    setLoading(true);
    marketplaceService
      .getProducts({ q: query || undefined, limit: 24 })
      .then(({ data }) => setProducts(data.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(q.trim());
  };

  return (
    <div className="min-h-[50vh]">
      <Helmet>
        <title>Marketplace | The Great India News</title>
        <meta name="description" content="Buy and sell locally — browse approved Marketplace listings." />
      </Helmet>

      <div className="border-b border-stone-200 bg-white/70">
        <div className="container-news py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700">சந்தை</p>
              <h1 className="text-3xl font-headline font-bold text-slate-900 mt-1">Marketplace</h1>
              <p className="text-sm text-slate-600 mt-2 max-w-xl">
                Browse seller listings approved by our team. Send a direct enquiry to the seller for any product.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/seller/register" className="btn-primary text-sm">Sell on Marketplace</Link>
              <Link to="/seller/login" className="btn-secondary text-sm">Seller Login</Link>
            </div>
          </div>
          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-lg">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white"
            />
            <button type="submit" className="btn-primary text-sm">Search</button>
          </form>
        </div>
      </div>

      <div className="container-news py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-64 rounded-2xl" />
            ))}
          </div>
        ) : !products.length ? (
          <div className="text-center py-16 text-slate-500">
            <p>No approved products yet.</p>
            <Link to="/seller/register" className="text-teal-700 font-semibold mt-2 inline-block">Become a seller</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {products.map((p) => (
              <Link
                key={p._id}
                to={`/marketplace/${p._id}`}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <NewsImage src={p.image} seed={p._id} alt={p.title} className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform" />
                <div className="p-4">
                  <h2 className="font-semibold text-slate-900 line-clamp-2">{p.title}</h2>
                  <p className="text-lg font-bold text-teal-700 mt-1">₹{Number(p.price).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-500 mt-1">{p.location || p.seller?.city}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
