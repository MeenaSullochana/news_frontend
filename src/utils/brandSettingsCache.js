import { getBrandAssetUrl, getBrandPosterUrl, isBrandVideo } from './images';

const CACHE_KEY = 'tgnews_public_settings_v2';

export const readCachedPublicSettings = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
};

export const writeCachedPublicSettings = (data) => {
  if (!data || typeof data !== 'object') return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...data, _cachedAt: Date.now() })
    );
  } catch {
    /* quota / private mode */
  }
};

export const patchCachedBrandAsset = (key, asset) => {
  const cached = readCachedPublicSettings() || {};
  writeCachedPublicSettings({ ...cached, [key]: asset });
};

export const preloadBrandAsset = (asset) => {
  const url = getBrandAssetUrl(asset);
  if (!url || typeof document === 'undefined') return;

  if (isBrandVideo(asset)) {
    const poster = getBrandPosterUrl(asset);
    if (poster) {
      const img = new Image();
      img.decoding = 'async';
      img.src = poster;
    }
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    video.load();
    return;
  }

  const img = new Image();
  img.decoding = 'async';
  img.fetchPriority = 'high';
  img.src = url;
};

export const warmBrandAssetsFromSettings = (settings) => {
  if (!settings) return;
  const header = settings.headerLogo;
  const footer = settings.footerLogo;
  if (header) preloadBrandAsset(header);
  if (footer && footer?.url !== header?.url) preloadBrandAsset(footer);
};
