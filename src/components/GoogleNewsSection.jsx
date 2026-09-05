import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { googleNewsService } from '../services/articleService';
import GoogleNewsCard from './GoogleNewsCard';

const GoogleNewsSection = () => {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('Google News');
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    googleNewsService
      .getPublic(12)
      .then(({ data }) => {
        setItems(data.data || []);
        setTitle(data.title || 'Google News');
        setEnabled(data.enabled !== false);
      })
      .catch(() => {
        setItems([]);
        setEnabled(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !enabled || items.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold font-headline text-slate-900">{title}</h2>
        <Link
          to="/google-news"
          className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 hover:text-brand-600 transition-colors shrink-0"
        >
          Via Google News →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {items.map((item) => (
          <GoogleNewsCard key={item._id} item={item} />
        ))}
      </div>
      <div className="mt-4 text-center sm:text-right">
        <Link to="/google-news" className="text-sm text-brand-600 hover:underline font-medium">
          அனைத்தும் →
        </Link>
      </div>
    </section>
  );
};

export default GoogleNewsSection;
