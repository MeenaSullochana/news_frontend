import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import Navigation from './Navigation';
import MobileMenu from './MobileMenu';
import BrandLogo from './BrandLogo';
import { getBrandAssetUrl, HEADER_BRAND_LOGO_CLASS } from '../utils/images';

const SearchForm = ({ value, onChange, onSubmit, onClose, id, autoFocus = false, className = '' }) => (
  <form onSubmit={onSubmit} className={`flex items-stretch w-full min-w-0 ${className}`}>
    <div className="relative flex-1 min-w-0">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        id={id}
        type="search"
        value={value}
        onChange={onChange}
        placeholder="Search news…"
        autoFocus={autoFocus}
        className="w-full min-w-0 pl-10 pr-3 py-2.5 bg-stone-100 border border-stone-200 rounded-l-2xl text-sm
          focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 placeholder:text-slate-400"
      />
    </div>
    <button
      type="submit"
      className="flex-shrink-0 px-4 sm:px-5 py-2.5 bg-slate-950 text-white rounded-r-2xl text-sm font-semibold hover:bg-slate-900 transition-colors"
    >
      Go
    </button>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="flex-shrink-0 ml-2 p-2.5 text-slate-600 hover:bg-stone-100 rounded-xl transition-colors"
        aria-label="Close search"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </form>
);

const Header = ({ settings }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Hide sticky bottom ad while menu is open (avoids overlap on mobile)
  useEffect(() => {
    document.body.classList.toggle('mobile-menu-open', menuOpen);
    return () => document.body.classList.remove('mobile-menu-open');
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  const headerLogoUrl = getBrandAssetUrl(settings?.headerLogo);
  const hasCustomHeaderLogo = Boolean(headerLogoUrl);
  const siteLabel = settings?.siteName || 'The Great India News';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm">
      <TopBar settings={settings} />

      <div className="container-news">
        <div className="flex items-center justify-between gap-3 py-3 md:py-3.5">
          <Link to="/" className="flex-shrink-0 min-w-0 group">
            {hasCustomHeaderLogo ? (
              <BrandLogo
                asset={settings?.headerLogo}
                className={HEADER_BRAND_LOGO_CLASS}
                label={siteLabel}
                priority
              />
            ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center flex-shrink-0 ring-2 ring-brand-200/60">
                <span className="text-white font-extrabold text-lg tracking-tight">G</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 leading-tight font-headline line-clamp-2 sm:line-clamp-1">
                  {settings?.siteNameTamil || 'தி கிரேட் இந்தியா நியூஸ்'}
                </h1>
                <p className="text-[10px] md:text-xs text-slate-600/80 hidden sm:block truncate tracking-wide uppercase font-medium">
                  {siteLabel}
                </p>
              </div>
            </div>
            )}
          </Link>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="hidden lg:flex items-center max-w-xs xl:max-w-sm">
              <SearchForm
                id="header-search-desktop"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSubmit={handleSearch}
              />
            </div>

            <Link
              to="/seller/login"
              className="hidden sm:inline-flex items-center px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-teal-200 text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors whitespace-nowrap"
            >
              Seller Login
            </Link>

            {!searchOpen && (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="lg:hidden p-2.5 hover:bg-stone-100 rounded-xl transition-colors"
                aria-label="Open search"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setMenuOpen(true);
              }}
              className="lg:hidden p-2.5 hover:bg-stone-100 rounded-xl transition-colors"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="lg:hidden pb-3">
            <SearchForm
              id="header-search-mobile"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSubmit={handleSearch}
              onClose={closeSearch}
              autoFocus
            />
          </div>
        )}
      </div>

      <div className="border-t border-stone-200/60">
        <Navigation />
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
};

export default Header;
