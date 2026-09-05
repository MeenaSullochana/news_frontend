import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveTrackingIds } from '../utils/analyticsIds';

const SCRIPT_GA = 'gin-ga4-script';
const SCRIPT_GTM = 'gin-gtm-script';
const NOSCRIPT_GTM = 'gin-gtm-noscript';
const STATE_KEY = '__GIN_GA';

/** Module singleton — survives React Strict Mode remounts */
const gaRuntime = {
  bootstrappedId: '',
  lastSentPath: '',
  initPromise: null,
};

const getDebugEnabled = () => {
  if (typeof window === 'undefined') return false;
  try {
    if (window.localStorage?.getItem('ga_debug') === '1') return true;
    if (new URLSearchParams(window.location.search).get('ga_debug') === '1') return true;
  } catch {
    /* ignore */
  }
  return false;
};

const ensureDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
  }
};

const logDebug = (...args) => {
  if (!getDebugEnabled()) return;
  // eslint-disable-next-line no-console
  console.info('[GA4]', ...args);
};

const updateDebugState = (patch) => {
  if (typeof window === 'undefined') return;
  window[STATE_KEY] = { ...(window[STATE_KEY] || {}), ...patch, updatedAt: new Date().toISOString() };
};

const loadGa4Script = (measurementId) =>
  new Promise((resolve) => {
    if (!measurementId || typeof document === 'undefined') {
      resolve(false);
      return;
    }
    ensureDataLayer();

    const existing = document.getElementById(SCRIPT_GA);
    if (existing) {
      if (existing.dataset.loaded === '1' || window[STATE_KEY]?.scriptLoaded) {
        resolve(true);
        return;
      }
      const done = (ok) => resolve(ok);
      existing.addEventListener(
        'load',
        () => {
          existing.dataset.loaded = '1';
          done(true);
        },
        { once: true }
      );
      existing.addEventListener('error', () => done(false), { once: true });
      window.setTimeout(
        () => done(existing.dataset.loaded === '1' || Boolean(window[STATE_KEY]?.scriptLoaded)),
        2000
      );
      return;
    }

    const s = document.createElement('script');
    s.id = SCRIPT_GA;
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    s.dataset.gaId = measurementId;
    s.onload = () => {
      s.dataset.loaded = '1';
      updateDebugState({ scriptLoaded: true, measurementId, scriptSrc: s.src });
      logDebug('gtag.js loaded', s.src);
      resolve(true);
    };
    s.onerror = () => {
      updateDebugState({ scriptLoaded: false, scriptError: true, measurementId });
      logDebug('gtag.js FAILED to load', s.src);
      resolve(false);
    };
    document.head.appendChild(s);
    updateDebugState({ scriptInjected: true, measurementId, scriptSrc: s.src });
    logDebug('gtag.js injecting', s.src);
  });

const injectGtm = (gtmId) => {
  if (!gtmId || typeof document === 'undefined') return;
  if (document.getElementById(SCRIPT_GTM)) return;

  ensureDataLayer();
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

  const s = document.createElement('script');
  s.id = SCRIPT_GTM;
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
  document.head.appendChild(s);

  if (!document.getElementById(NOSCRIPT_GTM) && document.body) {
    const ns = document.createElement('noscript');
    ns.id = NOSCRIPT_GTM;
    ns.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(
      gtmId
    )}" height="0" width="0" style="display:none;visibility:hidden" title="gtm"></iframe>`;
    document.body.insertBefore(ns, document.body.firstChild);
  }
  updateDebugState({ gtmId, gtmInjected: true });
};

const trackPageView = (measurementId, path, { isFirst = false } = {}) => {
  if (!measurementId || typeof window.gtag !== 'function') return false;

  const pagePath = path || '/';
  const pageTitle = typeof document !== 'undefined' ? document.title || '' : '';
  const pageLocation = typeof window !== 'undefined' ? window.location.href : pagePath;
  const debugMode = getDebugEnabled();

  ensureDataLayer();

  if (isFirst) {
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: true,
      page_path: pagePath,
      page_title: pageTitle,
      page_location: pageLocation,
      ...(debugMode ? { debug_mode: true } : {}),
    });
    logDebug('config + first page_view', { measurementId, pagePath, debugMode });
  } else {
    window.gtag('config', measurementId, {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: pageLocation,
      ...(debugMode ? { debug_mode: true } : {}),
    });
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: pageLocation,
      send_to: measurementId,
    });
    logDebug('SPA page_view', { measurementId, pagePath });
  }

  updateDebugState({
    measurementId,
    lastPath: pagePath,
    lastTitle: pageTitle,
    pageViews: (window[STATE_KEY]?.pageViews || 0) + 1,
    debugMode,
    scriptLoaded: Boolean(
      window[STATE_KEY]?.scriptLoaded || document.getElementById(SCRIPT_GA)?.dataset?.loaded === '1'
    ),
  });
  return true;
};

/**
 * Loads GA4 / GTM from public settings and tracks SPA navigations.
 * Uses a module singleton so React Strict Mode does not drop the first page_view.
 */
const AnalyticsTracker = ({ settings }) => {
  const location = useLocation();
  const pendingPathRef = useRef('');
  const ids = resolveTrackingIds(settings || {});
  const path = `${location.pathname}${location.search || ''}`;

  useEffect(() => {
    updateDebugState({
      enabled: ids.enabled,
      measurementId: ids.measurementId || null,
      gtmId: ids.gtmId || null,
      propertyId: ids.propertyId || null,
      settingsReceived: Boolean(settings && Object.keys(settings).length),
    });
  }, [ids.enabled, ids.measurementId, ids.gtmId, ids.propertyId, settings]);

  useEffect(() => {
    if (!ids.enabled) return undefined;
    if (ids.gtmId) injectGtm(ids.gtmId);
    if (!ids.measurementId) return undefined;

    const measurementId = ids.measurementId;
    pendingPathRef.current = path;

    const run = async () => {
      if (!gaRuntime.initPromise || gaRuntime.bootstrappedId !== measurementId) {
        if (gaRuntime.bootstrappedId !== measurementId || !gaRuntime.initPromise) {
          gaRuntime.initPromise = loadGa4Script(measurementId);
        }
      }

      const loaded = await gaRuntime.initPromise;
      if (!loaded) return;

      const targetPath = pendingPathRef.current || path;
      const firstForId = gaRuntime.bootstrappedId !== measurementId;

      // First config must NOT be aborted by Strict Mode effect cleanup
      if (firstForId) {
        gaRuntime.bootstrappedId = measurementId;
        trackPageView(measurementId, targetPath, { isFirst: true });
        gaRuntime.lastSentPath = targetPath;
        return;
      }

      if (gaRuntime.lastSentPath !== targetPath) {
        trackPageView(measurementId, targetPath, { isFirst: false });
        gaRuntime.lastSentPath = targetPath;
      }
    };

    const delay = gaRuntime.bootstrappedId === measurementId ? 60 : 0;
    if (delay === 0) {
      // Fire immediately on first boot so Strict Mode clearTimeout cannot drop it
      run();
      return undefined;
    }
    const t = window.setTimeout(run, delay);
    return () => {
      window.clearTimeout(t);
    };
  }, [ids.enabled, ids.measurementId, ids.gtmId, path]);

  return null;
};

export default AnalyticsTracker;
