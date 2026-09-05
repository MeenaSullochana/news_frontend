/**
 * Normalize / classify Google Analytics & Tag Manager IDs.
 * Users often paste a GA4 Measurement ID (G-…) into the GTM field.
 */

export const classifyAnalyticsId = (raw = '') => {
  const v = String(raw || '').trim();
  if (!v) return { type: 'empty', value: '' };
  if (/^GTM-[A-Z0-9]+$/i.test(v)) return { type: 'gtm', value: v.toUpperCase() };
  if (/^G-[A-Z0-9]+$/i.test(v)) return { type: 'ga4', value: v.toUpperCase() };
  if (/^UA-\d+-\d+$/i.test(v)) return { type: 'ua', value: v.toUpperCase() };
  if (/^\d{6,}$/.test(v)) return { type: 'property', value: v };
  return { type: 'unknown', value: v };
};

/**
 * Resolve usable tracking IDs from stored settings (handles swapped fields).
 */
export const resolveTrackingIds = (settings = {}) => {
  const gaField = classifyAnalyticsId(settings.googleAnalyticsId);
  const gtmField = classifyAnalyticsId(settings.googleTagManagerId);
  const propertyField = classifyAnalyticsId(settings.googleAnalyticsPropertyId);

  let measurementId = '';
  let gtmId = '';
  let propertyId = '';

  if (gaField.type === 'ga4' || gaField.type === 'ua') measurementId = gaField.value;
  if (gtmField.type === 'gtm') gtmId = gtmField.value;

  // Common mistake: Measurement ID saved under GTM field
  if (!measurementId && (gtmField.type === 'ga4' || gtmField.type === 'ua')) {
    measurementId = gtmField.value;
  }
  // Common mistake: GTM saved under Analytics field
  if (!gtmId && gaField.type === 'gtm') {
    gtmId = gaField.value;
  }

  if (propertyField.type === 'property') propertyId = propertyField.value;
  else if (gaField.type === 'property') propertyId = gaField.value;
  else if (gtmField.type === 'property') propertyId = gtmField.value;

  return {
    measurementId,
    gtmId,
    propertyId,
    // Treat string "false" from JSON/DB as disabled
    enabled: settings.analyticsEnabled !== false && settings.analyticsEnabled !== 'false' && Boolean(measurementId || gtmId),
  };
};

export const hintForAnalyticsField = (raw) => {
  const c = classifyAnalyticsId(raw);
  if (c.type === 'empty') return '';
  if (c.type === 'ga4') return 'Valid GA4 Measurement ID';
  if (c.type === 'ua') return 'Universal Analytics ID (legacy)';
  if (c.type === 'gtm') return 'This looks like a Tag Manager ID — paste it in the GTM field';
  if (c.type === 'property') {
    return 'This is a numeric Property ID (Admin UI). Tracking needs a Measurement ID like G-XXXXXXXX.';
  }
  return 'Unrecognized format. Use G-XXXXXXXX for GA4 or GTM-XXXX for Tag Manager.';
};

export const hintForGtmField = (raw) => {
  const c = classifyAnalyticsId(raw);
  if (c.type === 'empty') return '';
  if (c.type === 'gtm') return 'Valid Google Tag Manager container ID';
  if (c.type === 'ga4' || c.type === 'ua') {
    return 'This looks like a Google Analytics Measurement ID — paste it in the Analytics / Measurement ID field.';
  }
  if (c.type === 'property') return 'Numeric property IDs are not GTM containers. Use GTM-XXXXXXX.';
  return 'Expected format: GTM-XXXXXXX';
};
