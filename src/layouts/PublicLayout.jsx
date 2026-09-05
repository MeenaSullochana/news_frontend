import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import BreakingNews from '../components/BreakingNews';
import Footer from '../components/Footer';
import WhatsAppChannelSection from '../components/WhatsAppChannelSection';
import Advertisement from '../components/Advertisement';
import AdSenseSlot from '../components/AdSenseSlot';
import AnalyticsTracker from '../components/AnalyticsTracker';
import { settingService } from '../services/articleService';
import { resolveTrackingIds } from '../utils/analyticsIds';
import {
  readCachedPublicSettings,
  writeCachedPublicSettings,
  warmBrandAssetsFromSettings,
} from '../utils/brandSettingsCache';
import { getBrandAssetUrl, getBrandPosterUrl, isBrandImageFavicon, isBrandVideo } from '../utils/images';

const PublicLayout = () => {
  const [settings, setSettings] = useState(() => readCachedPublicSettings() || {});

  const loadSettings = useCallback(() => {
    settingService
      .getPublic()
      .then(({ data }) => {
        const next = data.data || {};
        setSettings(next);
        writeCachedPublicSettings(next);
        warmBrandAssetsFromSettings(next);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    warmBrandAssetsFromSettings(readCachedPublicSettings());
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const refresh = () => loadSettings();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadSettings]);

  const tracking = useMemo(() => resolveTrackingIds(settings || {}), [settings]);

  const faviconUrl = isBrandImageFavicon(settings?.favicon)
    ? getBrandAssetUrl(settings?.favicon)
    : '';

  const headerLogoUrl = getBrandAssetUrl(settings?.headerLogo);
  const headerPosterUrl = getBrandPosterUrl(settings?.headerLogo);

  const preloadLinks = useMemo(() => {
    const links = [];
    if (tracking.measurementId || tracking.gtmId) {
      links.push(
        <link key="preconnect-gtm" rel="preconnect" href="https://www.googletagmanager.com" />
      );
      links.push(
        <link key="dns-gtm" rel="dns-prefetch" href="https://www.googletagmanager.com" />
      );
    }
    if (headerLogoUrl) {
      if (isBrandVideo(settings?.headerLogo)) {
        links.push(
          <link key="preload-header-video" rel="preload" as="video" href={headerLogoUrl} type="video/mp4" />
        );
        if (headerPosterUrl) {
          links.push(
            <link key="preload-header-poster" rel="preload" as="image" href={headerPosterUrl} />
          );
        }
      } else {
        links.push(
          <link key="preload-header-logo" rel="preload" as="image" href={headerLogoUrl} fetchpriority="high" />
        );
      }
    }
    if (faviconUrl) {
      links.push(
        <link key="preload-favicon" rel="preload" as="image" href={faviconUrl} />
      );
    }
    return links;
  }, [headerLogoUrl, headerPosterUrl, faviconUrl, settings?.headerLogo, tracking.measurementId, tracking.gtmId]);

  return (
    <div className="min-h-screen flex flex-col pb-16 lg:pb-0">
      <Helmet>
        {preloadLinks}
        {faviconUrl ? (
          <link rel="icon" type={settings?.favicon?.mimeType || 'image/png'} href={faviconUrl} />
        ) : (
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        )}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={(settings.siteName || 'The Great India News') + ' RSS Feed'}
          href={`${(import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '')}/feed.xml`}
        />
      </Helmet>
      <AnalyticsTracker settings={settings} />
      <Header settings={settings} />
      <div className="container-news py-3">
        <Advertisement position="header" className="mb-2" />
        <AdSenseSlot location="header" page="all" className="mb-2" />
        <Advertisement position="top_banner" />
        <AdSenseSlot location="top_banner" page="all" />
      </div>
      <BreakingNews />
      <main className="flex-1">
        <Outlet context={{ settings }} />
      </main>
      <div className="container-news py-5">
        <Advertisement position="footer" />
        <AdSenseSlot location="footer" page="all" />
      </div>
      <WhatsAppChannelSection settings={settings} />
      <Footer settings={settings} />
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-stone-200 p-2 shadow-md mobile-sticky-ad">
        <Advertisement position="mobile_sticky" label={false} />
        <AdSenseSlot location="mobile_sticky" page="all" />
      </div>
    </div>
  );
};

export default PublicLayout;
