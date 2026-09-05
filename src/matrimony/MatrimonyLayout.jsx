import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const MEMBER_NAV = [
  { label: 'Dashboard', path: '/matrimony/member', icon: '💍', exact: true },
  { label: 'My Profile', path: '/matrimony/member/profile', icon: '📝' },
  { label: 'Enquiries', path: '/matrimony/member/enquiries', icon: '💬' },
];

const MatrimonyLayout = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/matrimony/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'MATRIMONY') {
    return <Navigate to={user.role === 'SELLER' ? '/seller' : '/admin'} replace />;
  }

  const isActive = (item) => {
    const { pathname } = location;
    if (item.exact) return pathname === item.path;
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  };

  const currentPage =
    [...MEMBER_NAV].reverse().find((item) => isActive(item))?.label || 'Matrimony';

  const SidebarContent = ({ onNavigate }) => (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-5 border-b border-white/10">
        <Link to="/matrimony/member" onClick={onNavigate} className="block">
          <p className="font-bold text-lg text-white leading-tight">Matrimony Portal</p>
          <p className="text-xs text-white/50 mt-1 truncate">{user.name}</p>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {MEMBER_NAV.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-teal-600 text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <div className="px-3 py-2 mb-1">
          <p className="text-white text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-white/40 truncate">{user.email}</p>
        </div>
        <Link
          to="/matrimony"
          onClick={onNavigate}
          className="flex items-center gap-2 px-3 py-2.5 text-sm text-teal-300 hover:bg-white/10 rounded-xl transition-colors"
        >
          Browse Profiles
        </Link>
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
        >
          ← View Site
        </Link>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-100">
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-slate-950 lg:z-30 h-screen">
        <SidebarContent />
      </aside>

      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <aside
          className={`absolute inset-y-0 left-0 w-[min(280px,85vw)] bg-slate-950 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <SidebarContent onNavigate={() => setSidebarOpen(false)} />
        </aside>
      </div>

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white border-b border-stone-200 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-1 hover:bg-stone-100 rounded-xl transition-colors"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">{currentPage}</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Manage your matrimony profile</p>
              </div>
            </div>
            <Link to="/matrimony" className="text-sm text-teal-700 font-medium px-3 py-1.5 rounded-lg hover:bg-teal-50">
              Browse
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MatrimonyLayout;
