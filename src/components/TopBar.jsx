import { Link } from 'react-router-dom';

const TopBar = ({ settings }) => (
  <div className="bg-news-dark text-white text-xs hidden md:block">
    <div className="container-news flex items-center justify-between py-1.5">
      <div className="flex items-center gap-4">
        <span>{new Date().toLocaleDateString('ta-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      <div className="flex items-center gap-4">
        {settings?.socialFacebook && (
          <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="hover:text-brand-400">Facebook</a>
        )}
        {settings?.socialTwitter && (
          <a href={settings.socialTwitter} target="_blank" rel="noopener noreferrer" className="hover:text-brand-400">X</a>
        )}
        {settings?.socialYoutube && (
          <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" className="hover:text-brand-400">YouTube</a>
        )}
        <Link to="/about" className="hover:text-brand-400">About</Link>
        <Link to="/contact" className="hover:text-brand-400">Contact</Link>
      </div>
    </div>
  </div>
);

export default TopBar;
