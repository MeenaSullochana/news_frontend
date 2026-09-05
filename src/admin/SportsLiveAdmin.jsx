import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { sportsService } from '../services/articleService';
import AdminPageHeader, { StatusBadge } from './AdminPageHeader';

const SPORTS = ['cricket', 'football', 'basketball', 'tennis', 'other', 'chess'];
const SPORT_LABELS = {
  cricket: 'Cricket',
  football: 'Football',
  basketball: 'Basketball',
  tennis: 'Tennis',
  other: 'Other',
  chess: 'Chess',
};

const WIDGET_LABELS = {
  live_score: 'Live Score',
  upcoming: 'Upcoming Matches',
  results: 'Recent Results',
  standings: 'League Standings',
  team_info: 'Team Information',
  player_stats: 'Player Statistics',
  match_details: 'Match Details',
};

const PAGE_OPTIONS = [
  { value: 'homepage', label: 'Homepage' },
  { value: 'category', label: 'Category pages' },
  { value: 'article', label: 'Article pages' },
];

const PROVIDER_PRESETS = {
  cricket: {
    apiBaseUrl: 'https://sportscore.com',
    apiEndpoint: '/api/widget/matches/',
    apiProvider: 'SportScore',
    fetchIntervalSeconds: 60,
    apiKeyHint: 'No key needed for SportScore. Optional: Provider=CricLive + Bearer API key',
  },
  football: {
    apiBaseUrl: 'https://sportscore.com',
    apiEndpoint: '/api/widget/matches/',
    apiProvider: 'SportScore',
    fetchIntervalSeconds: 60,
    apiKeyHint: 'Optional / leave empty — SportScore uses sport=football',
  },
  basketball: {
    apiBaseUrl: 'https://sportscore.com',
    apiEndpoint: '/api/widget/matches/',
    apiProvider: 'SportScore',
    fetchIntervalSeconds: 60,
    apiKeyHint: 'Optional / leave empty — SportScore uses sport=basketball',
  },
  tennis: {
    apiBaseUrl: 'https://sportscore.com',
    apiEndpoint: '/api/widget/matches/',
    apiProvider: 'SportScore',
    fetchIntervalSeconds: 60,
    apiKeyHint: 'Optional / leave empty — SportScore uses sport=tennis',
  },
  chess: {
    apiBaseUrl: 'https://lichess.org',
    apiEndpoint: '/api/tv/channels',
    apiProvider: 'lichess',
    fetchIntervalSeconds: 60,
    apiKeyHint: 'Lichess TV — no API key required',
  },
  other: {
    apiBaseUrl: '',
    apiEndpoint: '',
    apiProvider: 'custom',
    fetchIntervalSeconds: 60,
    apiKeyHint: 'Optional',
  },
};

const emptySport = () => ({
  enabled: true,
  autoFetchEnabled: false,
  apiBaseUrl: '',
  apiEndpoint: '',
  apiKey: '',
  apiProvider: 'custom',
  leagues: '',
  tournaments: '',
  teams: '',
  competitions: '',
  fetchIntervalSeconds: 60,
  refreshIntervalMinutes: 1,
});

const listToText = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');

const statusStyles = {
  live: 'bg-rose-50 text-rose-700 border-rose-200',
  halftime: 'bg-amber-50 text-amber-700 border-amber-200',
  scheduled: 'bg-sky-50 text-sky-700 border-sky-200',
  finished: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  postponed: 'bg-orange-50 text-orange-700 border-orange-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  abandoned: 'bg-slate-100 text-slate-600 border-slate-200',
};

const scoreDisplay = (m) => {
  if (m.homeScoreText || m.awayScoreText) {
    return `${m.homeScoreText || '—'}  vs  ${m.awayScoreText || '—'}`;
  }
  return `${m.homeScore ?? 0} — ${m.awayScore ?? 0}`;
};

const SportsLiveAdmin = () => {
  const [tab, setTab] = useState('cricket');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [config, setConfig] = useState(null);
  const [counts, setCounts] = useState({});
  const [forms, setForms] = useState({});
  const [widgets, setWidgets] = useState([]);
  const [globalForm, setGlobalForm] = useState({ showOnHomepage: true, homepageTitle: 'Live Sports' });
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [filterSport, setFilterSport] = useState('all');
  const [filterStatus, setFilterStatus] = useState('live');
  const [preview, setPreview] = useState(null);
  const [syncStatus, setSyncStatus] = useState({ lastFetch: null, error: '', running: false });

  const syncRunningRef = useRef(false);
  const pollRef = useRef(null);

  const sportFromConfig = (m) => ({
    enabled: m?.enabled !== false,
    autoFetchEnabled: Boolean(m?.autoFetchEnabled),
    apiBaseUrl: m?.apiBaseUrl || '',
    apiEndpoint: m?.apiEndpoint || '',
    apiKey: m?.hasApiKey ? '__UNCHANGED__' : '',
    apiKeyMasked: m?.apiKeyMasked || '',
    hasApiKey: Boolean(m?.hasApiKey),
    apiProvider: m?.apiProvider || 'custom',
    leagues: listToText(m?.leagues),
    tournaments: listToText(m?.tournaments),
    teams: listToText(m?.teams),
    competitions: listToText(m?.competitions),
    fetchIntervalSeconds: m?.fetchIntervalSeconds || 60,
    refreshIntervalMinutes: m?.refreshIntervalMinutes || 1,
  });

  const loadConfig = useCallback(async () => {
    const { data } = await sportsService.getConfig();
    setConfig(data.data);
    setCounts(data.counts || {});
    const next = {};
    SPORTS.forEach((s) => {
      next[s] = sportFromConfig(data.data[s]);
    });
    setForms(next);
    setWidgets(data.data.widgets?.length ? data.data.widgets : []);
    setGlobalForm({
      showOnHomepage: data.data.showOnHomepage !== false,
      homepageTitle: data.data.homepageTitle || 'Live Sports',
    });
  }, []);

  const loadMatches = useCallback(async () => {
    const { data } = await sportsService.getMatches({
      sport: filterSport === 'all' ? undefined : filterSport,
      status: filterStatus === 'all' ? undefined : filterStatus,
      limit: 50,
    });
    setMatches(data.data || []);
  }, [filterSport, filterStatus]);

  const loadStandings = useCallback(async () => {
    const { data } = await sportsService.getStandings({
      sport: filterSport === 'all' ? undefined : filterSport,
    });
    setStandings(data.data || []);
  }, [filterSport]);

  const loadStatus = useCallback(async () => {
    const { data } = await sportsService.getStatus();
    setSyncStatus((s) => ({
      ...s,
      running: Boolean(data.fetchInProgress),
    }));
    if (data.counts) setCounts((prev) => ({ ...prev, bySport: data.counts.bySport, total: data.counts.total }));
  }, []);

  const refreshDashboard = useCallback(async () => {
    await loadConfig();
    await loadStatus();
    if (tab === 'matches' || tab === 'preview') await loadMatches();
  }, [loadConfig, loadStatus, loadMatches, tab]);

  const runSync = useCallback(async (sports, { switchToMatches = false } = {}) => {
    if (syncRunningRef.current) return;
    syncRunningRef.current = true;
    setFetching(true);
    setSyncStatus((s) => ({ ...s, running: true, error: '' }));
    try {
      const { data } = await sportsService.fetchNow(sports);
      if (data.data) setConfig(data.data);
      if (data.counts) {
        setCounts((prev) => ({
          ...prev,
          bySport: data.counts.bySport,
          total: data.counts.total,
        }));
      }

      const failed = (data.results || []).filter((r) => r.success === false || r.apiError);
      const ok = (data.results || []).filter((r) => r.success !== false && !r.apiError && !r.skipped);
      if (failed.length && !ok.length) {
        toast.error(data.message || 'Fetch failed');
        setSyncStatus({
          lastFetch: new Date(),
          running: false,
          error: data.message || 'Fetch failed',
        });
      } else if (failed.length) {
        toast.error(data.message || 'Fetch finished with some errors');
        setSyncStatus({ lastFetch: new Date(), running: false, error: data.message || '' });
      } else {
        const cricket = (data.results || []).find((r) => r.sport === 'cricket' && !r.skipped);
        const cricketMsg = cricket
          ? ` · Cricket: ${cricket.received ?? 0} fixtures (${cricket.liveCount ?? 0} live), ${cricket.catalogCounts?.teams ?? 0} teams`
          : '';
        toast.success((data.message || 'Fetch completed') + cricketMsg);
        setSyncStatus({ lastFetch: new Date(), running: false, error: '' });
        if (cricket && (tab === 'matches' || tab === 'cricket')) {
          setFilterSport('cricket');
          setFilterStatus('all');
        }
      }

      await loadConfig();
      if (tab === 'matches' || tab === 'preview' || switchToMatches) await loadMatches();
      if (switchToMatches) {
        setTab('matches');
        if (sports?.length === 1) setFilterSport(sports[0]);
        else setFilterSport('all');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Fetch failed';
      setSyncStatus((s) => ({ ...s, error: msg, running: false }));
      toast.error(msg);
      await loadConfig().catch(() => {});
    } finally {
      setFetching(false);
      syncRunningRef.current = false;
    }
  }, [loadConfig, loadMatches, tab]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadConfig(), loadStatus()]);
    } catch {
      toast.error('Failed to load sports data');
    } finally {
      setLoading(false);
    }
  }, [loadConfig, loadStatus]);

  useEffect(() => {
    pollRef.current = setInterval(() => {
      loadStatus().catch(() => {});
      if (tab === 'matches') loadMatches().catch(() => {});
    }, 10_000);
    return () => clearInterval(pollRef.current);
  }, [loadStatus, loadMatches, tab]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!config) return;
    if (tab === 'matches' || tab === 'preview') {
      loadMatches().catch(() => toast.error('Failed to load matches'));
    }
    if (tab === 'standings' || tab === 'preview') {
      loadStandings().catch(() => toast.error('Failed to load standings'));
    }
  }, [tab, filterSport, filterStatus, loadMatches, loadStandings, config]);

  const setSportField = (sport, field, value) => {
    setForms((prev) => ({
      ...prev,
      [sport]: { ...(prev[sport] || emptySport()), [field]: value },
    }));
  };

  const handleSaveSport = async (sport) => {
    const f = forms[sport];
    const sec = Number(f.fetchIntervalSeconds);
    if (Number.isNaN(sec) || sec < 10 || sec > 300) {
      toast.error('Fetch interval must be 10–300 seconds');
      return;
    }
    setSaving(true);
    try {
      const { data } = await sportsService.updateConfig({
        [sport]: {
          enabled: f.enabled,
          autoFetchEnabled: f.autoFetchEnabled,
          apiBaseUrl: f.apiBaseUrl,
          apiEndpoint: f.apiEndpoint,
          apiKey: f.apiKey === '__UNCHANGED__' ? '__UNCHANGED__' : f.apiKey,
          apiProvider: f.apiProvider,
          leagues: f.leagues,
          tournaments: f.tournaments,
          teams: f.teams,
          competitions: f.competitions,
          fetchIntervalSeconds: sec,
        },
      });
      setConfig(data.data);
      toast.success(`${SPORT_LABELS[sport]} settings saved`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWidgets = async () => {
    setSaving(true);
    try {
      const { data } = await sportsService.updateConfig({
        widgets,
        showOnHomepage: globalForm.showOnHomepage,
        homepageTitle: globalForm.homepageTitle,
      });
      setConfig(data.data);
      toast.success('Widgets & display settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleFetch = (sports) => runSync(sports, { switchToMatches: true });

  const handleTogglePublish = async (match) => {
    try {
      await sportsService.updateMatch(match._id, { isPublished: !match.isPublished });
      toast.success(match.isPublished ? 'Unpublished' : 'Published');
      await loadMatches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this match?')) return;
    try {
      await sportsService.deleteMatch(id);
      toast.success('Deleted');
      await loadMatches();
      await loadConfig();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleDeleteStanding = async (id, label = 'this standings table') => {
    if (!window.confirm(`Remove ${label}?`)) return;
    try {
      await sportsService.deleteStanding(id);
      toast.success('Standings removed');
      await loadStandings();
      await loadConfig();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Remove failed');
    }
  };

  const updateWidget = (type, patch) => {
    setWidgets((prev) =>
      prev.map((w) => (w.type === type ? { ...w, ...patch } : w))
    );
  };

  const toggleWidgetPage = (type, page) => {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.type !== type) return w;
        const pages = w.pages || [];
        const next = pages.includes(page) ? pages.filter((p) => p !== page) : [...pages, page];
        return { ...w, pages: next.length ? next : ['homepage'] };
      })
    );
  };

  const toggleWidgetSport = (type, sport) => {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.type !== type) return w;
        const sports = w.sports || [];
        const next = sports.includes(sport) ? sports.filter((s) => s !== sport) : [...sports, sport];
        return { ...w, sports: next.length ? next : [sport] };
      })
    );
  };

  const applyPreset = (sport) => {
    const preset = PROVIDER_PRESETS[sport];
    if (!preset) return;
    setForms((prev) => ({
      ...prev,
      [sport]: {
        ...(prev[sport] || emptySport()),
        apiBaseUrl: preset.apiBaseUrl,
        apiEndpoint: preset.apiEndpoint,
        apiProvider: preset.apiProvider,
        fetchIntervalSeconds: preset.fetchIntervalSeconds || 60,
      },
    }));
    toast.success(`${SPORT_LABELS[sport]} provider preset applied — Save to keep`);
  };

  const renderSportForm = (sport) => {
    const f = forms[sport] || emptySport();
    const cfg = config?.[sport];
    const preset = PROVIDER_PRESETS[sport] || PROVIDER_PRESETS.other;
    const apiStatus =
      cfg?.lastFetchStatus === 'success'
        ? 'OK'
        : cfg?.lastFetchStatus === 'error'
          ? 'Error'
          : '—';
    return (
      <div className="admin-card space-y-4 max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-900">{SPORT_LABELS[sport]} settings</h2>
          <div className="flex items-center gap-2">
            <StatusBadge active={f.enabled} />
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                apiStatus === 'OK'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : apiStatus === 'Error'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              API {apiStatus}
            </span>
            {f.autoFetchEnabled && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                Auto refresh
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600 space-y-1">
          <p>
            <span className="text-slate-400">Last updated:</span>{' '}
            {cfg?.lastFetchAt ? new Date(cfg.lastFetchAt).toLocaleString() : '—'}
            {cfg?.lastLiveCount != null ? ` · ${cfg.lastLiveCount} live` : ''}
            {cfg?.lastHttpStatus ? ` · HTTP ${cfg.lastHttpStatus}` : ''}
          </p>
          {cfg?.lastFetchStatus === 'error' && cfg?.lastFetchError && (
            <p className="text-rose-600">Error: {cfg.lastFetchError}</p>
          )}
          <p className="text-slate-400">
            Recommended: {preset.apiProvider} · live refresh every 60s (server-side when Auto refresh is on)
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="block text-sm font-medium text-slate-700">API base URL</label>
              {PROVIDER_PRESETS[sport] && (
                <button
                  type="button"
                  onClick={() => applyPreset(sport)}
                  className="text-xs text-brand-700 hover:underline"
                >
                  Apply {preset.apiProvider} preset
                </button>
              )}
            </div>
            <input
              className="admin-input font-mono text-xs sm:text-sm"
              value={f.apiBaseUrl}
              onChange={(e) => setSportField(sport, 'apiBaseUrl', e.target.value)}
              placeholder={preset.apiBaseUrl || 'https://api.example.com'}
            />
            <p className="text-xs text-slate-400 mt-1">
              Required for live data. Keys are stored on the server only — never sent to the public site.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">API endpoint</label>
            <input
              className="admin-input font-mono text-xs sm:text-sm"
              value={f.apiEndpoint}
              onChange={(e) => setSportField(sport, 'apiEndpoint', e.target.value)}
              placeholder={preset.apiEndpoint || '/live or full URL'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">API key</label>
            <input
              type="password"
              className="admin-input"
              value={f.apiKey === '__UNCHANGED__' ? '' : f.apiKey}
              onChange={(e) => setSportField(sport, 'apiKey', e.target.value)}
              placeholder={f.hasApiKey ? f.apiKeyMasked || 'Key saved' : (preset.apiKeyHint?.includes('Required') ? 'Required' : 'Optional / empty')}
              autoComplete="off"
            />
            <p className="text-[10px] text-slate-400 mt-1">{preset.apiKeyHint}</p>
            {f.hasApiKey && f.apiKey === '__UNCHANGED__' && (
              <p className="text-[10px] text-slate-400 mt-1">Saved: {f.apiKeyMasked}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Provider</label>
            <input
              className="admin-input"
              value={f.apiProvider}
              onChange={(e) => setSportField(sport, 'apiProvider', e.target.value)}
              placeholder={preset.apiProvider || 'CricLive / SportScore / chess / custom'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Fetch interval (seconds)</label>
            <input
              type="number"
              min={10}
              max={300}
              className="admin-input"
              value={f.fetchIntervalSeconds}
              onChange={(e) => setSportField(sport, 'fetchIntervalSeconds', e.target.value)}
            />
            <p className="text-[10px] text-slate-400 mt-1">Live scores: use 60. Schedule/teams data is cached longer on the server.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Leagues</label>
            <textarea
              className="admin-input"
              rows={2}
              value={f.leagues}
              onChange={(e) => setSportField(sport, 'leagues', e.target.value)}
              placeholder={sport === 'cricket' ? 'Auto-filled from API after Fetch Now' : 'IPL\nPremier League'}
            />
            {sport === 'cricket' && (
              <p className="text-[10px] text-slate-400 mt-1">Catalog from API — not used to hide fixtures</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tournaments</label>
            <textarea
              className="admin-input"
              rows={2}
              value={f.tournaments}
              onChange={(e) => setSportField(sport, 'tournaments', e.target.value)}
              placeholder={sport === 'cricket' ? 'Auto-filled from API after Fetch Now' : ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Competitions</label>
            <textarea
              className="admin-input"
              rows={2}
              value={f.competitions}
              onChange={(e) => setSportField(sport, 'competitions', e.target.value)}
              placeholder={sport === 'cricket' ? 'Series / competitions from API' : ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Teams</label>
            <textarea
              className="admin-input"
              rows={2}
              value={f.teams}
              onChange={(e) => setSportField(sport, 'teams', e.target.value)}
              placeholder={
                sport === 'cricket'
                  ? 'All teams from API (India, Australia, …) — not limited to CSK/MI'
                  : 'India\nAustralia'
              }
            />
          </div>
        </div>

        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input type="checkbox" checked={f.enabled} onChange={(e) => setSportField(sport, 'enabled', e.target.checked)} className="rounded border-slate-300 text-brand-600" />
            Enable {SPORT_LABELS[sport].toLowerCase()}
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input type="checkbox" checked={f.autoFetchEnabled} onChange={(e) => setSportField(sport, 'autoFetchEnabled', e.target.checked)} className="rounded border-slate-300 text-brand-600" />
            Automatic live refresh (server, every {f.fetchIntervalSeconds || 60}s)
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={saving} onClick={() => handleSaveSport(sport)} className="btn-primary disabled:opacity-50">
            {saving ? 'Saving…' : `Save ${SPORT_LABELS[sport]}`}
          </button>
          <button type="button" disabled={fetching || !f.enabled} onClick={() => handleFetch([sport])} className="btn-secondary disabled:opacity-50">
            {fetching ? 'Fetching…' : 'Fetch now'}
          </button>
        </div>
      </div>
    );
  };

  if (loading && !config) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="admin-card text-center py-14">
        <p className="text-slate-700 font-medium mb-2">Could not load sports settings</p>
        <button type="button" onClick={load} className="btn-primary text-sm">Retry</button>
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-x-hidden">
      <AdminPageHeader
        title="Sports Live Updates"
        subtitle="Configure sports APIs, live scores, gadgets/widgets, and homepage placements."
      >
        <button
          type="button"
          onClick={() => handleFetch(SPORTS)}
          disabled={fetching}
          className="btn-primary text-sm py-2.5 px-4 w-full sm:w-auto disabled:opacity-50"
        >
          {fetching ? 'Fetching…' : 'Fetch All Sports'}
        </button>
      </AdminPageHeader>

      <div className="admin-card !p-3 sm:!p-4 mb-4 text-xs sm:text-sm">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <span>
            <span className="text-slate-400">Auto sync: </span>
            <span className="font-semibold text-slate-700">Server scheduler (60s live default)</span>
          </span>
          <span>
            <span className="text-slate-400">Last updated: </span>
            <span className="font-medium text-slate-700">
              {syncStatus.lastFetch
                ? syncStatus.lastFetch.toLocaleTimeString()
                : config?.lastGlobalFetchAt
                  ? new Date(config.lastGlobalFetchAt).toLocaleTimeString()
                  : '—'}
            </span>
          </span>
          <span>
            <span className="text-slate-400">Status: </span>
            <span className={`font-medium ${syncStatus.running || fetching ? 'text-sky-700' : syncStatus.error ? 'text-rose-600' : 'text-emerald-700'}`}>
              {syncStatus.running || fetching ? 'Running…' : syncStatus.error || 'Ready'}
            </span>
          </span>
          <span>
            <span className="text-slate-400">Total live: </span>
            <span className="font-medium text-slate-700">{counts.total ?? 0}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-4">
        {SPORTS.map((s) => (
          <div key={s} className="admin-stat-card min-w-0">
            <p className="text-[10px] sm:text-xs text-slate-500 uppercase truncate">{SPORT_LABELS[s]}</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{counts.bySport?.[s] ?? 0}</p>
            <p className="text-[10px] text-slate-400">live</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide -mx-1 px-1">
        {[
          ...SPORTS.map((s) => ({ key: s, label: SPORT_LABELS[s] })),
          { key: 'widgets', label: 'Widgets' },
          { key: 'matches', label: 'Matches' },
          { key: 'standings', label: 'Standings' },
          { key: 'preview', label: 'Preview' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
              tab === t.key ? 'admin-tab admin-tab-active' : 'admin-tab'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {SPORTS.includes(tab) && renderSportForm(tab)}

      {tab === 'widgets' && (
        <div className="space-y-4 max-w-4xl">
          <div className="admin-card space-y-4">
            <h2 className="font-semibold text-slate-900">Display</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Homepage title</label>
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
              Show sports widgets on homepage
            </label>
          </div>

          {widgets.map((w) => (
            <div key={w.type} className="admin-card space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{WIDGET_LABELS[w.type] || w.type}</h3>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={w.enabled !== false}
                    onChange={(e) => updateWidget(w.type, { enabled: e.target.checked })}
                    className="rounded border-slate-300 text-brand-600"
                  />
                  Enabled
                </label>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Show on pages</label>
                <div className="flex flex-wrap gap-2">
                  {PAGE_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => toggleWidgetPage(w.type, p.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                        (w.pages || []).includes(p.value)
                          ? 'admin-tab admin-tab-active'
                          : 'admin-tab'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Sports</label>
                <div className="flex flex-wrap gap-2">
                  {SPORTS.filter((s) => s !== 'other').map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleWidgetSport(w.type, s)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                        (w.sports || []).includes(s)
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {SPORT_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="max-w-xs">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Max items</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className="admin-input"
                  value={w.maxItems || 6}
                  onChange={(e) => updateWidget(w.type, { maxItems: Number(e.target.value) })}
                />
              </div>
            </div>
          ))}

          <button type="button" disabled={saving} onClick={handleSaveWidgets} className="btn-primary disabled:opacity-50">
            {saving ? 'Saving…' : 'Save widgets & display'}
          </button>
        </div>
      )}

      {tab === 'matches' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {['all', ...SPORTS].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterSport(s)}
                  className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg capitalize ${
                    filterSport === s ? 'admin-tab admin-tab-active' : 'admin-tab'
                  }`}
                >
                  {SPORT_LABELS[s] || s}
                </button>
              ))}
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="admin-input text-sm py-2 w-auto"
            >
              <option value="all">All statuses</option>
              <option value="live">Live</option>
              <option value="scheduled">Upcoming</option>
              <option value="finished">Finished</option>
              <option value="halftime">Halftime</option>
              <option value="postponed">Postponed</option>
            </select>
          </div>

          {matches.length === 0 ? (
            <div className="admin-card text-center py-14 text-slate-500">
              <p className="font-medium text-slate-700 mb-1">No matches yet</p>
              <p className="text-sm mb-4">Configure a sport and click Fetch.</p>
              <button type="button" onClick={() => handleFetch(SPORTS)} disabled={fetching} className="btn-primary text-sm">
                Fetch All Sports
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((m) => (
                <div key={m._id} className="admin-card !p-3 sm:!p-4 flex flex-col gap-3 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-semibold text-teal-700">
                        {SPORT_LABELS[m.sport] || m.sport}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${statusStyles[m.status] || statusStyles.scheduled}`}>
                        {m.status}{m.statusDetail ? ` · ${m.statusDetail}` : ''}
                      </span>
                      {m.league && <span className="text-[10px] text-slate-400 break-words">{m.league}</span>}
                    </div>
                    <p className="font-semibold text-slate-900 break-words text-sm sm:text-base">
                      {m.homeTeam} <span className="text-slate-400 font-normal">vs</span> {m.awayTeam}
                    </p>
                    <p className="text-xs sm:text-sm font-mono text-slate-700 mt-0.5 break-all">{scoreDisplay(m)}</p>
                    <p className="text-[11px] text-slate-400 mt-1 break-words">
                      Source: {m.source}
                      {m.startTime ? ` · ${new Date(m.startTime).toLocaleString()}` : ''}
                      {m.lastUpdatedAt ? ` · Updated ${new Date(m.lastUpdatedAt).toLocaleString()}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => { setPreview(m); setTab('preview'); }} className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700">
                      Preview
                    </button>
                    <button type="button" onClick={() => handleTogglePublish(m)} className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-700">
                      {m.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button type="button" onClick={() => handleDelete(m._id)} className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'standings' && (
        <div className="space-y-4 min-w-0">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {['all', ...SPORTS].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterSport(s)}
                className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg capitalize ${
                  filterSport === s ? 'admin-tab admin-tab-active' : 'admin-tab'
                }`}
              >
                {SPORT_LABELS[s] || s}
              </button>
            ))}
          </div>
          {standings.length === 0 ? (
            <div className="admin-card text-center py-12 text-slate-500">No standings data. Fetch sports first.</div>
          ) : (
            standings.map((table) => (
              <div key={table._id} className="admin-card overflow-hidden min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 break-words">
                      {table.league}{' '}
                      <span className="text-xs font-normal text-slate-400">({SPORT_LABELS[table.sport]})</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Updated {table.lastUpdatedAt ? new Date(table.lastUpdatedAt).toLocaleString() : '—'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteStanding(
                        table._id,
                        `"${table.league || 'Standings'}" (${SPORT_LABELS[table.sport] || table.sport})`
                      )
                    }
                    className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 shrink-0 self-start"
                  >
                    Remove
                  </button>
                </div>
                <div className="overflow-x-auto -mx-1 px-1 mt-3">
                  <table className="admin-table min-w-[420px] w-full text-xs sm:text-sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Team</th>
                        <th>P</th>
                        <th>W</th>
                        <th>D</th>
                        <th>L</th>
                        <th>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(table.rows || []).map((row, i) => (
                        <tr key={`${row.team}-${i}`}>
                          <td>{row.rank || i + 1}</td>
                          <td className="font-medium break-words">{row.team}</td>
                          <td>{row.played ?? '—'}</td>
                          <td>{row.won ?? '—'}</td>
                          <td>{row.drawn ?? '—'}</td>
                          <td>{row.lost ?? '—'}</td>
                          <td className="font-semibold">{row.points ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'preview' && (
        <div className="space-y-4 max-w-3xl min-w-0">
          <div className="admin-card overflow-hidden">
            <h2 className="font-semibold text-slate-900 mb-3">Widget preview</h2>
            <p className="text-sm text-slate-500 mb-4">
              Preview how live score / upcoming cards will look before publishing to the site.
            </p>
            {(preview ? [preview] : matches.filter((m) => m.status === 'live' || m.status === 'halftime').slice(0, 4)).length === 0 ? (
              <p className="text-slate-500 text-sm">No matches to preview. Fetch sports data first.</p>
            ) : (
              <div className="space-y-3">
                {(preview ? [preview] : matches.filter((m) => m.status === 'live' || m.status === 'halftime').slice(0, 4)).map((m) => {
                  const home = m.homeScoreText || String(m.homeScore ?? 0);
                  const away = m.awayScoreText || String(m.awayScore ?? 0);
                  return (
                    <div key={m._id} className="rounded-xl border border-slate-200 p-3 sm:p-4 bg-slate-50 overflow-hidden">
                      <div className="flex justify-between gap-2 text-[10px] uppercase font-semibold mb-3">
                        <span className="text-teal-700 break-words min-w-0">
                          {SPORT_LABELS[m.sport]} · {m.league || 'Match'}
                        </span>
                        <span className={`shrink-0 ${m.status === 'live' ? 'text-rose-600' : 'text-slate-500'}`}>
                          {m.status}{m.statusDetail ? ` ${m.statusDetail}` : ''}
                        </span>
                      </div>
                      <div className="space-y-2 sm:hidden">
                        <div className="flex justify-between gap-2 text-sm font-semibold">
                          <span className="break-words">{m.homeTeam}</span>
                          <span className="font-mono text-xs shrink-0 max-w-[45%] break-all">{home}</span>
                        </div>
                        <div className="flex justify-between gap-2 text-sm font-semibold">
                          <span className="break-words">{m.awayTeam}</span>
                          <span className="font-mono text-xs shrink-0 max-w-[45%] break-all">{away}</span>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center justify-between gap-3">
                        <span className="font-semibold text-sm text-slate-900 flex-1 text-right break-words">{m.homeTeam}</span>
                        <span className="font-mono text-xs sm:text-sm px-3 py-1 rounded-lg bg-white border border-slate-200 shrink-0 max-w-[40%] text-center break-all">
                          {home} — {away}
                        </span>
                        <span className="font-semibold text-sm text-slate-900 flex-1 break-words">{m.awayTeam}</span>
                      </div>
                      {Array.isArray(m.players) && m.players.length > 0 && (
                        <p className="text-xs text-slate-500 mt-2 break-words">
                          Players: {m.players.map((p) => p.name).filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {preview && (
              <button type="button" onClick={() => setPreview(null)} className="btn-secondary text-sm mt-4 w-full sm:w-auto">
                Clear selection
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SportsLiveAdmin;
