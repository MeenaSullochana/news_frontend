const WhatsAppIcon = ({ className = 'w-10 h-10' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const isSafeWhatsAppUrl = (url = '') => {
  try {
    const parsed = new URL(String(url).trim());
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'chat.whatsapp.com' ||
      host === 'whatsapp.com' ||
      host === 'www.whatsapp.com' ||
      host === 'wa.me' ||
      host.endsWith('.whatsapp.com')
    );
  } catch {
    return false;
  }
};

/**
 * Global WhatsApp channel CTA — shown above Footer when settings.whatsapp_group_link is set.
 */
const WhatsAppChannelSection = ({ settings }) => {
  const link = String(settings?.whatsapp_group_link || '').trim();
  if (!link || !isSafeWhatsAppUrl(link)) return null;

  return (
    <section className="py-8 sm:py-10" aria-label="WhatsApp channel">
      <div className="container-news">
        <div className="rounded-2xl sm:rounded-3xl bg-[#25D366] px-5 py-8 sm:px-10 sm:py-10 text-center shadow-lg shadow-emerald-900/20">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/15 flex items-center justify-center text-white">
              <WhatsAppIcon className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
          </div>
          <p className="font-tamil text-white text-base sm:text-lg md:text-xl font-semibold leading-relaxed max-w-2xl mx-auto mb-6">
            செய்திகளை உடனுக்குடன் பெற தி கிரேட் இந்தியா நியூஸ் ஆப் சேனலில் இணையுங்கள்!
          </p>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 text-white font-semibold text-sm sm:text-base px-8 py-3 hover:bg-slate-800 transition-colors"
          >
            Join Our Channel
          </a>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppChannelSection;
