import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { userService } from '../services/articleService';
import { ADMIN_PAGES } from '../config/adminPages';

const AdminPermissionsContext = createContext(null);

export const AdminPermissionsProvider = ({ children }) => {
  const { user } = useAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role === 'SELLER') {
      setPages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    userService
      .getMyPermissions()
      .then(({ data }) => setPages(data.data?.pages || []))
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
  }, [user]);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const canAccessPage = (pageKey) => {
    if (!pageKey) return true;
    if (isSuperAdmin) return true;
    return pages.includes(pageKey);
  };

  const canAccessPath = (pathname) => {
    const key = pathToPageKey(pathname);
    return canAccessPage(key);
  };

  const firstAllowedPath = useMemo(() => {
    if (isSuperAdmin) return '/admin';
    for (const item of ADMIN_PAGES) {
      if (pages.includes(item.key)) return item.path;
    }
    return '/admin';
  }, [isSuperAdmin, pages]);

  return (
    <AdminPermissionsContext.Provider
      value={{
        pages,
        loading,
        canAccessPage,
        canAccessPath,
        firstAllowedPath,
        isSuperAdmin,
        refreshPermissions: async () => {
          const { data } = await userService.getMyPermissions();
          setPages(data.data?.pages || []);
        },
      }}
    >
      {children}
    </AdminPermissionsContext.Provider>
  );
};

export const useAdminPermissions = () => {
  const ctx = useContext(AdminPermissionsContext);
  if (!ctx) {
    throw new Error('useAdminPermissions must be used within AdminPermissionsProvider');
  }
  return ctx;
};
