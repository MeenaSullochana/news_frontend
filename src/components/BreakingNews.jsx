import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { breakingNewsService } from '../services/articleService';

const BreakingNews = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    breakingNewsService
      .getActive()
      .then(({ data }) => setNews(data.data || []))
      .catch(() => {});
  }, []);

  if (!news.length) return null;

  const text = news.map((n) => n.text).join('  •  ');

  return (
    <div className="bg-brand-700 text-white overflow-hidden">
      <div className="container-news flex items-center py-2">
        <span className="flex-shrink-0 bg-white text-brand-700 text-xs font-bold px-2 py-0.5 rounded mr-3 uppercase tracking-wide">
          🔴 Breaking
        </span>
        <div className="overflow-hidden flex-1">
          <div className="ticker-wrap">
            <div className="ticker-content text-sm font-medium">
              {news.map((item, i) => (
                <span key={item._id}>
                  {item.link ? (
                    <Link to={item.link} className="hover:underline mx-4">
                      {item.text}
                    </Link>
                  ) : (
                    <span className="mx-4">{item.text}</span>
                  )}
                  {i < news.length - 1 && ' • '}
                </span>
              ))}
              {news.length === 1 && <span className="mx-8">{text}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNews;
