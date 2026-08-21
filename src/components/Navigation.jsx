import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../utils/helpers';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="border-t border-gray-100 bg-white">
      <div className="container-news">
        <div className="flex items-center overflow-x-auto scrollbar-hide py-1 -mx-4 px-4 md:mx-0 md:px-0">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
