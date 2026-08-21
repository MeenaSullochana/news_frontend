import { Link } from 'react-router-dom';
import { NAV_ITEMS } from '../utils/helpers';

const Footer = ({ settings }) => (
  <footer className="bg-news-dark text-gray-300 mt-12">
    <div className="container-news py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-4 font-headline">
            {settings?.siteNameTamil || 'தி கிரேட் இந்தியா நியூஸ்'}
          </h3>
          <p className="text-sm leading-relaxed">
            Tamil Nadu, India and World news. Breaking news, politics, sports, cinema, technology and more.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/editorial-policy" className="hover:text-white">Editorial Policy</Link></li>
            <li><Link to="/correction-policy" className="hover:text-white">Correction Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Categories</h4>
          <ul className="space-y-2 text-sm">
            {NAV_ITEMS.slice(1, 8).map((item) => (
              <li key={item.path}>
                <Link to={item.path} className="hover:text-white">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white">Terms of Use</Link></li>
            <li><Link to="/copyright" className="hover:text-white">Copyright</Link></li>
            <li><Link to="/grievance" className="hover:text-white">Grievance</Link></li>
          </ul>
          {settings?.contactEmail && (
            <p className="text-sm mt-4">
              Email: <a href={`mailto:${settings.contactEmail}`} className="hover:text-white">{settings.contactEmail}</a>
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
        <p>{settings?.footerText || '© 2024 The Great India News. All rights reserved.'}</p>
      </div>
    </div>
  </footer>
);

export default Footer;
