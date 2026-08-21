import { Link } from 'react-router-dom';
import { NAV_ITEMS } from '../utils/helpers';

const MobileMenu = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-72 bg-white shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-brand-600">Menu</span>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className="block px-3 py-2.5 text-gray-700 hover:bg-brand-50 hover:text-brand-600 rounded-md font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Link to="/admin/login" onClick={onClose} className="btn-primary w-full text-center">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
