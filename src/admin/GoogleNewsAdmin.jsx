import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { googleNewsService, mediaService } from '../services/articleService';
import NewsImage from '../components/NewsImage';
import AdminPageHeader, { StatusBadge } from './AdminPageHeader';
import DataTable from './DataTable';

const TOPICS = 'WORLD, NATION, BUSINESS, TECHNOLOGY, ENTERTAINMENT, SPORTS, SCIENCE, HEALTH';
const STATUSES = ['pending', 'published', 'rejected', 'draft'];
const STATUS_CLS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  draft: 'bg-slate-50 text-slate-600 border-slate-200',
};
const EMPTY = {
  title: '', description: '', content: '', link: '', slug: '',
  category: '', sourceName: '', image: '', notes: '',
  status: 'draft', publishedAt: '', isActive: true,
  isMustRead: false, isMustWatch: false, displayOrder: 0,
};
const listToText = (a) => (Array.isArray(a) ? a.join('\n') : '');
const dtLocal = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const toForm = (i) => ({
  title: i.title || '', description: i.description || '', content: i.content || '',
  link: i.link || '', slug: i.slug || '', category: i.category || '',
  sourceName: i.sourceName || '', image: i.image || '', notes: i.notes || '',
  status: i.status || 'draft', publishedAt: dtLocal(i.publishedAt),
  isActive: i.isActive !== false, isMustRead: Boolean(i.isMustRead),
  isMustWatch: Boolean(i.isMustWatch), displayOrder: i.displayOrder || 0,
});
const toPayload = (f) => ({
  title: f.title, description: f.description, content: f.content,
  link: f.link, slug: f.slug, category: f.category, sourceName: f.sourceName,
  image: f.image, notes: f.notes, status: f.status, isActive: f.isActive,
  isMustRead: f.isMustRead, isMustWatch: f.isMustWatch,
  displayOrder: Number(f.displayOrder) || 0,
  ...(f.publishedAt ? { publishedAt: new Date(f.publishedAt).toISOString() } : {}),
});
const taRows = (t, min = 4, max = 24) =>
  Math.min(max, Math.max(min, Math.ceil(String(t || '').split('\n').length + String(t || '').length / 90)));

const GoogleNewsAdmin = () => {
  const [tab, setTab] = useState('list');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [config, setConfig] = useState(null);
  const [counts, setCounts] = useState({});
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ categories: [] });
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterCategory, setFilterCategory] = useState('');
  const [editId, setEditId] = useState(null);
  const [itemForm, setItemForm] = useState(EMPTY);
  const [cfg, setCfg] = useState({
    sources: '', categories: '', keywords: '', language: 'en', country: 'IN',
    updateFrequencyMinutes: 60, autoFetchEnabled: false, autoSyncEnabled: false,
    autoSyncIntervalSeconds: 10, autoPublish: false,
    showOnHomepage: true, maxItemsPerFetch: 20, homepageTitle: 'Google News',
  });
  const [autoSync, setAutoSync] = useState({
    enabled: false,
    lastSync: null,
    lastNew: 0,
    nextLabel: 'OFF',
    error: '',
    running: false,
  });

  const syncRunningRef = useRef(false);
  const countdownRef = useRef(null);
  const syncTimeoutRef = useRef(null);
  const autoSyncEnabledRef = useRef(false);
  const intervalSecRef = useRef(10);

  const patchItem = (p) => setItemForm((f) => ({ ...f, ...p }));
  const patchCfg = (p) => setCfg((f) => ({ ...f, ...p }));

  const clearAutoSyncTimers = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }
  }, []);

  const loadConfig = useCallback(async () => {
    const { data } = await googleNewsService.getConfig();
    setConfig(data.data);
    setCounts(data.counts || {});
    const c = data.data;
    setCfg({
      sources: listToText(c.sources), categories: listToText(c.categories),
      keywords: listToText(c.keywords), language: c.language || 'en',
      country: c.country || 'IN', updateFrequencyMinutes: c.updateFrequencyMinutes || 60,
      autoFetchEnabled: Boolean(c.autoFetchEnabled),
      autoSyncEnabled: Boolean(c.autoSyncEnabled),
      autoSyncIntervalSeconds: c.autoSyncIntervalSeconds || 10,
      autoPublish: Boolean(c.autoPublish),
      showOnHomepage: c.showOnHomepage !== false, maxItemsPerFetch: c.maxItemsPerFetch || 20,
      homepageTitle: c.homepageTitle || 'Google News',
    });
    setAutoSync((prev) => ({
      ...prev,
      enabled: Boolean(c.autoSyncEnabled),
      lastNew: c.lastFetchCount ?? prev.lastNew,
    }));
  }, []);

  const loadItems = useCallback(async () => {
    const { data } = await googleNewsService.getItems({
      status: filterStatus, category: filterCategory || undefined, limit: 100,
    });
    setItems(data.data || []);
  }, [filterStatus, filterCategory]);

  const refreshDashboard = useCallback(async () => {
    await loadConfig();
    if (tab === 'list') await loadItems();
  }, [loadConfig, loadItems, tab]);

  /** Shared sync — used by Sync Now and auto-sync timer */
  const startCountdownRef = useRef(null);

  const runSync = useCallback(async ({ isAuto = false, switchToList = false } = {}) => {
    if (syncRunningRef.current) {
      if (isAuto && autoSyncEnabledRef.current && startCountdownRef.current) {
        startCountdownRef.current();
      }
      return { skipped: true };
    }

    syncRunningRef.current = true;
    setFetching(true);
    setAutoSync((s) => ({ ...s, running: true, nextLabel: 'Running...', error: '' }));
    if (isAuto) clearAutoSyncTimers();

    try {
      const { data } = await googleNewsService.fetchNow();

      if (data.inProgress) {
        return { skipped: true };
      }

      const created = data.data?.created ?? 0;
      const now = new Date();

      setAutoSync((s) => ({
        ...s,
        lastSync: now,
        lastNew: created,
        error: data.success ? '' : (data.message || 'API Error'),
        running: false,
      }));

      if (!isAuto) {
        toast.success(data.message || 'Sync complete');
      }

      await refreshDashboard();

      if (switchToList) {
        setTab('list');
        setFilterStatus('pending');
      }

      return { success: true, created };
    } catch (err) {
      const msg = err.response?.data?.message || 'API Error';
      setAutoSync((s) => ({
        ...s,
        lastSync: new Date(),
        error: msg,
        running: false,
      }));
      if (!isAuto) toast.error(msg);
      return { success: false, error: msg };
    } finally {
      syncRunningRef.current = false;
      setFetching(false);
      if (autoSyncEnabledRef.current && startCountdownRef.current) {
        startCountdownRef.current();
      }
    }
  }, [clearAutoSyncTimers, refreshDashboard]);

  const startCountdown = useCallback(() => {
    clearAutoSyncTimers();
    if (!autoSyncEnabledRef.current) {
      setAutoSync((s) => ({ ...s, nextLabel: 'OFF' }));
      return;
    }

    const sec = intervalSecRef.current;
    let remaining = sec;
    setAutoSync((s) => ({ ...s, nextLabel: `${remaining}s`, running: false }));

    countdownRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearAutoSyncTimers();
        setAutoSync((s) => ({ ...s, nextLabel: 'Running...' }));
        syncTimeoutRef.current = setTimeout(() => {
          runSync({ isAuto: true });
        }, 0);
      } else {
        setAutoSync((s) => ({ ...s, nextLabel: `${remaining}s` }));
      }
    }, 1000);
  }, [clearAutoSyncTimers, runSync]);

  startCountdownRef.current = startCountdown;

  useEffect(() => {
    autoSyncEnabledRef.current = Boolean(cfg.autoSyncEnabled);
    intervalSecRef.current = Math.max(10, Number(cfg.autoSyncIntervalSeconds) || 10);
  }, [cfg.autoSyncEnabled, cfg.autoSyncIntervalSeconds]);

  useEffect(() => {
    if (!cfg.autoSyncEnabled) {
      clearAutoSyncTimers();
      setAutoSync((s) => ({ ...s, enabled: false, nextLabel: 'OFF', running: false }));
      return undefined;
    }

    setAutoSync((s) => ({ ...s, enabled: true }));
    startCountdown();

    return () => clearAutoSyncTimers();
  }, [cfg.autoSyncEnabled, cfg.autoSyncIntervalSeconds, startCountdown, clearAutoSyncTimers]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadConfig(), loadItems(),
          googleNewsService.getFilters().then(({ data }) => setMeta(data.data || {})),
        ]);
      } catch { toast.error('Failed to load Google News data'); }
      finally { setLoading(false); }
    })();
  }, [loadConfig, loadItems]);

  useEffect(() => {
    if (tab === 'list') loadItems().catch(() => toast.error('Failed to load items'));
  }, [tab, filterStatus, filterCategory, loadItems]);

  useEffect(() => () => clearAutoSyncTimers(), [clearAutoSyncTimers]);

  const syncNow = () => runSync({ isAuto: false, switchToList: true });

  const enrichNow = async () => {
    setEnriching(true);
    try {
      const { data } = await googleNewsService.enrichExisting(40);
      toast.success(data.message || 'Enrichment complete');
      await loadItems();
    } catch (err) { toast.error(err.response?.data?.message || 'Enrichment failed'); }
    finally { setEnriching(false); }
  };

  const saveConfig = async (e) => {
    e.preventDefault();
    const mins = Number(cfg.updateFrequencyMinutes);
    const syncSec = Number(cfg.autoSyncIntervalSeconds);
    if (Number.isNaN(mins) || mins < 15 || mins > 1440) return toast.error('Frequency must be 15–1440 min');
    if (Number.isNaN(syncSec) || syncSec < 10 || syncSec > 300) return toast.error('Auto sync interval must be 10–300 seconds');
    setSaving(true);
    try {
      const { data } = await googleNewsService.updateConfig({
        ...cfg, language: cfg.language.trim().toLowerCase(),
        country: cfg.country.trim().toUpperCase(), updateFrequencyMinutes: mins,
        autoSyncIntervalSeconds: syncSec,
        maxItemsPerFetch: Number(cfg.maxItemsPerFetch),
      });
      setConfig(data.data);
      setCfg((prev) => ({
        ...prev,
        autoSyncEnabled: Boolean(data.data.autoSyncEnabled),
        autoSyncIntervalSeconds: data.data.autoSyncIntervalSeconds || 10,
      }));
      toast.success(data.message || 'Saved');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const toggleAutoSync = async (enabled) => {
    patchCfg({ autoSyncEnabled: enabled });
    try {
      const syncSec = Math.max(10, Number(cfg.autoSyncIntervalSeconds) || 10);
      await googleNewsService.updateConfig({
        autoSyncEnabled: enabled,
        autoSyncIntervalSeconds: syncSec,
      });
      toast.success(
        enabled
          ? `Auto sync ON — fetches every ${syncSec}s while this page stays open`
          : 'Auto sync OFF'
      );
    } catch (err) {
      patchCfg({ autoSyncEnabled: !enabled });
      toast.error(err.response?.data?.message || 'Failed to save auto sync');
    }
  };

  const openEdit = async (row) => {
    try {
      const { data } = await googleNewsService.getItem(row._id);
      setEditId(row._id);
      setItemForm(toForm(data.data));
      setTab('form');
    } catch { toast.error('Failed to load item'); }
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const { data } = await mediaService.upload(fd);
      patchItem({ image: data.data?.url || '' });
      toast.success('Image uploaded');
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const saveItem = async (e) => {
    e.preventDefault();
    if (!itemForm.title.trim()) return toast.error('Title is required');
    if (!editId && !itemForm.link.trim()) return toast.error('Article URL is required');
    setSaving(true);
    try {
      const payload = toPayload(itemForm);
      if (editId) await googleNewsService.updateItem(editId, payload);
      else await googleNewsService.createItem(payload);
      toast.success(editId ? 'Updated' : 'Created');
      setEditId(null);
      setItemForm(EMPTY);
      setTab('list');
      await loadConfig();
      await loadItems();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete permanently?')) return;
    try {
      await googleNewsService.deleteItem(id);
      toast.success('Deleted');
      if (editId === id) { setEditId(null); setItemForm(EMPTY); setTab('list'); }
      await loadConfig();
      await loadItems();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const columns = useMemo(() => [
    { key: 'image', header: '', render: (r) => (
      r.image && !r.image.includes('picsum.photos') ? (
        <NewsImage src={r.image} seed={r._id} alt="" noPlaceholder className="w-14 h-10 rounded-lg object-cover bg-slate-100" placeholderClassName="w-14 h-10 rounded-lg" />
      ) : (
        <div className="w-14 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[9px] text-slate-400 text-center px-1">No img</div>
      )
    ) },
    {
      key: 'title', header: 'Title', sortable: true, cellClassName: 'max-w-xs',
      render: (r) => (
        <div>
          <p className="font-medium text-slate-900 line-clamp-2">{r.title}</p>
          {r.slug && <p className="text-xs text-slate-400">/{r.slug}</p>}
        </div>
      ),
    },
    { key: 'sourceName', header: 'Source', sortable: true, render: (r) => r.sourceName || '—' },
    {
      key: 'publishedAt', header: 'Published', sortable: true,
      sortValue: (r) => (r.publishedAt ? new Date(r.publishedAt).getTime() : 0),
      render: (r) => r.publishedAt ? new Date(r.publishedAt).toLocaleString('en-IN') : '—',
    },
    {
      key: 'flags', header: 'Flags',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.isMustRead && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">Must Read</span>}
          {r.isMustWatch && <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">Must Watch</span>}
        </div>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (r) => <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${STATUS_CLS[r.status] || STATUS_CLS.draft}`}>{r.status}</span>,
    },
    {
      key: 'actions', header: 'Actions',
      render: (r) => (
        <div className="data-table-actions">
          <button type="button" onClick={() => openEdit(r)} className="data-table-action data-table-action-edit">Edit</button>
          {r.link && <a href={r.link} target="_blank" rel="noopener noreferrer" className="data-table-action data-table-action-secondary">Source</a>}
          <button type="button" onClick={() => deleteItem(r._id)} className="data-table-action data-table-action-delete">Delete</button>
        </div>
      ),
    },
  ], []);

  if (loading && !config) {
    return <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>;
  }

  const stats = [
    ['Pending', counts.pending, 'text-amber-700', 'bg-amber-50'],
    ['Published', counts.published, 'text-emerald-700', 'bg-emerald-50'],
    ['Rejected', counts.rejected, 'text-rose-700', 'bg-rose-50'],
    ['Total', counts.total, 'text-slate-800', 'bg-slate-50'],
  ];

  const lastSyncDisplay = autoSync.lastSync
    ? autoSync.lastSync.toLocaleTimeString()
    : config?.lastFetchAt
      ? new Date(config.lastFetchAt).toLocaleTimeString()
      : '—';

  return (
    <div>
      <AdminPageHeader title="Google News" subtitle="Manage fetched news, publish to site, and configure auto-sync."
        actionLabel={tab === 'form' ? undefined : '+ Add Item'} onAction={tab === 'form' ? undefined : () => { setEditId(null); setItemForm(EMPTY); setTab('form'); }}>
        <button type="button" onClick={syncNow} disabled={fetching || enriching} className="btn-primary text-sm py-2.5 px-4 disabled:opacity-50">
          {fetching ? 'Syncing…' : 'Sync Now'}
        </button>
        <button type="button" onClick={enrichNow} disabled={fetching || enriching} className="btn-secondary text-sm py-2.5 px-4 disabled:opacity-50">
          {enriching ? 'Enriching…' : 'Fetch Images & Content'}
        </button>
      </AdminPageHeader>

      <div className="admin-card !p-3 sm:!p-4 mb-4 text-xs sm:text-sm">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <span>
            <span className="text-slate-400">Auto Sync: </span>
            <span className={`font-semibold ${cfg.autoSyncEnabled ? 'text-emerald-700' : 'text-slate-500'}`}>
              {cfg.autoSyncEnabled ? 'ON' : 'OFF'}
            </span>
          </span>
          <span>
            <span className="text-slate-400">Last Sync: </span>
            <span className="font-medium text-slate-700">{lastSyncDisplay}</span>
          </span>
          <span>
            <span className="text-slate-400">Next Sync: </span>
            <span className={`font-medium ${autoSync.running || fetching ? 'text-sky-700' : 'text-slate-700'}`}>
              {fetching || autoSync.running ? 'Running…' : autoSync.nextLabel}
            </span>
          </span>
          <span>
            <span className="text-slate-400">New items fetched: </span>
            <span className="font-medium text-slate-700">{autoSync.lastNew ?? config?.lastFetchCount ?? 0}</span>
          </span>
          {autoSync.error && (
            <span>
              <span className="text-slate-400">Status: </span>
              <span className="font-medium text-rose-600">{autoSync.error}</span>
            </span>
          )}
        </div>
        {!cfg.autoSyncEnabled && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3">
            Auto sync is <strong>OFF</strong>. Open{' '}
            <button type="button" className="underline font-semibold" onClick={() => setTab('config')}>
              Config &amp; Sync
            </button>
            , check <strong>Enable Auto Sync</strong>, and set interval (min 10 seconds). Keep this browser tab open.
          </p>
        )}
        {cfg.autoSyncEnabled && (
          <p className="text-xs text-slate-500 mt-2">
            Fetching every {cfg.autoSyncIntervalSeconds || 10}s while this tab is open.{' '}
            <strong>0 new</strong> is normal when Google News items are already in your database.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map(([label, val, color, bg]) => (
          <div key={label} className={`admin-stat-card ${bg}`}>
            <p className="text-xs text-slate-500 uppercase">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{val || 0}</p>
          </div>
        ))}
      </div>

      {config?.lastFetchAt && (
        <p className={`text-sm mb-4 ${config.lastFetchStatus === 'error' ? 'text-rose-600' : 'text-slate-500'}`}>
          Last sync: {new Date(config.lastFetchAt).toLocaleString()}
          {config.lastFetchStatus === 'success' && ` · ${config.lastFetchCount || 0} new`}
          {config.lastFetchError && ` · ${config.lastFetchError}`}
        </p>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4">
        {[{ k: 'list', l: 'List' }, { k: 'form', l: editId ? 'Edit' : 'Add / Edit' }, { k: 'config', l: 'Config & Sync' }].map(({ k, l }) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={tab === k ? 'admin-tab admin-tab-active' : 'admin-tab'}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <DataTable columns={columns} data={items} loading={loading} pageSize={15}
          searchPlaceholder="Search titles, sources…" searchKeys={['title', 'sourceName', 'category', 'slug', 'description']}
          emptyMessage="No items — configure sources and Sync Now."
          toolbar={(
            <>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="admin-input py-1.5 text-sm w-auto">
                <option value="all">All statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="admin-input py-1.5 text-sm w-auto">
                <option value="">All categories</option>
                {(meta.categories || []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </>
          )}
        />
      )}

      {tab === 'form' && (
        <form onSubmit={saveItem} className="admin-card space-y-4 max-w-4xl">
          <h2 className="font-semibold text-slate-900">{editId ? 'Edit' : 'Add'} news item</h2>
          <label className="block text-sm font-medium text-slate-700">Title
            <input className="admin-input mt-1.5" value={itemForm.title} onChange={(e) => patchItem({ title: e.target.value })} required />
          </label>
          <label className="block text-sm font-medium text-slate-700">Description
            <textarea className="admin-input mt-1.5 font-mono text-sm" rows={taRows(itemForm.description)} value={itemForm.description} onChange={(e) => patchItem({ description: e.target.value })} />
          </label>
          <label className="block text-sm font-medium text-slate-700">Content
            <textarea className="admin-input mt-1.5 font-mono text-sm" rows={taRows(itemForm.content, 6, 30)} value={itemForm.content} onChange={(e) => patchItem({ content: e.target.value })} />
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-slate-700">Slug
              <input className="admin-input mt-1.5" value={itemForm.slug} onChange={(e) => patchItem({ slug: e.target.value })} />
            </label>
            <label className="block text-sm font-medium text-slate-700">Published date
              <input type="datetime-local" className="admin-input mt-1.5" value={itemForm.publishedAt} onChange={(e) => patchItem({ publishedAt: e.target.value })} />
            </label>
            <label className="block text-sm font-medium text-slate-700">Status
              <select className="admin-input mt-1.5" value={itemForm.status} onChange={(e) => patchItem({ status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">Category
              <input className="admin-input mt-1.5" value={itemForm.category} onChange={(e) => patchItem({ category: e.target.value })} />
            </label>
            <label className="block text-sm font-medium text-slate-700">Source name
              <input className="admin-input mt-1.5" value={itemForm.sourceName} onChange={(e) => patchItem({ sourceName: e.target.value })} />
            </label>
            <label className="block text-sm font-medium text-slate-700">Original URL
              <input className="admin-input mt-1.5" value={itemForm.link} onChange={(e) => patchItem({ link: e.target.value })} required={!editId} />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1.5">Image</p>
            <div className="flex flex-wrap gap-3 items-start">
              {itemForm.image && <NewsImage src={itemForm.image} seed={editId || 'new'} alt="" className="w-32 h-20 rounded-lg object-cover border" />}
              <div className="flex-1 min-w-[200px] space-y-2">
                <input className="admin-input" value={itemForm.image} onChange={(e) => patchItem({ image: e.target.value })} placeholder="Image URL" />
                <label className="btn-secondary text-sm py-2 px-3 cursor-pointer inline-block">
                  {uploading ? 'Uploading…' : 'Upload image'}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={uploadImage} />
                </label>
              </div>
            </div>
          </div>
          <label className="block text-sm font-medium text-slate-700">Admin notes
            <textarea className="admin-input mt-1.5" rows={2} value={itemForm.notes} onChange={(e) => patchItem({ notes: e.target.value })} />
          </label>
          <div className="flex flex-wrap gap-4">
            {[['isActive', 'Active on site'], ['isMustRead', 'Must Read'], ['isMustWatch', 'Must Watch']].map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={itemForm[k]} onChange={(e) => patchItem({ [k]: e.target.checked })} className="rounded border-slate-300 text-brand-600" />{l}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => { setEditId(null); setItemForm(EMPTY); setTab('list'); }} className="btn-secondary">Cancel</button>
            {editId && <button type="button" onClick={() => deleteItem(editId)} className="text-rose-600 text-sm font-medium px-3 py-2 hover:bg-rose-50 rounded-lg ml-auto">Delete</button>}
          </div>
        </form>
      )}

      {tab === 'config' && (
        <form onSubmit={saveConfig} className="admin-card space-y-5 max-w-3xl">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-slate-900">Fetch & sync settings</h2>
            <StatusBadge active={cfg.autoSyncEnabled} />
          </div>

          <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Admin panel auto sync</h3>
            <p className="text-xs text-slate-500">
              Runs every {cfg.autoSyncIntervalSeconds || 10} seconds while this page is open. Uses your saved sources, keywords, and categories below — no separate prompt.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-slate-700">Sync interval (seconds)
                <input
                  type="number"
                  min={10}
                  max={300}
                  className="admin-input mt-1.5"
                  value={cfg.autoSyncIntervalSeconds}
                  onChange={(e) => patchCfg({ autoSyncIntervalSeconds: e.target.value })}
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={cfg.autoSyncEnabled}
                onChange={(e) => toggleAutoSync(e.target.checked)}
                className="rounded border-slate-300 text-brand-600"
              />
              Enable Auto Sync (every {cfg.autoSyncIntervalSeconds || 10}s while admin is open)
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-slate-700">Language
              <select className="admin-input mt-1.5" value={cfg.language} onChange={(e) => patchCfg({ language: e.target.value })}>
                {['en', 'ta', 'hi', 'te', 'ml', 'kn'].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">Country
              <input className="admin-input mt-1.5" maxLength={2} value={cfg.country} onChange={(e) => patchCfg({ country: e.target.value.toUpperCase() })} />
            </label>
            <label className="block text-sm font-medium text-slate-700">Server background frequency (min)
              <input type="number" min={15} max={1440} className="admin-input mt-1.5" value={cfg.updateFrequencyMinutes} onChange={(e) => patchCfg({ updateFrequencyMinutes: e.target.value })} />
            </label>
            <label className="block text-sm font-medium text-slate-700">Max items per fetch
              <input type="number" min={5} max={50} className="admin-input mt-1.5" value={cfg.maxItemsPerFetch} onChange={(e) => patchCfg({ maxItemsPerFetch: e.target.value })} />
            </label>
          </div>
          <label className="block text-sm font-medium text-slate-700">Keywords (one per line)
            <textarea className="admin-input mt-1.5" rows={3} value={cfg.keywords} onChange={(e) => patchCfg({ keywords: e.target.value })} />
          </label>
          <label className="block text-sm font-medium text-slate-700">Sources / extra queries
            <textarea className="admin-input mt-1.5" rows={2} value={cfg.sources} onChange={(e) => patchCfg({ sources: e.target.value })} />
          </label>
          <label className="block text-sm font-medium text-slate-700">Categories / topics
            <textarea className="admin-input mt-1.5" rows={2} value={cfg.categories} onChange={(e) => patchCfg({ categories: e.target.value })} placeholder={TOPICS} />
          </label>
          <label className="block text-sm font-medium text-slate-700">Homepage title
            <input className="admin-input mt-1.5" value={cfg.homepageTitle} onChange={(e) => patchCfg({ homepageTitle: e.target.value })} />
          </label>
          <div className="space-y-2 border-t border-slate-100 pt-2">
            {[['autoFetchEnabled', 'Server background auto fetch'], ['autoPublish', 'Auto publish'], ['showOnHomepage', 'Show on homepage']].map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={cfg[k]} onChange={(e) => patchCfg({ [k]: e.target.checked })} className="rounded border-slate-300 text-brand-600" />{l}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving…' : 'Save Configuration'}</button>
            <button type="button" onClick={syncNow} disabled={fetching || enriching} className="btn-secondary disabled:opacity-50">{fetching ? 'Syncing…' : 'Sync now'}</button>
            <button type="button" onClick={enrichNow} disabled={fetching || enriching} className="btn-secondary disabled:opacity-50">{enriching ? 'Enriching…' : 'Fetch images & content'}</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default GoogleNewsAdmin;
