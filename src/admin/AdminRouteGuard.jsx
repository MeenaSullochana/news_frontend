import { Navigate, useLocation } from 'react-router-dom';
import { useAdminPermissions } from '../context/AdminPermissionsContext';
import { pathToPageKey } from '../config/adminPages';

const AdminRouteGuard = ({ children }) => {
  const location = useLocation();
  const { loading, canAccessPath, firstAllowedPath, isSuperAdmin } = useAdminPermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const pageKey = pathToPageKey(location.pathname);
  if (!pageKey || isSuperAdmin || canAccessPath(location.pathname)) {
    return children;
  }

  if (firstAllowedPath && firstAllowedPath !== location.pathname) {
    return <Navigate to={firstAllowedPath} replace />;
  }

  return (
    <div className="admin-card text-center py-16">
      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Access denied</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">Your role does not have permission to open this page.</p>
    </div>
  );
};

export default AdminRouteGuard;
