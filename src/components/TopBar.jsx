import { Link } from 'react-router-dom';
import SocialLinks from './SocialLinks';

const TopBar = ({ settings }) => (
  <div className="bg-slate-950 text-white/80 text-[11px] tracking-wide hidden md:block">
    <div className="container-news flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-brand-300 font-semibold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
          Live
        </span>
        <span className="text-white/50">|</span>
        <span>
          {new Date().toLocaleDateString('ta-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>
      <div className="flex items-center gap-4 font-medium">
        <SocialLinks settings={settings} variant="inline" />
        <Link to="/explore" className="hover:text-brand-300 transition-colors">
          Explore
        </Link>
        <Link to="/seller/login" className="hover:text-brand-300 transition-colors">
          Seller Login
        </Link>
        <Link to="/about" className="hover:text-brand-300 transition-colors">
          About
        </Link>
        <Link to="/contact" className="hover:text-brand-300 transition-colors">
          Contact
        </Link>
      </div>
    </div>
  </div>
);

export default TopBar;
