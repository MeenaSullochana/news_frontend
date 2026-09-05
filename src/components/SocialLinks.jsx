import { useMemo } from 'react';
import { getConfiguredSocialLinks } from '../utils/socialLinks';

const iconClass = 'w-[18px] h-[18px]';

const SocialIcon = ({ id, className = iconClass }) => {
  switch (id) {
    case 'facebook':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.91h2.4V9.84c0-2.37 1.41-3.68 3.57-3.68 1.03 0 2.12.18 2.12.18v2.33h-1.2c-1.18 0-1.55.73-1.55 1.48v1.78h2.64l-.42 2.91h-2.22V22c4.78-.75 8.44-4.91 8.44-9.93z" />
        </svg>
      );
    case 'twitter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.261 5.688L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M23.5 6.2a3.02 3.02 0 00-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.56A3.02 3.02 0 00.5 6.2 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.8 3.02 3.02 0 002.12 2.14c1.84.56 9.38.56 9.38.56s7.54 0 9.38-.56a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.17.15 4.67 1.69 4.82 4.82.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.12-1.66 4.67-4.82 4.82-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.17-.15-4.67-1.7-4.82-4.82-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.48 3.92 3.99 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16m0-2.16C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.41-11.85a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
        </svg>
      );
    case 'telegram':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M11.94 2C6.48 2 2.05 6.43 2.05 11.89c0 1.9.54 3.67 1.46 5.18L2 22l5.11-1.34a9.84 9.84 0 004.83 1.23h.01c5.46 0 9.89-4.43 9.89-9.89C21.84 6.43 17.41 2 11.94 2zm5.76 7.04l-1.97 9.3c-.14.64-.53.8-1.08.5l-3-2.21-1.45 1.39c-.16.16-.3.3-.61.3l.22-3.07 5.57-5.03c.24-.22-.05-.34-.38-.13l-6.89 4.34-2.97-.93c-.64-.2-.66-.64.14-.95l11.6-4.47c.54-.2 1.01.13.88.96z" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    default:
      return null;
  }
};

/**
 * Renders configured social icons from Admin settings.
 * variant: "footer" (icon buttons) | "inline" (compact text/icon row)
 */
const SocialLinks = ({ settings, variant = 'footer', className = '', title }) => {
  const links = useMemo(() => getConfiguredSocialLinks(settings), [settings]);

  if (!links.length) return null;

  if (variant === 'inline') {
    return (
      <nav aria-label="Social media" className={`flex flex-wrap items-center gap-2.5 ${className}`}>
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.label}
            aria-label={link.ariaLabel}
            className="hover:text-brand-300 transition-colors inline-flex items-center justify-center"
          >
            <SocialIcon id={link.id} className="w-3.5 h-3.5" />
          </a>
        ))}
      </nav>
    );
  }

  return (
    <div className={className}>
      {title ? (
        <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">{title}</h4>
      ) : null}
      <nav aria-label="Social media" className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.label}
            aria-label={link.ariaLabel}
            className="group inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-brand-500/25 hover:border-brand-400/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <SocialIcon id={link.id} />
          </a>
        ))}
      </nav>
    </div>
  );
};

export default SocialLinks;
