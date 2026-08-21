import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import Navigation from './Navigation';
import MobileMenu from './MobileMenu';

const Header = ({ settings }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <TopBar settings={settings} />

      <div className="container-news">
        <div className="flex items-center justify-between py-3 md:py-4">
          <Link to="/" className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-news-dark leading-tight font-headline">
                  {settings?.siteNameTamil || 'தி கிரேட் இந்தியா நியூஸ்'}
                </h1>
                <p className="text-[10px] md:text-xs text-gray-500 hidden sm:block">
                  {settings?.siteName || 'The Great India News'}
                </p>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search News"
                  className="w-40 md:w-64 px-3 py-1.5 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  autoFocus
                />
                <button type="submit" className="px-3 py-1.5 bg-brand-600 text-white rounded-r-md text-sm">
                  Go
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-md"
                aria-label="Search"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}

            <Link to="/admin/login" className="hidden md:inline-flex btn-primary text-sm py-1.5">
              Login
            </Link>

            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <Navigation />
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
};

export default Header;
