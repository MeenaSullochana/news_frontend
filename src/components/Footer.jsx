import { Link } from 'react-router-dom';
import { NAV_ITEMS } from '../utils/helpers';
import BrandLogo from './BrandLogo';
import SocialLinks from './SocialLinks';
import { getBrandAssetUrl, FOOTER_BRAND_LOGO_CLASS } from '../utils/images';
import { getConfiguredSocialLinks } from '../utils/socialLinks';

const Footer = ({ settings }) => {
  const footerAsset = settings?.footerLogo || settings?.headerLogo;
  const footerLogoUrl = getBrandAssetUrl(footerAsset);
  const hasCustomFooterLogo = Boolean(footerLogoUrl);
  const siteLabel = settings?.siteName || 'The Great India News';
  const hasSocialLinks = getConfiguredSocialLinks(settings).length > 0;

  return (
  <footer className="relative mt-16 overflow-hidden bg-slate-950 text-white/70">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.18),transparent_50%)] pointer-events-none" />
    <div className="container-news py-12 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className={`flex items-center gap-2.5 mb-4 ${hasCustomFooterLogo ? 'flex-col items-start sm:flex-row sm:items-center' : ''}`}>
            {hasCustomFooterLogo ? (
              <BrandLogo
                asset={footerAsset}
                className={FOOTER_BRAND_LOGO_CLASS}
                label={siteLabel}
                lazyVideo
              />
            ) : (
              <>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
            <h3 className="text-white font-bold text-lg font-headline leading-tight">
              {settings?.siteNameTamil || 'தி கிரேட் இந்தியா நியூஸ்'}
            </h3>
              </>
            )}
          </div>
          <p className="text-sm leading-relaxed text-white/55">
            Tamil Nadu, India and World news. Breaking news, politics, sports, cinema, technology and more.
          </p>
          {hasSocialLinks && (
            <div className="mt-6 lg:hidden">
              <SocialLinks settings={settings} title="Follow Us" />
            </div>
          )}
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/explore" className="hover:text-brand-300 transition-colors">Explore All</Link></li>
            <li><Link to="/about" className="hover:text-brand-300 transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-brand-300 transition-colors">Contact</Link></li>
            <li><Link to="/editorial-policy" className="hover:text-brand-300 transition-colors">Editorial Policy</Link></li>
            <li><Link to="/correction-policy" className="hover:text-brand-300 transition-colors">Correction Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Categories</h4>
          <ul className="space-y-2.5 text-sm">
            {NAV_ITEMS.slice(1, 8).map((item) => (
              <li key={item.path}>
                <Link to={item.path} className="hover:text-brand-300 transition-colors">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Legal</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/privacy-policy" className="hover:text-brand-300 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-brand-300 transition-colors">Terms of Use</Link></li>
            <li><Link to="/copyright" className="hover:text-brand-300 transition-colors">Copyright</Link></li>
            <li><Link to="/grievance" className="hover:text-brand-300 transition-colors">Grievance</Link></li>
          </ul>
          {settings?.contactEmail && (
            <p className="text-sm mt-5 text-white/55">
              Email:{' '}
              <a href={`mailto:${settings.contactEmail}`} className="text-brand-300 hover:underline">
                {settings.contactEmail}
              </a>
            </p>
          )}
          {hasSocialLinks && (
            <div className="mt-6 hidden lg:block">
              <SocialLinks settings={settings} title="Follow Us" />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm text-white/40">
        <p>{settings?.footerText || '© 2026 The Great India News. All rights reserved.'}</p>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
