import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { travelNotificationService } from '../services/articleService';
import AdminPageHeader, { StatusBadge } from './AdminPageHeader';

const MODES = ['train', 'bus', 'flight'];
const MODE_LABELS = { train: 'Train', bus: 'Bus', flight: 'Flight' };
const CHANNEL_OPTIONS = [
  { value: 'website', label: 'Website listing' },
  { value: 'breaking_ticker', label: 'Breaking news ticker' },
  { value: 'admin_only', label: 'Admin only' },
];

const INTERVAL_PRESETS = [
  { label: 'Every 10 seconds', seconds: 10 },
  { label: 'Every 30 seconds', seconds: 30 },
  { label: 'Every 1 minute', seconds: 60 },
  { label: 'Every 5 minutes', seconds: 300 },
  { label: 'Every 15 minutes', seconds: 900 },
  { label: 'Every 30 minutes', seconds: 1800 },
  { label: 'Custom', seconds: 0 },
];

const emptyMode = () => ({
  enabled: true,
  autoFetchEnabled: false,
  apiBaseUrl: '',
  apiEndpoint: '',
  apiKey: '',
  apiProvider: 'custom',
  routes: '',
  locations: '',
  transportNumbers: '',
  keywords: '',
  channels: ['website'],
  fetchIntervalSeconds: 1800,
  intervalPreset: '1800',
  retryAttempts: 3,
  retryBackoffSeconds: 30,
});

const listToText = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');

const statusStyles = {
  on_time: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  delayed: 'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  arrived: 'bg-sky-50 text-sky-700 border-sky-200',
  departed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  scheduled: 'bg-slate-50 text-slate-600 border-slate-200',
  diverted: 'bg-orange-50 text-orange-700 border-orange-200',
  info: 'bg-slate-50 text-slate-600 border-slate-200',
};

const logStatusStyles = {
  success: 'text-emerald-700 bg-emerald-50',
  partial: 'text-amber-700 bg-amber-50',
  error: 'text-rose-700 bg-rose-50',
  running: 'text-sky-700 bg-sky-50',
};

const formatDate = (d) => (d ? new Date(d).toLocaleString() : '—');

const presetForSeconds = (sec) => {
  const match = INTERVAL_PRESETS.find((p) => p.seconds === sec && p.seconds > 0);
  return match ? String(match.seconds) : 'custom';
};

const TravelNotificationsAdmin = () => {
  const [tab, setTab] = useState('train');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState(null);
  const [counts, setCounts] = useState({});
  const [forms, setForms] = useState({
    train: emptyMode(),
    bus: emptyMode(),
    flight: emptyMode(),
  });
  const [globalForm, setGlobalForm] = useState({ showOnHomepage: true, homepageTitle: 'Travel Updates' });
  const [updates, setUpdates] = useState([]);
  const [fetchLogs, setFetchLogs] = useState([]);
  const [filterMode, setFilterMode] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const pollRef = useRef(null);

  const modeFromConfig = (m) => {
    const sec = m?.fetchIntervalSeconds || (m?.updateFrequencyMinutes ? m.updateFrequencyMinutes * 60 : 1800);
    return {
      enabled: m?.enabled !== false,
      autoFetchEnabled: Boolean(m?.autoFetchEnabled),
      apiBaseUrl: m?.apiBaseUrl || '',
      apiEndpoint: m?.apiEndpoint || '',
      apiKey: m?.hasApiKey ? '__UNCHANGED__' : '',
      apiKeyMasked: m?.apiKeyMasked || '',
      hasApiKey: Boolean(m?.hasApiKey),
      apiProvider: m?.apiProvider || 'custom',
      routes: listToText(m?.routes),
      locations: listToText(m?.locations),
      transportNumbers: listToText(m?.transportNumbers),
      keywords: listToText(m?.keywords),
      channels: m?.channels?.length ? m.channels : ['website'],
      fetchIntervalSeconds: sec,
      intervalPreset: presetForSeconds(sec),
      retryAttempts: m?.retryAttempts ?? 3,
      retryBackoffSeconds: m?.retryBackoffSeconds ?? 30,
    };
  };

  const loadStatus = useCallback(async () => {
    const { data } = await travelNotificationService.getStatus();
    setStatus(data);
    if (data.counts) setCounts(data.counts);
  }, []);

  const loadConfig = useCallback(async () => {
    const { data } = await travelNotificationService.getConfig();
    setConfig(data.data);
    setCounts(data.counts || {});
    setForms({
      train: modeFromConfig(data.data.train),
      bus: modeFromConfig(data.data.bus),
      flight: modeFromConfig(data.data.flight),
    });
    setGlobalForm({
      showOnHomepage: data.data.showOnHomepage !== false,
      homepageTitle: data.data.homepageTitle || 'Travel Updates',
    });
  }, []);

  const loadUpdates = useCallback(async () => {
    const { data } = await travelNotificationService.getUpdates({
      mode: filterMode === 'all' ? undefined : filterMode,
      status: filterStatus === 'all' ? undefined : filterStatus,
      q: searchQ || undefined,
      limit: 50,
    });
    setUpdates(data.data || []);
  }, [filterMode, filterStatus, searchQ]);

  const loadFetchLogs = useCallback(async () => {
    const { data } = await travelNotificationService.getFetchLogs({ limit: 50 });
    setFetchLogs(data.data || []);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadConfig(), loadStatus()]);
      if (tab === 'updates') await loadUpdates();
      if (tab === 'logs') await loadFetchLogs();
    } catch {
      toast.error('Failed to load travel notifications');
    } finally {
      setLoading(false);
    }
  }, [loadConfig, loadStatus, loadUpdates, loadFetchLogs, tab]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (tab === 'updates') loadUpdates().catch(() => toast.error('Failed to load updates'));
    if (tab === 'logs') loadFetchLogs().catch(() => toast.error('Failed to load fetch logs'));
  }, [tab, filterMode, filterStatus, loadUpdates, loadFetchLogs]);

  useEffect(() => {
    pollRef.current = setInterval(() => {
      loadStatus().catch(() => {});
      if (tab === 'logs') loadFetchLogs().catch(() => {});
    }, 10_000);
    return () => clearInterval(pollRef.current);
  }, [loadStatus, loadFetchLogs, tab]);

  const setModeField = (mode, field, value) => {
    setForms((prev) => ({ ...prev, [mode]: { ...prev[mode], [field]: value } }));
  };

  const handleIntervalPreset = (mode, preset) => {
    if (preset === 'custom') {
      setModeField(mode, 'intervalPreset', 'custom');
      return;
    }
    const sec = Number(preset);
    setForms((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], intervalPreset: preset, fetchIntervalSeconds: sec },
    }));
  };

  const toggleChannel = (mode, channel) => {
    setForms((prev) => {
      const current = prev[mode].channels || [];
      const next = current.includes(channel)
        ? current.filter((c) => c !== channel)
        : [...current, channel];
      return {
        ...prev,
        [mode]: { ...prev[mode], channels: next.length ? next : ['website'] },
      };
    });
  };

  const buildModePayload = (f) => ({
    enabled: f.enabled,
    autoFetchEnabled: f.autoFetchEnabled,
    apiBaseUrl: f.apiBaseUrl,
    apiEndpoint: f.apiEndpoint,
    apiKey: f.apiKey === '__UNCHANGED__' ? '__UNCHANGED__' : f.apiKey,
    apiProvider: f.apiProvider,
    routes: f.routes,
    locations: f.locations,
    transportNumbers: f.transportNumbers,
    keywords: f.keywords,
    channels: f.channels,
    fetchIntervalSeconds: Number(f.fetchIntervalSeconds) || 1800,
    retryAttempts: Number(f.retryAttempts) || 3,
    retryBackoffSeconds: Number(f.retryBackoffSeconds) || 30,
  });

  const handleSaveMode = async (mode) => {
    const f = forms[mode];
    const sec = Number(f.fetchIntervalSeconds);
    if (Number.isNaN(sec) || sec < 10 || sec > 86400) {
      toast.error('Fetch interval must be 10–86400 seconds');
      return;
    }
    setSaving(true);
    try {
      const { data } = await travelNotificationService.updateConfig({
        [mode]: buildModePayload(f),
        showOnHomepage: globalForm.showOnHomepage,
        homepageTitle: globalForm.homepageTitle,
      });
      setConfig(data.data);
      setForms((prev) => ({
        ...prev,
        [mode]: modeFromConfig(data.data[mode]),
      }));
      toast.success(`${MODE_LABELS[mode]} settings saved`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGlobal = async () => {
    setSaving(true);
    try {
      const { data } = await travelNotificationService.updateConfig(globalForm);
      setConfig(data.data);
      toast.success('Display settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleFetch = async (modes) => {
    setFetching(true);
    try {
      const { data } = await travelNotificationService.fetchNow(modes);
      toast.success(data.message || 'Fetch started');
      const pollUntilDone = async (attempts = 0) => {
        const { data: st } = await travelNotificationService.getStatus();
        setStatus(st);
        if (st.counts) setCounts(st.counts);
        if (st.fetchInProgress && attempts < 60) {
          setTimeout(() => pollUntilDone(attempts + 1), 2000);
        } else {
          await loadConfig();
          if (tab === 'logs') await loadFetchLogs();
          setFetching(false);
        }
      };
      setTimeout(() => pollUntilDone(), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Fetch failed');
      setFetching(false);
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      await travelNotificationService.updateItem(item._id, { isPublished: !item.isPublished });
      toast.success(item.isPublished ? 'Unpublished' : 'Published');
      await loadUpdates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this travel update?')) return;
    try {
      await travelNotificationService.deleteItem(id);
      toast.success('Deleted');
      await loadUpdates();
      await loadConfig();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const renderStatusPanel = () => {
    if (!status) return null;
    return (
      <div className="admin-card mb-4 !p-3 sm:!p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Fetch status</h3>
          {status.fetchInProgress && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 animate-pulse">
              Fetch in progress…
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <p className="text-slate-400">Last global fetch</p>
            <p className="font-medium text-slate-700">{formatDate(status.lastGlobalFetchAt)}</p>
          </div>
          <div>
            <p className="text-slate-400">Next scheduled</p>
            <p className="font-medium text-slate-700">{formatDate(status.nextScheduledFetchAt)}</p>
          </div>
          {MODES.map((m) => {
            const ms = status.modes?.[m];
            if (!ms) return null;
            return (
              <div key={m}>
                <p className="text-slate-400 capitalize">{MODE_LABELS[m]}</p>
                <p className={`font-medium ${ms.lastFetchStatus === 'error' ? 'text-rose-600' : 'text-slate-700'}`}>
                  {ms.lastFetchStatus || '—'}
                  {ms.lastFetchCount ? ` · +${ms.lastFetchCount}` : ''}
                  {ms.lastUpdatedCount ? ` / ~${ms.lastUpdatedCount}` : ''}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {formatDate(ms.lastFetchAt)}
                  {ms.nextScheduledFetchAt ? ` · next ${formatDate(ms.nextScheduledFetchAt)}` : ''}
                </p>
                {ms.lastFetchError && (
                  <p className="text-[10px] text-rose-500 mt-0.5 line-clamp-1">{ms.lastFetchError}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderModeForm = (mode) => {
    const f = forms[mode];
    const cfg = config?.[mode];
    const st = status?.modes?.[mode];
    return (
      <div className="space-y-5 max-w-3xl">
        <div className="admin-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-slate-900">{MODE_LABELS[mode]} configuration</h2>
            <div className="flex items-center gap-2">
              <StatusBadge active={f.enabled} />
              {f.autoFetchEnabled && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  Auto-fetch
                </span>
              )}
              {st?.lastFetchStatus === 'error' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  API failed
                </span>
              )}
            </div>
          </div>

          {(cfg?.lastFetchAt || st?.lastFetchAt) && (
            <p className={`text-sm ${(cfg?.lastFetchStatus || st?.lastFetchStatus) === 'error' ? 'text-rose-600' : 'text-slate-500'}`}>
              Last fetch: {formatDate(cfg?.lastFetchAt || st?.lastFetchAt)}
              {(cfg?.lastFetchCount || st?.lastFetchCount)
                ? ` · ${cfg?.lastFetchCount ?? st?.lastFetchCount} new · ${cfg?.lastUpdatedCount ?? st?.lastUpdatedCount ?? 0} updated · ${cfg?.lastSkippedCount ?? st?.lastSkippedCount ?? 0} unchanged`
                : ''}
              {(cfg?.lastFetchError || st?.lastFetchError) ? ` · ${cfg?.lastFetchError || st?.lastFetchError}` : ''}
              {st?.lastHttpStatus ? ` · HTTP ${st.lastHttpStatus}` : ''}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">API base URL</label>
              <input
                className="admin-input font-mono text-xs sm:text-sm"
                value={f.apiBaseUrl}
                onChange={(e) => setModeField(mode, 'apiBaseUrl', e.target.value)}
                placeholder="https://api.example.com/v1"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">API endpoint</label>
              <input
                className="admin-input font-mono text-xs sm:text-sm"
                value={f.apiEndpoint}
                onChange={(e) => setModeField(mode, 'apiEndpoint', e.target.value)}
                placeholder="/schedules or full URL"
              />
              <p className="text-xs text-slate-400 mt-1">
                Without an API URL, updates are generated from routes/numbers for pipeline testing only.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">API key</label>
              <input
                className="admin-input"
                type="password"
                value={f.apiKey === '__UNCHANGED__' ? '' : f.apiKey}
                onChange={(e) => setModeField(mode, 'apiKey', e.target.value)}
                placeholder={f.hasApiKey ? f.apiKeyMasked || 'Key saved — enter new to replace' : 'Optional API key'}
                autoComplete="off"
              />
              {f.hasApiKey && f.apiKey === '__UNCHANGED__' && (
                <p className="text-[10px] text-slate-400 mt-1">Saved: {f.apiKeyMasked}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Provider label</label>
              <input
                className="admin-input"
                value={f.apiProvider}
                onChange={(e) => setModeField(mode, 'apiProvider', e.target.value)}
                placeholder="custom / irctc / aviationstack"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Auto-fetch interval</label>
              <select
                className="admin-input"
                value={f.intervalPreset}
                onChange={(e) => handleIntervalPreset(mode, e.target.value)}
              >
                {INTERVAL_PRESETS.map((p) => (
                  <option key={p.label} value={p.seconds || 'custom'}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            {(f.intervalPreset === 'custom' || !INTERVAL_PRESETS.some((p) => p.seconds === f.fetchIntervalSeconds)) && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Custom interval (seconds)</label>
                <input
                  type="number"
                  min={10}
                  max={86400}
                  className="admin-input"
                  value={f.fetchIntervalSeconds}
                  onChange={(e) => setModeField(mode, 'fetchIntervalSeconds', e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Retry attempts</label>
              <input
                type="number"
                min={0}
                max={10}
                className="admin-input"
                value={f.retryAttempts}
                onChange={(e) => setModeField(mode, 'retryAttempts', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Retry backoff (seconds)</label>
              <input
                type="number"
                min={5}
                max={600}
                className="admin-input"
                value={f.retryBackoffSeconds}
                onChange={(e) => setModeField(mode, 'retryBackoffSeconds', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {MODE_LABELS[mode]} numbers <span className="text-slate-400 font-normal">(one per line)</span>
            </label>
            <textarea
              className="admin-input"
              rows={3}
              value={f.transportNumbers}
              onChange={(e) => setModeField(mode, 'transportNumbers', e.target.value)}
              placeholder={mode === 'flight' ? 'AI101\n6E234' : mode === 'train' ? '12635\n16127' : 'TNSTC-01'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Routes</label>
            <textarea
              className="admin-input"
              rows={2}
              value={f.routes}
              onChange={(e) => setModeField(mode, 'routes', e.target.value)}
              placeholder="Chennai → Madurai"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Locations (source / destination)</label>
            <textarea
              className="admin-input"
              rows={2}
              value={f.locations}
              onChange={(e) => setModeField(mode, 'locations', e.target.value)}
              placeholder={'Chennai\nMadurai\nCoimbatore'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Keywords</label>
            <textarea
              className="admin-input"
              rows={2}
              value={f.keywords}
              onChange={(e) => setModeField(mode, 'keywords', e.target.value)}
              placeholder={'delay\ncancel\nplatform'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notification channels</label>
            <div className="flex flex-wrap gap-2">
              {CHANNEL_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggleChannel(mode, c.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                    f.channels.includes(c.value) ? 'admin-tab admin-tab-active' : 'admin-tab'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={f.enabled}
                onChange={(e) => setModeField(mode, 'enabled', e.target.checked)}
                className="rounded border-slate-300 text-brand-600"
              />
              Enable {MODE_LABELS[mode].toLowerCase()} notifications
            </label>
            <label className="flex items-center gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={f.autoFetchEnabled}
                onChange={(e) => setModeField(mode, 'autoFetchEnabled', e.target.checked)}
                className="rounded border-slate-300 text-brand-600"
              />
              Automatic backend fetching (scheduler)
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveMode(mode)}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving…' : `Save ${MODE_LABELS[mode]} settings`}
            </button>
            <button
              type="button"
              disabled={fetching || !f.enabled}
              onClick={() => handleFetch([mode])}
              className="btn-secondary disabled:opacity-50"
            >
              {fetching ? 'Fetching…' : `Fetch ${MODE_LABELS[mode]} now`}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFetchLogs = () => (
    <div className="space-y-4">
      <div className="admin-card overflow-x-auto">
        <table className="admin-table w-full text-sm">
          <thead>
            <tr>
              <th>Mode</th>
              <th>Provider</th>
              <th>Trigger</th>
              <th>Started</th>
              <th>Duration</th>
              <th>Status</th>
              <th>HTTP</th>
              <th>New</th>
              <th>Updated</th>
              <th>Skipped</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {fetchLogs.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-8 text-slate-500">
                  No fetch logs yet
                </td>
              </tr>
            ) : (
              fetchLogs.map((log) => (
                <tr key={log._id}>
                  <td className="capitalize font-medium">{MODE_LABELS[log.mode] || log.mode}</td>
                  <td>{log.provider || '—'}</td>
                  <td className="capitalize">{log.trigger}</td>
                  <td className="whitespace-nowrap text-xs">{formatDate(log.startedAt)}</td>
                  <td>{log.durationMs ? `${log.durationMs}ms` : '—'}</td>
                  <td>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${logStatusStyles[log.status] || 'text-slate-600 bg-slate-50'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td>{log.httpStatus || '—'}</td>
                  <td>{log.newRecords ?? 0}</td>
                  <td>{log.updatedRecords ?? 0}</td>
                  <td>{log.skippedRecords ?? 0}</td>
                  <td className="text-xs text-rose-600 max-w-[180px] truncate">{log.errorMessage || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading && !config) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Travel Notifications"
        subtitle="Train, bus & flight auto notifications — configure sources, routes, and channels."
      >
        <button
          type="button"
          onClick={() => handleFetch(['train', 'bus', 'flight'])}
          disabled={fetching}
          className="btn-primary text-sm py-2.5 px-4 w-full sm:w-auto disabled:opacity-50"
        >
          {fetching ? 'Fetching…' : 'Fetch All'}
        </button>
      </AdminPageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Train', value: counts.byMode?.train || 0, color: 'text-indigo-700', bg: 'bg-indigo-50' },
          { label: 'Bus', value: counts.byMode?.bus || 0, color: 'text-teal-700', bg: 'bg-teal-50' },
          { label: 'Flight', value: counts.byMode?.flight || 0, color: 'text-sky-700', bg: 'bg-sky-50' },
          { label: 'Total', value: counts.total || 0, color: 'text-slate-800', bg: 'bg-slate-50' },
        ].map((s) => (
          <div key={s.label} className={`admin-stat-card ${s.bg}`}>
            <p className="text-xs text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {renderStatusPanel()}

      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {[
          { key: 'train', label: 'Train' },
          { key: 'bus', label: 'Bus' },
          { key: 'flight', label: 'Flight' },
          { key: 'updates', label: 'Fetched Updates' },
          { key: 'logs', label: 'Fetch Logs' },
          { key: 'display', label: 'Display' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'admin-tab admin-tab-active' : 'admin-tab hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {MODES.includes(tab) && renderModeForm(tab)}

      {tab === 'logs' && renderFetchLogs()}

      {tab === 'display' && (
        <div className="admin-card space-y-4 max-w-xl">
          <h2 className="font-semibold text-slate-900">Website listing</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Homepage section title</label>
            <input
              className="admin-input"
              value={globalForm.homepageTitle}
              onChange={(e) => setGlobalForm({ ...globalForm, homepageTitle: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={globalForm.showOnHomepage}
              onChange={(e) => setGlobalForm({ ...globalForm, showOnHomepage: e.target.checked })}
              className="rounded border-slate-300 text-brand-600"
            />
            Show published travel updates on homepage
          </label>
          <p className="text-xs text-slate-400">
            Public page: <code className="text-brand-700">/travel-updates</code>
          </p>
          <button type="button" disabled={saving} onClick={handleSaveGlobal} className="btn-primary disabled:opacity-50">
            {saving ? 'Saving…' : 'Save display settings'}
          </button>
        </div>
      )}

      {tab === 'updates' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {['all', ...MODES].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFilterMode(m)}
                  className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg capitalize ${
                    filterMode === m ? 'admin-tab admin-tab-active' : 'admin-tab'
                  }`}
                >
                  {MODE_LABELS[m] || m}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="admin-input text-sm py-2 w-auto"
              >
                <option value="all">All statuses</option>
                <option value="on_time">On time</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
                <option value="arrived">Arrived</option>
                <option value="departed">Departed</option>
                <option value="scheduled">Scheduled</option>
                <option value="info">Info</option>
              </select>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  loadUpdates();
                }}
                className="flex gap-2"
              >
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search number / route…"
                  className="admin-input text-sm py-2 w-40 sm:w-52"
                />
                <button type="submit" className="btn-secondary text-sm shrink-0">
                  Search
                </button>
              </form>
            </div>
          </div>

          {updates.length === 0 ? (
            <div className="admin-card text-center py-14 text-slate-500">
              <p className="font-medium text-slate-700 mb-1">No travel updates yet</p>
              <p className="text-sm mb-4">Configure train/bus/flight and click Fetch.</p>
              <button type="button" onClick={() => handleFetch(['train', 'bus', 'flight'])} disabled={fetching} className="btn-primary text-sm">
                {fetching ? 'Fetching…' : 'Fetch All'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {updates.map((item) => (
                <div key={item._id} className="admin-card !p-3 sm:!p-4 flex flex-col sm:flex-row gap-3 sm:items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-semibold tracking-wide text-teal-700">
                        {MODE_LABELS[item.mode] || item.mode}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${statusStyles[item.status] || statusStyles.info}`}>
                        {(item.status || 'info').replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.updateType}</span>
                      {!item.isPublished && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Unpublished</span>
                      )}
                    </div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    {item.message && <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{item.message}</p>}
                    <p className="text-xs text-slate-400 mt-1.5">
                      {item.transportNumber && <span className="font-mono mr-2">{item.transportNumber}</span>}
                      {item.route || `${item.fromLocation || ''} ${item.toLocation ? `→ ${item.toLocation}` : ''}`}
                      {item.platform ? ` · Platform ${item.platform}` : ''}
                      {item.gate ? ` · Gate ${item.gate}` : ''}
                      {item.delayMinutes > 0 ? ` · +${item.delayMinutes}m` : ''}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Source: {item.source || '—'}
                      {item.lastFetchedAt ? ` · Fetched ${formatDate(item.lastFetchedAt)}` : ''}
                      {item.lastUpdatedAt ? ` · Updated ${formatDate(item.lastUpdatedAt)}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(item)}
                      className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100"
                    >
                      {item.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="text-xs font-medium px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TravelNotificationsAdmin;
