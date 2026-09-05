import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { pageContentService } from '../services/articleService';

const IconBook = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const IconBookmark = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
  </svg>
);

const IconUser = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const STAT_ICONS = {
  calendar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  pin: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  reach: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    </svg>
  ),
  network: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
};

const CARD_ICONS = [IconBook, IconBookmark];

const getInitials = (name, fallback = 'TG') => {
  if (!name?.trim()) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
};

const About = () => {
  const [content, setContent] = useState(null);
  const [pageTitle, setPageTitle] = useState('About Us');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pageContentService
      .getPublicAbout()
      .then(({ data }) => {
        setContent(data.data.content);
        setPageTitle(data.data.title || 'About Us');
      })
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#25D366] rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-slate-600">Unable to load About Us content. Please try again later.</p>
      </div>
    );
  }

  const { hero, cards, founder, bureauOverview, meta } = content;
  const initials = founder.initials?.trim() || getInitials(founder.name);

  return (
    <>
      <Helmet>
        <title>{meta?.pageTitle || pageTitle} - The Great India News</title>
        {meta?.metaDescription && <meta name="description" content={meta.metaDescription} />}
      </Helmet>

      <div>
        <div className="container-news py-12 sm:py-16 lg:py-20">
          <header className="max-w-4xl mx-auto mb-12 sm:mb-16 text-center">
            <p className="text-[#25D366] text-xs sm:text-sm font-bold tracking-[0.2em] uppercase mb-4">
              {hero.label}
            </p>
            <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 text-slate-900">
              {hero.heading}
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
              {hero.description}
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 sm:mb-16">
            {cards.slice(0, 2).map((card, index) => {
              const CardIcon = CARD_ICONS[index] || IconBook;
              return (
                <article
                  key={card.title || index}
                  className="border border-slate-200 rounded-2xl p-6 sm:p-8 bg-white shadow-sm hover:border-[#25D366]/40 transition-colors"
                >
                  <div className="text-[#25D366] mb-4">
                    <CardIcon />
                  </div>
                  <h2 className="text-[#25D366] text-xs sm:text-sm font-bold tracking-[0.15em] uppercase mb-4">
                    {card.title}
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-6">
                    {card.content}
                  </p>
                  {card.footerLabel && (
                    <p className="text-[#25D366] text-xs font-bold tracking-[0.12em] uppercase">
                      {card.footerLabel}
                    </p>
                  )}
                </article>
              );
            })}
          </div>

          <section className="mb-12 sm:mb-16">
            <div className="flex items-center gap-2 text-[#25D366] mb-3">
              <IconUser />
              <span className="text-xs font-bold tracking-[0.15em] uppercase">Leadership</span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold mb-2 text-slate-900">
              {founder.sectionTitle}
            </h2>
            <p className="text-slate-500 mb-8 max-w-2xl">{founder.subtitle}</p>

            <article className="border border-slate-200 rounded-2xl p-6 sm:p-8 bg-white shadow-sm">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl sm:text-3xl font-bold text-black">{initials}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold mb-1 text-slate-900">{founder.name}</h3>
                  <p className="text-[#25D366] text-xs font-bold tracking-[0.15em] uppercase mb-4">
                    {founder.designation}
                  </p>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                    {founder.description}
                  </p>
                </div>
              </div>
            </article>
          </section>

          <section className="relative overflow-hidden rounded-2xl bg-[#0d2818] border border-[#25D366]/20 text-white">
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
              aria-hidden="true"
            >
              <span className="text-[8rem] sm:text-[12rem] font-black text-white/[0.03] tracking-widest">
                NEWS
              </span>
            </div>
            <div className="relative p-6 sm:p-8 lg:p-10">
              <h2 className="text-[#25D366] text-xs sm:text-sm font-bold tracking-[0.2em] uppercase mb-6 sm:mb-8">
                {bureauOverview.title}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {bureauOverview.stats.map((stat) => (
                  <div key={`${stat.label}-${stat.value}`} className="text-center sm:text-left">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#25D366]/10 text-[#25D366] mb-3">
                      {STAT_ICONS[stat.icon] || STAT_ICONS.calendar}
                    </div>
                    <p className="text-white/50 text-[10px] sm:text-xs font-bold tracking-[0.12em] uppercase mb-1">
                      {stat.label}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default About;
