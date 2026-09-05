import { useEffect, useRef, useState } from 'react';
import { instagramPostService } from '../services/articleService';
import { getImageUrl } from '../utils/images';

const PostCard = ({ post }) => {
  const images =
    post.carouselImages?.length > 0
      ? post.carouselImages
      : [post.image || post.thumbnailUrl || post.mediaUrl].filter(Boolean);
  const [index, setIndex] = useState(0);
  const touchX = useRef(null);
  const current = images[index] || images[0];

  const go = (dir) => {
    if (images.length < 2) return;
    setIndex((i) => (i + dir + images.length) % images.length);
  };

  return (
    <article className="snap-start shrink-0 w-[82%] sm:w-[48%] lg:w-[31%] max-w-sm bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
      <div
        className="relative aspect-square bg-slate-200 group"
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {current ? (
          <img
            src={getImageUrl(current, post.shortcode)}
            alt={post.title || post.caption || 'Instagram'}
            className="w-full h-full object-cover select-none"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No media</div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100"
              onClick={() => go(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100"
              onClick={() => go(1)}
            >
              ›
            </button>
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Image ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full ${i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-3">
        {post.category && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">{post.category}</span>
        )}
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mt-0.5">
          {post.title || post.caption || 'Instagram post'}
        </h3>
        {(post.caption || post.description) && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-3">{post.caption || post.description}</p>
        )}
        <a
          href={post.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs font-medium text-brand-600 hover:underline"
        >
          View on Instagram →
        </a>
      </div>
    </article>
  );
};

const InstagramPostsSection = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef(null);

  useEffect(() => {
    instagramPostService
      .getPublic()
      .then(({ data }) => setPosts(data.data || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <section className="mb-10" aria-labelledby="instagram-posts-heading">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 id="instagram-posts-heading" className="text-xl md:text-2xl font-bold text-slate-900 font-headline">
          Instagram
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Scroll left"
            className="w-9 h-9 rounded-full border border-slate-200 bg-white shadow-sm"
            onClick={() => scrollerRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            className="w-9 h-9 rounded-full border border-slate-200 bg-white shadow-sm"
            onClick={() => scrollerRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
          >
            ›
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
};

export default InstagramPostsSection;
