import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll to the top on every route change (desktop + mobile).
 * Hash links still scroll to the matching element when present.
 */
const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.replace(/^#/, ''));
      if (id) {
        const timer = window.setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView();
            return;
          }
          window.scrollTo(0, 0);
        }, 0);
        return () => window.clearTimeout(timer);
      }
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    return undefined;
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
