import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { NAV_ITEMS } from '../utils/helpers';
import { useEffect, useState } from 'react';

const MobileMenu = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
      setSearchQuery('');
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] lg:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-950/55 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`absolute inset-y-0 right-0 flex h-[100dvh] max-h-[100dvh] w-[min(320px,88vw)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-stone-200 px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-800 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-slate-900 text-sm truncate">Menu</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 -mr-1 hover:bg-stone-100 rounded-xl transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3 border-b border-stone-200 flex-shrink-0">
          <form onSubmit={handleSearch} className="flex w-full min-w-0">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news…"
              className="flex-1 min-w-0 px-3 py-2.5 border border-stone-200 rounded-l-xl text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
            />
            <button
              type="submit"
              className="flex-shrink-0 px-4 py-2.5 bg-slate-900 text-white rounded-r-xl text-sm font-semibold"
            >
              Go
            </button>
          </form>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`block px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                  active
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-700 hover:bg-stone-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-stone-200 space-y-2 flex-shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Link
            to="/seller/login"
            onClick={onClose}
            className="block w-full text-center px-4 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold"
          >
            Seller Login
          </Link>
          <Link
            to="/seller/register"
            onClick={onClose}
            className="block w-full text-center px-4 py-2.5 rounded-xl border border-stone-200 text-slate-700 text-sm font-medium"
          >
            Become a Seller
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MobileMenu;
