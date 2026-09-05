import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userService } from '../services/articleService';
import AdminPageHeader from './AdminPageHeader';
import { ROLE_LABELS } from '../config/adminPages';

const RolePermissions = () => {
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(null);
  const [pages, setPages] = useState([]);
  const [roles, setRoles] = useState({});
  const [adminRoles, setAdminRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('EDITOR');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userService.getPermissionConfig();
      setPages(data.data?.pages || []);
      setRoles(data.data?.roles || {});
      setAdminRoles((data.data?.adminRoles || []).filter((r) => r !== 'SUPER_ADMIN'));
    } catch {
      toast.error('Failed to load role permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rolePages = roles[selectedRole] || [];

  const togglePage = (pageKey) => {
    setRoles((prev) => {
      const current = prev[selectedRole] || [];
      const next = current.includes(pageKey)
        ? current.filter((k) => k !== pageKey)
        : [...current, pageKey];
      return { ...prev, [selectedRole]: next };
    });
  };

  const selectAll = () => {
    setRoles((prev) => ({
      ...prev,
      [selectedRole]: pages.map((p) => p.key),
    }));
  };

  const clearAll = () => {
    setRoles((prev) => ({
      ...prev,
      [selectedRole]: ['dashboard'],
    }));
  };

  const handleSave = async () => {
    setSavingRole(selectedRole);
    try {
      await userService.updateRolePermissions(selectedRole, rolePages);
      toast.success(`${ROLE_LABELS[selectedRole] || selectedRole} permissions saved`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSavingRole(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading permissions…</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title="Role Permissions"
        subtitle="Choose which admin pages each role can access"
      >
        <Link to="/admin/users" className="btn-secondary text-sm py-2.5 px-4 w-full sm:w-auto">
          ← Back to Users
        </Link>
      </AdminPageHeader>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 mb-6">
        <strong>Super Admin</strong> always has full access. Changes apply when users refresh or log in again.
        Sidebar and page access are enforced for other roles.
      </div>

      <div className="admin-card mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select role</label>
        <div className="flex flex-wrap gap-2">
          {adminRoles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                selectedRole === role
                  ? 'admin-tab admin-tab-active'
                  : 'admin-tab'
              }`}
            >
              {ROLE_LABELS[role] || role.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Pages for {ROLE_LABELS[selectedRole] || selectedRole}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {rolePages.length} of {pages.length} pages enabled
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={selectAll} className="btn-secondary text-xs py-1.5 px-3">
              Enable all
            </button>
            <button type="button" onClick={clearAll} className="btn-secondary text-xs py-1.5 px-3">
              Dashboard only
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={savingRole === selectedRole}
              className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
            >
              {savingRole === selectedRole ? 'Saving…' : 'Save permissions'}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pages
            .filter((p) => p.key !== 'role-permissions')
            .map((page) => {
              const enabled = rolePages.includes(page.key);
              return (
                <label
                  key={page.key}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                    enabled
                      ? 'border-emerald-200 bg-emerald-50/60'
                      : 'border-slate-200 bg-white opacity-80'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{page.label}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{page.key}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => togglePage(page.key)}
                    className="rounded border-slate-300 h-5 w-5"
                  />
                </label>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;
