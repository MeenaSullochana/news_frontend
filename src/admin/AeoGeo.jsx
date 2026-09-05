import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { aeoService } from '../services/articleService';
import { useAuth } from '../context/AuthContext';
import AdminPageHeader from './AdminPageHeader';
import GeminiGeneratePanel from './GeminiGeneratePanel';

const TABS = [
  { key: 'gemini', label: 'Gemini Generate' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'globalSeo', label: 'SEO Basics' },
  { key: 'aeoGeo', label: 'AEO & GEO' },
  { key: 'faqs', label: 'FAQs' },
  { key: 'entities', label: 'Entities' },
  { key: 'pages', label: 'Pages' },
  { key: 'schema', label: 'Schema' },
  { key: 'indexing', label: 'Indexing' },
  { key: 'reports', label: 'Reports' },
];

const Toggle = ({ checked, onChange, label, disabled }) => (
  <label className={`flex items-center justify-between gap-3 py-2 ${disabled ? 'opacity-50' : ''}`}>
    <span className="text-sm text-slate-700">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-teal-600' : 'bg-slate-300'}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow mt-0.5 transition ${checked ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
    </button>
  </label>
);

const AeoGeo = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [tab, setTab] = useState('gemini');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [geminiInfo, setGeminiInfo] = useState(null);
  const [dash, setDash] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [entities, setEntities] = useState([]);
  const [pages, setPages] = useState([]);
  const [schemaPrev, setSchemaPrev] = useState(null);
  const [rssPreview, setRssPreview] = useState('');
  const [rssPreviewType, setRssPreviewType] = useState('main');
  const [rssPreviewUpdatedAt, setRssPreviewUpdatedAt] = useState(null);
  const [report, setReport] = useState(null);
  const [usage, setUsage] = useState([]);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', isActive: true, includeInSchema: true });
  const [entityForm, setEntityForm] = useState({ name: '', type: 'topic', isActive: true });

  const loadCore = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: cfg }, { data: st }] = await Promise.all([
        aeoService.getConfig(),
        aeoService.getGeminiStatus(),
      ]);
      setConfig(cfg.data);
      setGeminiInfo({ ...cfg.gemini, ...st.data });
    } catch {
      toast.error('Failed to load AEO/GEO module');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCore();
  }, [loadCore]);

  useEffect(() => {
    if (tab === 'dashboard') aeoService.getDashboard().then(({ data }) => setDash(data.data)).catch(() => {});
    if (tab === 'faqs') aeoService.getFaqs().then(({ data }) => setFaqs(data.data || [])).catch(() => {});
    if (tab === 'entities') aeoService.getEntities().then(({ data }) => setEntities(data.data || [])).catch(() => {});
    if (tab === 'pages') aeoService.getPages().then(({ data }) => setPages(data.data || [])).catch(() => {});
    if (tab === 'schema' || tab === 'indexing') aeoService.getSchemaPreview().then(({ data }) => setSchemaPrev(data.data)).catch(() => {});
    if (tab === 'reports') {
      aeoService.getReport().then(({ data }) => setReport(data.data)).catch(() => {});
      aeoService.getGeminiUsage({ limit: 30 }).then(({ data }) => setUsage(data.data || [])).catch(() => {});
    }
    if (tab === 'gemini') aeoService.getGeminiStatus().then(({ data }) => setGeminiInfo((p) => ({ ...p, ...data.data }))).catch(() => {});
  }, [tab]);

  const visibleTabs = useMemo(() => {
    if (!config?.modules) return TABS;
    return TABS.filter((t) => config.modules[t.key] !== false);
  }, [config]);

  const setCfg = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));

  const saveConfig = async (extra = {}) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admin can change global settings');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...config, ...extra };
      if (apiKeyInput.trim()) payload.geminiApiKey = apiKeyInput.trim();
      const { data } = await aeoService.updateConfig(payload);
      setConfig(data.data);
      setGeminiInfo((p) => ({ ...p, ...data.gemini }));
      setApiKeyInput('');
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const loadRssPreview = useCallback(async (type = 'main', slug = 'politics', { silent = false } = {}) => {
    try {
      const { data } = await aeoService.getRssPreview({ type, slug });
      setRssPreview(data.data?.xml || '');
      setRssPreviewType(type);
      setRssPreviewUpdatedAt(new Date());
    } catch {
      if (!silent) {
        setRssPreview('');
        toast.error('Failed to load RSS preview');
      }
    }
  }, []);

  useEffect(() => {
    if (tab !== 'indexing') return undefined;
    loadRssPreview('main', 'politics', { silent: true });

    const auto = config?.rssPreviewAutoRefresh !== false;
    const seconds = Math.min(Math.max(parseInt(config?.rssPreviewRefreshSeconds, 10) || 10, 5), 120);
    if (!auto) return undefined;

    const id = setInterval(() => {
      loadRssPreview(rssPreviewType, 'politics', { silent: true });
    }, seconds * 1000);

    return () => clearInterval(id);
  }, [tab, config?.rssPreviewAutoRefresh, config?.rssPreviewRefreshSeconds, rssPreviewType, loadRssPreview]);

  if (loading || !config) {
    return (
      <div>
        <AdminPageHeader title="AEO & GEO Strategy" subtitle="Answer & generative engine optimization" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const siteBase = (config.canonicalBaseUrl || window.location.origin).replace(/\/$/, '');
  const rssEndpoints = [
    { label: '/feed.xml', href: `${siteBase}/feed.xml` },
    { label: '/rss.xml', href: `${siteBase}/rss.xml` },
    { label: '/feed/category/politics.xml', href: `${siteBase}/feed/category/politics.xml` },
    { label: '/feed/google-news.xml', href: `${siteBase}/feed/google-news.xml` },
  ];

  return (
    <div>
      <AdminPageHeader
        title="AEO & GEO Strategy"
        subtitle="SEO · Answer Engine · Generative Engine · Gemini AI"
      />

      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 -mx-1 px-1">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key ? 'admin-tab admin-tab-active' : 'admin-tab'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'gemini' && (
        <div className="space-y-6 max-w-4xl">
          <div className="admin-card space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-slate-900">Gemini API configuration</h2>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  geminiInfo?.configured ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {geminiInfo?.configured ? `Key OK (${geminiInfo.source}) ${geminiInfo.maskedKey || ''}` : 'API key missing'}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Prefer <code className="text-xs bg-slate-100 px-1 rounded">GEMINI_API_KEY</code> in server env. Super Admin may also store a key in the database (never shown in full).
            </p>
            <Toggle checked={!!config.geminiEnabled} onChange={(v) => setCfg('geminiEnabled', v)} label="Enable Gemini generation" disabled={!isSuperAdmin} />
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Model</label>
                <select
                  className="admin-input"
                  value={config.geminiModel}
                  disabled={!isSuperAdmin}
                  onChange={(e) => setCfg('geminiModel', e.target.value)}
                >
                  {(geminiInfo?.models || ['gemini-3.6-flash']).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Output language</label>
                <select className="admin-input" value={config.geminiLanguage || 'ta'} disabled={!isSuperAdmin} onChange={(e) => setCfg('geminiLanguage', e.target.value)}>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            {isSuperAdmin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">API key (leave blank to keep existing)</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="admin-input font-mono text-sm"
                    placeholder={geminiInfo?.maskedKey || 'AIza…'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-primary text-sm" disabled={saving} onClick={() => saveConfig()}>
                    {saving ? 'Saving…' : 'Save Gemini settings'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary text-sm"
                    onClick={async () => {
                      try {
                        await aeoService.testGemini();
                        toast.success('Gemini connection OK');
                        loadCore();
                      } catch (err) {
                        toast.error(err.response?.data?.message || 'Connection test failed');
                      }
                    }}
                  >
                    Test connection
                  </button>
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Usage today</p>
                <p className="text-xl font-bold text-slate-900">{geminiInfo?.usage?.today ?? '—'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Total successful</p>
                <p className="text-xl font-bold text-slate-900">{geminiInfo?.usage?.total ?? '—'}</p>
              </div>
            </div>
          </div>

          <GeminiGeneratePanel
            mode="page"
            pageType="custom"
            onApplied={() => {
              aeoService.getPages().then(({ data }) => setPages(data.data || []));
              aeoService.getFaqs().then(({ data }) => setFaqs(data.data || []));
            }}
          />
        </div>
      )}

      {tab === 'dashboard' && dash && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Avg score', value: dash.stats.avgScore },
            { label: 'FAQs', value: dash.stats.faqActive },
            { label: 'Entities', value: dash.stats.entityCount },
            { label: 'Gemini today', value: dash.stats.geminiUsageToday },
          ].map((s) => (
            <div key={s.label} className="admin-card !p-4">
              <p className="text-xs text-slate-500 uppercase">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
          <div className="admin-card col-span-2 lg:col-span-4">
            <h2 className="font-semibold mb-2">Readiness</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(dash.readiness || {}).map(([k, v]) => (
                <span key={k} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
                  {k}: {v}
                </span>
              ))}
            </div>
            <button type="button" className="btn-primary text-sm mt-4" onClick={() => setTab('gemini')}>
              ஜெமினி மூலம் உருவாக்கு / Generate with Gemini
            </button>
          </div>
        </div>
      )}

      {tab === 'globalSeo' && (
        <form className="space-y-4 max-w-3xl" onSubmit={(e) => { e.preventDefault(); saveConfig(); }}>
          <div className="admin-card space-y-3">
            <input className="admin-input" placeholder="Default SEO title" value={config.defaultSeoTitle || ''} onChange={(e) => setCfg('defaultSeoTitle', e.target.value)} disabled={!isSuperAdmin} />
            <textarea className="admin-input" rows={3} placeholder="Default meta description" value={config.defaultMetaDescription || ''} onChange={(e) => setCfg('defaultMetaDescription', e.target.value)} disabled={!isSuperAdmin} />
            <input className="admin-input" placeholder="Default keywords" value={config.defaultKeywords || ''} onChange={(e) => setCfg('defaultKeywords', e.target.value)} disabled={!isSuperAdmin} />
            <input className="admin-input" placeholder="Canonical base URL" value={config.canonicalBaseUrl || ''} onChange={(e) => setCfg('canonicalBaseUrl', e.target.value)} disabled={!isSuperAdmin} />
            <Toggle checked={!!config.enableOpenGraph} onChange={(v) => setCfg('enableOpenGraph', v)} label="Open Graph" disabled={!isSuperAdmin} />
            {isSuperAdmin && <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>}
          </div>
        </form>
      )}

      {tab === 'aeoGeo' && (
        <div className="admin-card space-y-2 max-w-3xl">
          <Toggle checked={!!config.aeoEnabled} onChange={(v) => setCfg('aeoEnabled', v)} label="AEO enabled" disabled={!isSuperAdmin} />
          <Toggle checked={!!config.geoEnabled} onChange={(v) => setCfg('geoEnabled', v)} label="GEO enabled" disabled={!isSuperAdmin} />
          <Toggle checked={!!config.optimizeForGoogleAiOverviews} onChange={(v) => setCfg('optimizeForGoogleAiOverviews', v)} label="Google AI Overviews" disabled={!isSuperAdmin} />
          <Toggle checked={!!config.optimizeForChatGPT} onChange={(v) => setCfg('optimizeForChatGPT', v)} label="ChatGPT" disabled={!isSuperAdmin} />
          <Toggle checked={!!config.optimizeForGemini} onChange={(v) => setCfg('optimizeForGemini', v)} label="Gemini" disabled={!isSuperAdmin} />
          <Toggle checked={!!config.optimizeForPerplexity} onChange={(v) => setCfg('optimizeForPerplexity', v)} label="Perplexity" disabled={!isSuperAdmin} />
          {isSuperAdmin && <button type="button" className="btn-primary mt-2" disabled={saving} onClick={() => saveConfig()}>Save</button>}
        </div>
      )}

      {tab === 'faqs' && (
        <div className="grid lg:grid-cols-5 gap-4">
          <form
            className="lg:col-span-2 admin-card space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              await aeoService.createFaq(faqForm);
              toast.success('FAQ added');
              setFaqForm({ question: '', answer: '', isActive: true, includeInSchema: true });
              const { data } = await aeoService.getFaqs();
              setFaqs(data.data || []);
            }}
          >
            <input required className="admin-input" placeholder="Question" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} />
            <textarea required rows={3} className="admin-input" placeholder="Answer" value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} />
            <button type="submit" className="btn-primary w-full">Add FAQ</button>
          </form>
          <div className="lg:col-span-3 admin-card space-y-2 max-h-[70vh] overflow-y-auto">
            {faqs.map((f) => (
              <div key={f._id} className="border border-slate-100 rounded-xl p-3 flex justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{f.question}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{f.answer}</p>
                </div>
                <button type="button" className="text-xs text-rose-600" onClick={async () => { await aeoService.deleteFaq(f._id); setFaqs((p) => p.filter((x) => x._id !== f._id)); }}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'entities' && (
        <div className="grid lg:grid-cols-5 gap-4">
          <form
            className="lg:col-span-2 admin-card space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              await aeoService.createEntity(entityForm);
              toast.success('Entity added');
              setEntityForm({ name: '', type: 'topic', isActive: true });
              const { data } = await aeoService.getEntities();
              setEntities(data.data || []);
            }}
          >
            <input required className="admin-input" placeholder="Name" value={entityForm.name} onChange={(e) => setEntityForm({ ...entityForm, name: e.target.value })} />
            <select className="admin-input" value={entityForm.type} onChange={(e) => setEntityForm({ ...entityForm, type: e.target.value })}>
              {['person', 'place', 'organization', 'topic', 'event', 'product', 'other'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button type="submit" className="btn-primary w-full">Add entity</button>
          </form>
          <div className="lg:col-span-3 admin-card overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {entities.map((e) => (
                  <tr key={e._id} className="border-b border-slate-50">
                    <td className="py-2 font-medium">{e.name}</td>
                    <td className="py-2 capitalize text-slate-500">{e.type}</td>
                    <td className="py-2">
                      <button type="button" className="text-xs text-rose-600" onClick={async () => { await aeoService.deleteEntity(e._id); setEntities((p) => p.filter((x) => x._id !== e._id)); }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'pages' && (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b">
                <th className="py-2">Path</th>
                <th className="py-2">Score</th>
                <th className="py-2">Gemini</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p._id} className="border-b border-slate-50">
                  <td className="py-2">
                    <p className="font-medium">{p.title || p.path}</p>
                    <p className="text-xs text-slate-400">{p.path}</p>
                  </td>
                  <td className="py-2 font-bold">{p.score}</td>
                  <td className="py-2 text-xs">{p.generatedByGemini ? 'Yes' : '—'}</td>
                  <td className="py-2">
                    <button type="button" className="text-xs text-rose-600" onClick={async () => { await aeoService.deletePage(p._id); setPages((x) => x.filter((i) => i._id !== p._id)); }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pages.length === 0 && <p className="text-sm text-slate-500 py-4">No pages yet — generate with Gemini and Approve → Save.</p>}
        </div>
      )}

      {tab === 'schema' && (
        <div className="admin-card max-w-3xl space-y-3">
          <Toggle checked={!!config.enableJsonLd} onChange={(v) => setCfg('enableJsonLd', v)} label="JSON-LD" disabled={!isSuperAdmin} />
          <Toggle checked={!!config.enableFaqSchema} onChange={(v) => setCfg('enableFaqSchema', v)} label="FAQ schema" disabled={!isSuperAdmin} />
          {isSuperAdmin && <button type="button" className="btn-primary" onClick={() => saveConfig()}>Save</button>}
          <pre className="text-xs bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto max-h-80">{JSON.stringify(schemaPrev?.jsonLd || {}, null, 2)}</pre>
        </div>
      )}

      {tab === 'indexing' && (
        <div className="space-y-6 max-w-4xl">
          <div className="admin-card space-y-4">
            <h2 className="font-semibold text-slate-900">RSS Feed Integration &amp; Endpoints</h2>
            <p className="text-sm text-slate-500">
              Dynamic RSS 2.0 feeds from published articles. Disabled feeds return HTTP 404 (not HTML).
            </p>

            <Toggle
              checked={!!config.rssEnabled}
              onChange={(v) => setCfg('rssEnabled', v)}
              label="Return XML at endpoint (disable = clean 404)"
              disabled={!isSuperAdmin}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">RSS Channel Title</label>
              <input
                className="admin-input"
                value={config.rssChannelTitle || ''}
                onChange={(e) => setCfg('rssChannelTitle', e.target.value)}
                disabled={!isSuperAdmin}
                placeholder="The Great India News Live RSS Dispatch"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">RSS Channel Description</label>
              <textarea
                className="admin-input"
                rows={3}
                value={config.rssChannelDescription || ''}
                onChange={(e) => setCfg('rssChannelDescription', e.target.value)}
                disabled={!isSuperAdmin}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Feed Limit (posts count)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className="admin-input"
                  value={config.rssFeedLimit ?? 30}
                  onChange={(e) => setCfg('rssFeedLimit', parseInt(e.target.value, 10) || 30)}
                  disabled={!isSuperAdmin}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Body Content Depth</label>
                <select
                  className="admin-input"
                  value={config.rssBodyContentDepth || 'full'}
                  onChange={(e) => setCfg('rssBodyContentDepth', e.target.value)}
                  disabled={!isSuperAdmin}
                >
                  <option value="full">Full Markup (HTML)</option>
                  <option value="excerpt">Excerpt only</option>
                  <option value="none">Title + link only</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Toggle
                checked={config.rssPreviewAutoRefresh !== false}
                onChange={(v) => setCfg('rssPreviewAutoRefresh', v)}
                label="Auto-refresh XML preview"
                disabled={!isSuperAdmin}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Preview refresh every (seconds)</label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  className="admin-input"
                  value={config.rssPreviewRefreshSeconds ?? 10}
                  onChange={(e) => setCfg('rssPreviewRefreshSeconds', parseInt(e.target.value, 10) || 10)}
                  disabled={!isSuperAdmin || config.rssPreviewAutoRefresh === false}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Public feed cache (seconds)</label>
              <input
                type="number"
                min={60}
                max={3600}
                className="admin-input max-w-xs"
                value={config.rssCacheSeconds ?? 300}
                onChange={(e) => setCfg('rssCacheSeconds', parseInt(e.target.value, 10) || 300)}
                disabled={!isSuperAdmin}
              />
              <p className="text-[11px] text-slate-500 mt-1">How often /feed.xml rebuilds for visitors (min 60s). Cleared instantly when you publish.</p>
            </div>

            {isSuperAdmin && (
              <button
                type="button"
                className="btn-primary"
                disabled={saving}
                onClick={async () => {
                  await saveConfig();
                  loadRssPreview('main');
                }}
              >
                {saving ? 'Saving…' : 'Commit Feed Config'}
              </button>
            )}

            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">Live endpoints</p>
              <ul className="space-y-1 text-sm">
                {rssEndpoints.map((ep) => (
                  <li key={ep.label}>
                    <a href={ep.href} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline font-mono text-xs">
                      {ep.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <button type="button" className="admin-tab text-xs" onClick={() => loadRssPreview('main')}>
                  Preview /feed.xml
                </button>
                <button type="button" className="admin-tab text-xs" onClick={() => loadRssPreview('category', 'politics')}>
                  Preview politics
                </button>
                <button type="button" className="admin-tab text-xs" onClick={() => loadRssPreview('google-news')}>
                  Preview Google News
                </button>
              </div>
              {config.rssPreviewAutoRefresh !== false && (
                <span className="text-[11px] text-teal-700 font-medium">
                  Auto-refresh every {Math.min(Math.max(parseInt(config.rssPreviewRefreshSeconds, 10) || 10, 5), 120)}s
                  {rssPreviewUpdatedAt ? ` · Updated ${rssPreviewUpdatedAt.toLocaleTimeString()}` : ''}
                </span>
              )}
            </div>

            <pre className="text-xs bg-slate-900 text-emerald-200 rounded-xl p-4 overflow-x-auto max-h-96 whitespace-pre-wrap">
              {rssPreview || 'No preview yet — save settings or click a preview button.'}
            </pre>
          </div>

          <div className="admin-card max-w-3xl space-y-3">
            <h2 className="font-semibold text-slate-900">Sitemap &amp; robots</h2>
            <Toggle checked={!!config.sitemapEnabled} onChange={(v) => setCfg('sitemapEnabled', v)} label="Sitemap" disabled={!isSuperAdmin} />
            <Toggle checked={!!config.robotsAllowAiBots} onChange={(v) => setCfg('robotsAllowAiBots', v)} label="Allow AI crawlers" disabled={!isSuperAdmin} />
            <textarea className="admin-input font-mono text-xs" rows={3} placeholder="Custom robots rules" value={config.robotsTxtCustom || ''} onChange={(e) => setCfg('robotsTxtCustom', e.target.value)} disabled={!isSuperAdmin} />
            {isSuperAdmin && <button type="button" className="btn-primary" onClick={() => saveConfig()}>Save</button>}
            <pre className="text-xs bg-slate-900 text-emerald-200 rounded-xl p-4 whitespace-pre-wrap">{schemaPrev?.robotsPreview || '…'}</pre>
          </div>
        </div>
      )}

      {tab === 'reports' && report && (
        <div className="space-y-4">
          <div className="admin-card">
            <p className="text-3xl font-bold text-teal-700">{report.overall}%</p>
            <p className="text-sm text-slate-500">Overall readiness</p>
            <ul className="mt-3 space-y-1 text-sm">
              {report.checklist.map((c) => (
                <li key={c.id} className={c.ok ? 'text-emerald-700' : 'text-slate-400'}>
                  {c.ok ? '✓' : '○'} {c.label}
                </li>
              ))}
            </ul>
          </div>
          <div className="admin-card overflow-x-auto">
            <h2 className="font-semibold mb-2">Gemini usage log</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2">When</th>
                  <th className="py-2">Action</th>
                  <th className="py-2">Topic</th>
                  <th className="py-2">OK</th>
                  <th className="py-2">Tokens</th>
                </tr>
              </thead>
              <tbody>
                {usage.map((u) => (
                  <tr key={u._id} className="border-b border-slate-50">
                    <td className="py-2 whitespace-nowrap">{new Date(u.createdAt).toLocaleString()}</td>
                    <td className="py-2">{u.action}</td>
                    <td className="py-2 max-w-[12rem] truncate">{u.topic}</td>
                    <td className="py-2">{u.success ? '✓' : '✗'}</td>
                    <td className="py-2">{u.totalTokens || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AeoGeo;
