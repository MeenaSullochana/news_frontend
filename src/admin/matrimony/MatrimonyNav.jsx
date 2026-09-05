import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/admin/matrimony', label: 'Dashboard', end: true },
  { to: '/admin/matrimony/add', label: 'Add Profile' },
  { to: '/admin/matrimony/profiles', label: 'Profile Listing' },
  { to: '/admin/matrimony/pending', label: 'Pending' },
  { to: '/admin/matrimony/approved', label: 'Approved' },
  { to: '/admin/matrimony/rejected', label: 'Rejected' },
  { to: '/admin/matrimony/featured', label: 'Featured' },
  { to: '/admin/matrimony/verified', label: 'Verified' },
  { to: '/admin/matrimony/categories', label: 'Categories' },
  { to: '/admin/matrimony/settings', label: 'Settings' },
];

const MatrimonyNav = () => (
  <nav className="flex flex-wrap gap-1.5 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
    {LINKS.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        end={link.end}
        className={({ isActive }) =>
          isActive ? 'admin-tab admin-tab-active' : 'admin-tab'
        }
      >
        {link.label}
      </NavLink>
    ))}
  </nav>
);

export default MatrimonyNav;
