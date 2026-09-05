import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { settingService } from '../services/articleService';
import AdminPageHeader, { StatusBadge } from './AdminPageHeader';
import {
  classifyAnalyticsId,
  hintForAnalyticsField,
  hintForGtmField,
  resolveTrackingIds,
} from '../utils/analyticsIds';

const emptyForm = {
  analyticsEnabled: true,
  googleAnalyticsId: '',
  googleAnalyticsPropertyId: '',
  googleTagManagerId: '',
};

const GoogleAnalyticsAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setLoading(true);
    settingService
      .getAll()
      .then(({ data }) => {
        const d = data.data || {};
        const ga = String(d.googleAnalyticsId || '').trim();
        const gtm = String(d.googleTagManagerId || '').trim();
        const propertyStored = String(d.googleAnalyticsPropertyId || '').trim();
        const gaClass = classifyAnalyticsId(ga);
        const gtmClass = classifyAnalyticsId(gtm);

        // Auto-untangle common mis-paste: property in GA field, G- in GTM field
        let measurementId = gaClass.type === 'ga4' || gaClass.type === 'ua' ? ga : '';
        let gtmId = gtmClass.type === 'gtm' ? gtm : '';
        let propertyId = propertyStored || (gaClass.type === 'property' ? ga : '');

        if (!measurementId && (gtmClass.type === 'ga4' || gtmClass.type === 'ua')) {
          measurementId = gtm;
        }
        if (!gtmId && gaClass.type === 'gtm') {
          gtmId = ga;
        }
        if (!propertyId && gtmClass.type === 'property') {
          propertyId = gtm;
        }

        setForm({
          analyticsEnabled: d.analyticsEnabled !== false,
          googleAnalyticsId: measurementId,
          googleAnalyticsPropertyId: propertyId,
          googleTagManagerId: gtmId,
        });
      })
      .catch(() => toast.error('Failed to load analytics settings'))
      .finally(() => setLoading(false));
  }, []);

  const resolved = useMemo(() => resolveTrackingIds(form), [form]);
  const gaHint = hintForAnalyticsField(form.googleAnalyticsId);
  const gtmHint = hintForGtmField(form.googleTagManagerId);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    const gaClass = classifyAnalyticsId(form.googleAnalyticsId);
    const gtmClass = classifyAnalyticsId(form.googleTagManagerId);

    if (form.googleAnalyticsId && gaClass.type === 'gtm') {
      toast.error('Measurement ID field has a GTM- ID. Move it to Tag Manager.');
      return;
    }
    if (form.googleTagManagerId && (gtmClass.type === 'ga4' || gtmClass.type === 'ua')) {
      toast.error('Tag Manager field has a G-/UA- ID. Move it to Measurement ID.');
      return;
    }
    if (form.googleAnalyticsId && !['ga4', 'ua', 'empty'].includes(gaClass.type)) {
      toast.error('Use a Measurement ID like G-XXXXXXXX (not the numeric Property ID).');
      return;
    }
    if (form.googleTagManagerId && gtmClass.type !== 'gtm') {
      toast.error('Tag Manager ID must look like GTM-XXXXXXX (or leave empty).');
      return;
    }

    setSaving(true);
    try {
      await settingService.update({
        analyticsEnabled: Boolean(form.analyticsEnabled),
        googleAnalyticsId: String(form.googleAnalyticsId || '').trim().toUpperCase(),
        googleAnalyticsPropertyId: String(form.googleAnalyticsPropertyId || '').trim(),
        googleTagManagerId: String(form.googleTagManagerId || '').trim().toUpperCase(),
      });
      toast.success('Google Analytics settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const applySuggestedFix = () => {
    setForm((f) => {
      const next = { ...f };
      const ga = classifyAnalyticsId(f.googleAnalyticsId);
      const gtm = classifyAnalyticsId(f.googleTagManagerId);
      if (gtm.type === 'ga4' || gtm.type === 'ua') {
        if (!next.googleAnalyticsId || ga.type === 'property' || ga.type === 'empty') {
          if (ga.type === 'property') next.googleAnalyticsPropertyId = ga.value;
          next.googleAnalyticsId = gtm.value;
          next.googleTagManagerId = '';
        }
      }
      if (ga.type === 'gtm' && (!next.googleTagManagerId || gtm.type !== 'gtm')) {
        next.googleTagManagerId = ga.value;
        next.googleAnalyticsId = '';
      }
      if (ga.type === 'property') {
        next.googleAnalyticsPropertyId = ga.value;
        next.googleAnalyticsId = gtm.type === 'ga4' || gtm.type === 'ua' ? gtm.value : '';
        if (gtm.type === 'ga4' || gtm.type === 'ua') next.googleTagManagerId = '';
      }
      return next;
    });
    toast.success('Fields rearranged — review and Save');
  };

  const needsFix =
    classifyAnalyticsId(form.googleTagManagerId).type === 'ga4' ||
    classifyAnalyticsId(form.googleAnalyticsId).type === 'property' ||
    classifyAnalyticsId(form.googleAnalyticsId).type === 'gtm';

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <AdminPageHeader
        title="Google Analytics"
        subtitle="Manage GA4 Measurement ID, Tag Manager, and site tracking"
      />

      <div className="admin-card flex flex-wrap items-center gap-3 justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tracking status</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {resolved.enabled
              ? 'Scripts will load on the public website after save.'
              : 'Tracking is off or no valid Measurement / GTM ID is set.'}
          </p>
        </div>
        <StatusBadge active={resolved.enabled} />
      </div>

      {needsFix && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            IDs look swapped or incomplete. Your screenshot had a numeric Property ID in Analytics and a{' '}
            <code className="text-xs">G-…</code> Measurement ID under Tag Manager — that breaks tracking.
          </p>
          <button type="button" className="btn-secondary text-sm shrink-0" onClick={applySuggestedFix}>
            Auto-fix fields
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="admin-card space-y-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.analyticsEnabled}
            onChange={(e) => setField('analyticsEnabled', e.target.checked)}
            className="rounded border-slate-300"
          />
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Enable analytics tracking on the public site
          </span>
        </label>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            GA4 Measurement ID
          </label>
          <input
            className="admin-input font-mono"
            placeholder="G-XXXXXXXXXX"
            value={form.googleAnalyticsId}
            onChange={(e) => setField('googleAnalyticsId', e.target.value.trim())}
          />
          <p className="text-[11px] text-slate-500 mt-1">
            From Google Analytics → Admin → Data streams → Measurement ID (starts with G-).
          </p>
          {gaHint && (
            <p
              className={`text-[11px] mt-1 ${
                classifyAnalyticsId(form.googleAnalyticsId).type === 'ga4' ||
                classifyAnalyticsId(form.googleAnalyticsId).type === 'ua'
                  ? 'text-emerald-600'
                  : 'text-amber-700'
              }`}
            >
              {gaHint}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            GA4 Property ID <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            className="admin-input font-mono"
            placeholder="15338933363"
            value={form.googleAnalyticsPropertyId}
            onChange={(e) => setField('googleAnalyticsPropertyId', e.target.value.trim())}
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Numeric ID shown in Analytics Admin. Stored for reference only — it does not load tracking scripts.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Google Tag Manager ID <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            className="admin-input font-mono"
            placeholder="GTM-XXXXXXX"
            value={form.googleTagManagerId}
            onChange={(e) => setField('googleTagManagerId', e.target.value.trim())}
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Only if you use Tag Manager. Must start with GTM- (not G-).
          </p>
          {gtmHint && (
            <p
              className={`text-[11px] mt-1 ${
                classifyAnalyticsId(form.googleTagManagerId).type === 'gtm'
                  ? 'text-emerald-600'
                  : 'text-amber-700'
              }`}
            >
              {gtmHint}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 px-4 py-3 text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <p className="font-semibold text-slate-800 dark:text-slate-100">Resolved for the live site</p>
          <p>
            Measurement ID:{' '}
            <span className="font-mono">{resolved.measurementId || '—'}</span>
          </p>
          <p>
            GTM:{' '}
            <span className="font-mono">{resolved.gtmId || '—'}</span>
          </p>
          <p>
            Property ID:{' '}
            <span className="font-mono">{resolved.propertyId || '—'}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Analytics'}
          </button>
        </div>
      </form>

      <div className="admin-card text-sm text-slate-600 dark:text-slate-300 space-y-2">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">How to verify (Realtime / DebugView)</h3>
        <ol className="list-decimal pl-5 space-y-1 text-xs sm:text-sm">
          <li>
            Open the public site with debug mode:{' '}
            <code className="font-mono text-[11px]">http://localhost:5173/?ga_debug=1</code>
          </li>
          <li>
            DevTools → Network → filter <code className="font-mono">gtag/js</code> (status 200) and{' '}
            <code className="font-mono">google-analytics.com/g/collect</code> or{' '}
            <code className="font-mono">analytics.google.com/g/collect</code>.
          </li>
          <li>
            Console → type <code className="font-mono">window.__GIN_GA</code> — should show{' '}
            <code className="font-mono">scriptLoaded: true</code> and <code className="font-mono">pageViews ≥ 1</code>.
          </li>
          <li>GA4 → Admin → DebugView (with ?ga_debug=1) or Reports → Realtime within ~30–60 seconds.</li>
          <li>Click internal links (SPA routes) and confirm another collect request / Realtime page view.</li>
        </ol>
        <p className="text-xs text-slate-500 pt-2">
          Dashboard “Total Views” is from CMS article counters, not Google Analytics.
        </p>
      </div>
    </div>
  );
};

export default GoogleAnalyticsAdmin;
