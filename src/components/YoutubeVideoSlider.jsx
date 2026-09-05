import { useEffect, useRef, useState } from 'react';
import { youtubeService } from '../services/articleService';

/**
 * Responsive YouTube carousel for the homepage.
 */
const YoutubeVideoSlider = () => {
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    youtubeService
      .getPublic()
      .then(({ data }) => {
        setChannel(data.data?.channel || null);
        setVideos(data.data?.videos || []);
      })
      .catch(() => {
        setVideos([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.85, 360);
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  if (loading || !channel || videos.length === 0) return null;

  const title = channel.sliderTitleTamil || channel.sliderTitle || 'YouTube';

  return (
    <section className="mb-10" aria-labelledby="youtube-slider-heading">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 id="youtube-slider-heading" className="text-xl md:text-2xl font-bold text-slate-900 font-headline">
            {title}
          </h2>
          {channel.channelTitle && (
            <p className="text-sm text-slate-500 mt-0.5">{channel.channelTitle}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            aria-label="Previous videos"
            onClick={() => scrollBy(-1)}
            className="w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next videos"
            onClick={() => scrollBy(1)}
            className="w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory scrollbar-thin"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {videos.map((v) => (
          <article
            key={v._id || v.videoId}
            className="snap-start shrink-0 w-[85%] sm:w-[48%] lg:w-[31%] max-w-sm"
          >
            <button
              type="button"
              onClick={() => setActiveId(v.videoId)}
              className="group w-full text-left"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200 shadow-sm">
                {v.thumbnail ? (
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="w-full h-full object-cover transition group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-300" />
                )}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg text-lg group-hover:scale-110 transition">
                    ▶
                  </span>
                </span>
              </div>
              <h3 className="mt-2.5 text-sm md:text-base font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-teal-800">
                {v.title}
              </h3>
              {v.publishedAt && (
                <time className="text-xs text-slate-400 mt-1 block">
                  {new Date(v.publishedAt).toLocaleDateString()}
                </time>
              )}
            </button>
          </article>
        ))}
      </div>

      {activeId && (
        <div
          className="fixed inset-0 z-[60] bg-black/75 flex items-center justify-center p-4"
          onClick={() => setActiveId(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -top-10 right-0 text-white text-sm hover:underline"
              onClick={() => setActiveId(null)}
            >
              Close
            </button>
            <iframe
              title="YouTube player"
              src={`https://www.youtube.com/embed/${activeId}?autoplay=1&rel=0`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default YoutubeVideoSlider;
