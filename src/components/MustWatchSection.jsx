import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articleService } from '../services/articleService';
import NewsImage from './NewsImage';
import { getYoutubeVideoId } from '../utils/youtube';
import { SkeletonCard } from './Loading';

const MustWatchSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articleService
      .getMustWatch(6)
      .then(({ data }) => setArticles(data.data || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !articles.length) return null;

  return (
    <section className="mb-10" aria-labelledby="must-watch-heading">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 id="must-watch-heading" className="text-xl md:text-2xl font-bold text-slate-900 font-headline">
            Must Watch
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Featured video stories from our editors</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {articles.map((article) => {
            const videoId = getYoutubeVideoId(article.youtubeVideoLink);
            const thumb = videoId
              ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              : article.featuredImage;

            return (
              <Link
                key={article._id}
                to={`/news/${article.slug}`}
                className="card-news group block overflow-hidden"
              >
                <div className="relative aspect-video overflow-hidden">
                  <NewsImage
                    src={thumb}
                    seed={article.slug}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase">
                    Must Watch
                  </span>
                  {videoId && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg text-lg group-hover:scale-110 transition">
                        ▶
                      </span>
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-600 line-clamp-2 leading-snug font-headline">
                    {article.title}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MustWatchSection;
