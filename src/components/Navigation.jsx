import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../utils/helpers';

const Navigation = () => {
  const location = useLocation();
  const scrollerRef = useRef(null);
  const activeRef = useRef(null);

  // Keep the active category visible when the route changes (mobile scroll strip).
  useEffect(() => {
    const scroller = scrollerRef.current;
    const active = activeRef.current;
    if (!scroller || !active) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const leftPad = 16;
    const rightPad = 16;
    const overflowLeft = activeRect.left < scrollerRect.left + leftPad;
    const overflowRight = activeRect.right > scrollerRect.right - rightPad;

    if (overflowLeft || overflowRight) {
      active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [location.pathname]);

  return (
    <nav className="bg-transparent" aria-label="Categories">
      <div className="container-news">
        <div
          ref={scrollerRef}
          className="flex items-center gap-1 overflow-x-auto overflow-y-hidden py-2.5 scrollbar-hide
            -mx-4 px-4 sm:mx-0 sm:px-0
            overscroll-x-contain touch-pan-x
            [scrollbar-width:none] [-ms-overflow-style:none]
            [-webkit-overflow-scrolling:touch]"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                ref={isActive ? activeRef : null}
                className={`nav-link flex-shrink-0 ${isActive ? 'nav-link-active' : ''}`}
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
