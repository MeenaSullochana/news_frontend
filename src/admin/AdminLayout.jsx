import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminPermissionsProvider, useAdminPermissions } from '../context/AdminPermissionsContext';
import { AdminThemeProvider } from '../context/AdminThemeContext';
import { useState, useEffect, useMemo } from 'react';
import AdminUserMenu from './AdminUserMenu';
import AdminRouteGuard from './AdminRouteGuard';
import AdminThemeToggle from './AdminThemeToggle';
import { ADMIN_PAGES } from '../config/adminPages';

const AdminLayoutInner = () => {
  const { user, logout, loading } = useAuth();
  const { pages, loading: permLoading, canAccessPage } = useAdminPermissions();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleNav = useMemo(() => {
    if (user?.role === 'SUPER_ADMIN') return ADMIN_PAGES;
    return ADMIN_PAGES.filter((item) => canAccessPage(item.key));
  }, [user?.role, pages, canAccessPage]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  if (loading || permLoading) {
    return (
      <div className="admin-page-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-slate-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user.role === 'SELLER') {
    return <Navigate to="/seller" replace />;
  }

  if (user.role === 'MATRIMONY') {
    return <Navigate to="/matrimony/member" replace />;
  }

  const isActive = (item) => {
    const { pathname } = location;
    if (item.exact) return pathname === item.path;
    if (item.match === 'articles-list') {
      return pathname === '/admin/articles' || pathname.startsWith('/admin/articles/edit/');
    }
    if (item.match === 'page-menu') {
      return pathname === '/admin/page-menu' || pathname.startsWith('/admin/page-menu/');
    }
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  };

  const currentPage = [...visibleNav].reverse().find((item) => isActive(item))?.label || 'Admin';

  const SidebarContent = ({ onNavigate }) => (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-5 border-b border-white/10">
        <Link to="/admin" onClick={onNavigate} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">Admin Panel</p>
            <p className="text-xs text-slate-400 mt-0.5">The Great India News</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {visibleNav.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <div className="px-3 py-2 mb-2">
          <p className="text-white text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-slate-400 truncate">{user.role.replace(/_/g, ' ')}</p>
        </div>
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
        >
          ← View Site
        </Link>
        <button
          onClick={() => { onNavigate?.(); logout(); }}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-page-bg">
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-news-dark lg:z-30 h-screen">
        <SidebarContent />
      </aside>

      <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <aside className={`absolute inset-y-0 left-0 w-[min(280px,85vw)] bg-news-dark flex flex-col shadow-2xl transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
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
        <header className="admin-header-bar sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-lg transition-colors hover:bg-slate-100"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{currentPage}</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Manage your news portal</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <AdminThemeToggle />
              <Link
                to="/"
                className="hidden sm:inline-flex text-sm text-slate-600 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-slate-50"
              >
                View Site
              </Link>
              <AdminUserMenu />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AdminRouteGuard>
            <Outlet />
          </AdminRouteGuard>
        </main>
      </div>
    </div>
  );
};

const AdminLayout = () => (
  <AdminThemeProvider>
    <AdminPermissionsProvider>
      <AdminLayoutInner />
    </AdminPermissionsProvider>
  </AdminThemeProvider>
);

export default AdminLayout;
