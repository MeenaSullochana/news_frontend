/** Client mirror of server admin page keys — keep in sync with server/config/adminPages.js */
export const ADMIN_PAGES = [
  { key: 'dashboard', label: 'Dashboard', path: '/admin', icon: '📊', exact: true },
  { key: 'articles', label: 'Articles', path: '/admin/articles', icon: '📰', match: 'articles-list' },
  { key: 'articles-create', label: 'Add Article', path: '/admin/articles/create', icon: '✏️', exact: true },
  { key: 'categories', label: 'Categories', path: '/admin/categories', icon: '📁' },
  { key: 'authors', label: 'Authors', path: '/admin/authors', icon: '👤' },
  { key: 'media', label: 'Media', path: '/admin/media', icon: '🖼️' },
  { key: 'breaking-news', label: 'Breaking News', path: '/admin/breaking-news', icon: '🔴' },
  { key: 'advertisements', label: 'Advertisements', path: '/admin/advertisements', icon: '📢' },
  { key: 'adsense', label: 'AdSense Placement', path: '/admin/adsense', icon: '💹' },
  { key: 'google-analytics', label: 'Google Analytics', path: '/admin/google-analytics', icon: '📈' },
  { key: 'features', label: 'Features', path: '/admin/features', icon: '🧩' },
  { key: 'feature-content', label: 'Feature Content', path: '/admin/feature-content', icon: '🗂️' },
  { key: 'marketplace', label: 'Marketplace', path: '/admin/marketplace', icon: '🛒' },
  { key: 'matrimony', label: 'Matrimony', path: '/admin/matrimony', icon: '💍' },
  { key: 'youtube-slider', label: 'YouTube Slider', path: '/admin/youtube-slider', icon: '▶️' },
  { key: 'instagram-posts', label: 'Instagram Posts', path: '/admin/instagram-posts', icon: '📸' },
  { key: 'google-news', label: 'Google News', path: '/admin/google-news', icon: '🌐' },
  { key: 'travel-notifications', label: 'Travel Notifications', path: '/admin/travel-notifications', icon: '🚆' },
  { key: 'sports-live', label: 'Sports Live Updates', path: '/admin/sports-live', icon: '🏆' },
  { key: 'government-notifications', label: 'Government Notifications', path: '/admin/government-notifications', icon: '🏛️' },
  { key: 'aeo-geo', label: 'AEO & GEO', path: '/admin/aeo-geo', icon: '🎯' },
  { key: 'menu-management', label: 'Menu Management', path: '/admin/page-menu', icon: '📋', match: 'page-menu' },
  { key: 'users', label: 'Users', path: '/admin/users', icon: '👥' },
  { key: 'role-permissions', label: 'Role Permissions', path: '/admin/role-permissions', icon: '🔐' },
  { key: 'settings', label: 'Settings', path: '/admin/settings', icon: '⚙️' },
];

export const pathToPageKey = (pathname) => {
  if (!pathname || !pathname.startsWith('/admin')) return null;
  if (pathname === '/admin') return 'dashboard';
  if (pathname.startsWith('/admin/articles/create')) return 'articles-create';
  if (pathname.startsWith('/admin/articles')) return 'articles';
  if (pathname.startsWith('/admin/role-permissions')) return 'role-permissions';
  if (pathname.startsWith('/admin/matrimony')) return 'matrimony';
  if (pathname.startsWith('/admin/page-menu')) return 'menu-management';

  const match = ADMIN_PAGES.find(
    (p) => p.path !== '/admin' && (pathname === p.path || pathname.startsWith(`${p.path}/`))
  );
  return match?.key || null;
};

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  EDITOR: 'Editor',
  REPORTER: 'Reporter',
  AUTHOR: 'Author',
  AD_MANAGER: 'Ad Manager',
};
