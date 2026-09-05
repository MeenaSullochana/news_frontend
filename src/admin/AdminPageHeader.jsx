import { Link } from 'react-router-dom';

const AdminPageHeader = ({
  title,
  subtitle,
  actionLabel,
  actionTo,
  onAction,
  children,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
    </div>
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      {children}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary text-sm py-2.5 px-4 w-full sm:w-auto text-center">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="btn-primary text-sm py-2.5 px-4 w-full sm:w-auto">
          {actionLabel}
        </button>
      )}
    </div>
  </div>
);

export const StatusBadge = ({ status, active }) => {
  const styles = {
    PUBLISHED: 'bg-green-100 text-green-700 border-green-200',
    DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    APPROVED: 'bg-green-100 text-green-700 border-green-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
    INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200',
    SCHEDULED: 'bg-purple-100 text-purple-700 border-purple-200',
    TRASH: 'bg-red-100 text-red-700 border-red-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  const label = typeof active === 'boolean' ? (active ? 'Active' : 'Inactive') : status;
  const key = typeof active === 'boolean' ? (active ? 'active' : 'inactive') : status;
  return (
    <span className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full border ${styles[key] || styles.DRAFT}`}>
      {label}
    </span>
  );
};

export default AdminPageHeader;
