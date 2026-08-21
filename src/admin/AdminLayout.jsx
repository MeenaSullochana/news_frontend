import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Articles', path: '/admin/articles', icon: '📰' },
  { label: 'Add Article', path: '/admin/articles/create', icon: '✏️' },
  { label: 'Categories', path: '/admin/categories', icon: '📁' },
  { label: 'Authors', path: '/admin/authors', icon: '👤' },
  { label: 'Media', path: '/admin/media', icon: '🖼️' },
  { label: 'Breaking News', path: '/admin/breaking-news', icon: '🔴' },
  { label: 'Advertisements', path: '/admin/advertisements', icon: '📢' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
];

const AdminLayout = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const Sidebar = () => (
    <aside className="w-64 bg-news-dark text-gray-300 min-h-screen flex-shrink-0">
      <div className="p-4 border-b border-gray-700">
        <Link to="/admin" className="text-white font-bold text-lg">Admin Panel</Link>
        <p className="text-xs text-gray-400 mt-1">{user.name} • {user.role}</p>
      </div>
      <nav className="p-3 space-y-1">
        {ADMIN_NAV.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-brand-600 text-white' : 'hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-gray-700 mt-auto">
        <Link to="/" className="block px-3 py-2 text-sm hover:bg-gray-800 rounded-md mb-1">
          ← View Site
        </Link>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-md"
        >
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 z-50">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-brand-600">Admin</span>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
