import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { governmentNotificationService } from '../services/articleService';
import AdminPageHeader, { StatusBadge } from './AdminPageHeader';

const LEVEL_LABELS = {
  central: 'Central Government',
  tamil_nadu: 'Tamil Nadu',
  department: 'Department',
  other: 'Other',
};

const CATEGORY_LABELS = {
  announcement: 'Announcement',
  scheme: 'Scheme',
  job: 'Job',
  tender: 'Tender',
  order: 'Order',
  circular: 'Circular',
  welfare: 'Welfare',
  public_notice: 'Public Notice',
  alert: 'Alert',
  general: 'General',
};

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-sky-50 text-sky-700 border-sky-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  disabled: 'bg-slate-100 text-slate-600 border-slate-200',
};

const emptySource = () => ({
  name: '',
  level: 'central',
  department: '',
  feedUrl: '',
  apiUrl: '',
  websiteUrl: '',
  category: 'general',
  language: 'en',
  keywords: '',
  isActive: true,
});

const listToText = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');

const GovernmentNotificationsAdmin = () => {
  const [tab, setTab] = useState('notifications');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [config, setConfig] = useState(null);
  const [counts, setCounts] = useState({});
  const [meta, setMeta] = useState({ categories: [], levels: [], statuses: [] });
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [selected, setSelected] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [sources, setSources] = useState([]);
  const [settings, setSettings] = useState({
    keywords: '',
    autoFetchEnabled: false,
    autoPublish: false,
    refreshIntervalMinutes: 60,
    maxItemsPerFetch: 30,
    showLatestWidget: true,
    showAlertsWidget: true,
    showOnHomepage: true,
    latestWidgetTitle: 'Latest Government Notifications',
    latestWidgetTitleTa: 'அரசு அறிவிப்புகள்',
    alertsWidgetTitle: 'Important Government Alerts',
    alertsWidgetTitleTa: 'முக்கிய அரசு எச்சரிக்கைகள்',
  });
  const [sourceForm, setSourceForm] = useState(null);

  const loadConfig = useCallback(async () => {
    const { data } = await governmentNotificationService.getConfig();
    setConfig(data.data);
    setCounts(data.counts || {});
    setMeta(data.meta || {});
    setSources(data.data.sources || []);
    setSettings({
      keywords: listToText(data.data.keywords),
      autoFetchEnabled: Boolean(data.data.autoFetchEnabled),
      autoPublish: Boolean(data.data.autoPublish),
      refreshIntervalMinutes: data.data.refreshIntervalMinutes || 60,
      maxItemsPerFetch: data.data.maxItemsPerFetch || 30,
      showLatestWidget: data.data.showLatestWidget !== false,
      showAlertsWidget: data.data.showAlertsWidget !== false,
      showOnHomepage: data.data.showOnHomepage !== false,
      latestWidgetTitle: data.data.latestWidgetTitle || 'Latest Government Notifications',
      latestWidgetTitleTa: data.data.latestWidgetTitleTa || 'அரசு அறிவிப்புகள்',
      alertsWidgetTitle: data.data.alertsWidgetTitle || 'Important Government Alerts',
      alertsWidgetTitleTa: data.data.alertsWidgetTitleTa || 'முக்கிய அரசு எச்சரிக்கைகள்',
    });
  }, []);

  const loadNotifications = useCallback(async () => {
    const { data } = await governmentNotificationService.getNotifications({
      status: filterStatus,
      level: filterLevel === 'all' ? undefined : filterLevel,
      category: filterCategory === 'all' ? undefined : filterCategory,
      q: searchQ || undefined,
      page,
      limit: 20,
    });
    setItems(data.data || []);
    setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    setSelected([]);
  }, [filterStatus, filterLevel, filterCategory, searchQ, page]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await loadConfig();
      if (tab === 'notifications') await loadNotifications();
    } catch {
      toast.error('Failed to load government notifications');
    } finally {
      setLoading(false);
    }
  }, [loadConfig, loadNotifications, tab]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (tab === 'notifications') {
      loadNotifications().catch(() => toast.error('Failed to load list'));
    }
  }, [tab, filterStatus, filterLevel, filterCategory, page, loadNotifications]);

  const handleFetch = async () => {
    setFetching(true);
    try {
      const { data } = await governmentNotificationService.fetchNow();
      toast.success(data.message || 'Fetch complete');
      await loadConfig();
      setTab('notifications');
      setFilterStatus('pending');
      setPage(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Fetch failed — check official feed URLs');
    } finally {
      setFetching(false);
    }
  };

  const handleSaveSettings = async () => {
    const mins = Number(settings.refreshIntervalMinutes);
    if (Number.isNaN(mins) || mins < 15 || mins > 1440) {
      toast.error('Refresh interval must be 15–1440 minutes');
      return;
    }
    setSaving(true);
    try {
      const { data } = await governmentNotificationService.updateConfig({
        sources,
        keywords: settings.keywords,
        autoFetchEnabled: settings.autoFetchEnabled,
        autoPublish: settings.autoPublish,
        refreshIntervalMinutes: mins,
        maxItemsPerFetch: Number(settings.maxItemsPerFetch),
        showLatestWidget: settings.showLatestWidget,
        showAlertsWidget: settings.showAlertsWidget,
        showOnHomepage: settings.showOnHomepage,
        latestWidgetTitle: settings.latestWidgetTitle,
        latestWidgetTitleTa: settings.latestWidgetTitleTa,
        alertsWidgetTitle: settings.alertsWidgetTitle,
        alertsWidgetTitleTa: settings.alertsWidgetTitleTa,
      });
      setConfig(data.data);
      setSources(data.data.sources || []);
      toast.success(data.message || 'Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const saveSourceForm = () => {
    if (!sourceForm?.name?.trim()) {
      toast.error('Source name is required');
      return;
    }
    if (!sourceForm.feedUrl?.trim() && !sourceForm.apiUrl?.trim()) {
      toast.error('Provide an official RSS feed URL or API URL');
      return;
    }
    const payload = {
      ...sourceForm,
      keywords: typeof sourceForm.keywords === 'string'
        ? sourceForm.keywords.split(/[\n,]+/).map((k) => k.trim()).filter(Boolean)
        : sourceForm.keywords || [],
    };
    if (sourceForm._editIndex != null) {
      setSources((prev) => prev.map((s, i) => (i === sourceForm._editIndex ? { ...s, ...payload } : s)));
    } else {
      setSources((prev) => [...prev, payload]);
    }
    setSourceForm(null);
    toast.success('Source added to list — click Save settings to persist');
  };

  const handleBulk = async (status) => {
    if (!selected.length) {
      toast.error('Select at least one notification');
      return;
    }
    try {
      const { data } = await governmentNotificationService.bulkStatus(selected, status);
      toast.success(data.message || 'Updated');
      setSelected([]);
      await loadConfig();
      await loadNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk update failed');
    }
  };

  const handlePublishAll = async () => {
    const pending = counts.byStatus?.pending || 0;
    const approved = counts.byStatus?.approved || 0;
    const total = pending + approved;
    if (!total) {
      toast('Nothing to publish — all items are already published or inactive');
      return;
    }
    if (!window.confirm(`Publish ${total} pending/approved notification(s) to the website?`)) return;
    try {
      const { data } = await governmentNotificationService.publishAll();
      toast.success(data.message || 'Published to website');
      setSelected([]);
      await loadConfig();
      await loadNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Publish all failed');
    }
  };

  const handleBulkRemove = async () => {
    if (!selected.length) {
      toast.error('Select at least one notification');
      return;
    }
    if (!window.confirm(`Permanently remove ${selected.length} notification(s)?`)) return;
    try {
      const { data } = await governmentNotificationService.bulkDelete(selected);
      toast.success(data.message || 'Removed');
      setSelected([]);
      if (editItem && selected.includes(editItem._id)) setEditItem(null);
      await loadConfig();
      await loadNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Remove failed');
    }
  };

  const handleSaveEdit = async () => {
    if (!editItem?._id) return;
    if (!editItem.title?.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      await governmentNotificationService.updateNotification(editItem._id, editItem);
      toast.success('Notification updated');
      setEditItem(null);
      await loadNotifications();
      await loadConfig();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (id, status) => {
    try {
      await governmentNotificationService.updateNotification(id, { status });
      toast.success(`Marked ${status}`);
      await loadNotifications();
      await loadConfig();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this notification permanently?')) return;
    try {
      await governmentNotificationService.deleteNotification(id);
      toast.success('Removed');
      if (editItem?._id === id) setEditItem(null);
      setSelected((prev) => prev.filter((x) => x !== id));
      await loadNotifications();
      await loadConfig();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Remove failed');
    }
  };

  const removeSource = (idx) => {
    const name = sources[idx]?.name || 'this source';
    if (!window.confirm(`Remove source “${name}” from the list?`)) return;
    setSources((prev) => prev.filter((_, i) => i !== idx));
    if (sourceForm?._editIndex === idx) setSourceForm(null);
    toast.success('Source removed from list — click Save sources & settings');
  };

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
        title="Government Notifications"
        subtitle="Official Central & Tamil Nadu government feeds — review, approve, and publish."
      >
        <button
          type="button"
          onClick={handlePublishAll}
          className="btn-secondary text-sm py-2.5 px-4 w-full sm:w-auto"
        >
          Publish all to website
        </button>
        <button
          type="button"
          onClick={handleFetch}
          disabled={fetching}
          className="btn-primary text-sm py-2.5 px-4 w-full sm:w-auto disabled:opacity-50"
        >
          {fetching ? 'Fetching…' : 'Fetch Now'}
        </button>
      </AdminPageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Pending', value: counts.byStatus?.pending || 0, bg: 'bg-amber-50', color: 'text-amber-700' },
          { label: 'Published', value: counts.byStatus?.published || 0, bg: 'bg-emerald-50', color: 'text-emerald-700' },
          { label: 'Central', value: counts.byLevel?.central || 0, bg: 'bg-sky-50', color: 'text-sky-700' },
          { label: 'Tamil Nadu', value: counts.byLevel?.tamil_nadu || 0, bg: 'bg-teal-50', color: 'text-teal-700' },
          { label: 'Total', value: counts.total || 0, bg: 'bg-slate-50', color: 'text-slate-800' },
        ].map((s) => (
          <div key={s.label} className={`admin-stat-card ${s.bg}`}>
            <p className="text-xs text-slate-500 uppercase">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {config?.lastFetchAt && (
        <p className={`text-sm mb-4 px-1 ${config.lastFetchStatus === 'error' ? 'text-rose-600' : 'text-slate-500'}`}>
          Last fetch: {new Date(config.lastFetchAt).toLocaleString()}
          {config.lastFetchCount != null ? ` · ${config.lastFetchCount} new` : ''}
          {config.lastFetchError ? ` · ${config.lastFetchError}` : ''}
        </p>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {[
          { key: 'notifications', label: 'Notifications' },
          { key: 'sources', label: 'Sources' },
          { key: 'settings', label: 'Settings & Widgets' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-3.5 py-2 rounded-lg text-sm font-medium ${
              tab === t.key ? 'admin-tab admin-tab-active' : 'admin-tab'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {['pending', 'approved', 'published', 'rejected', 'disabled', 'all'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setFilterStatus(s); setPage(1); }}
                  className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg capitalize ${
                    filterStatus === s ? 'admin-tab admin-tab-active' : 'admin-tab'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterLevel}
                onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}
                className="admin-input text-sm py-2 w-auto"
              >
                <option value="all">All levels</option>
                {Object.entries(LEVEL_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                className="admin-input text-sm py-2 w-auto"
              >
                <option value="all">All categories</option>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <form
                onSubmit={(e) => { e.preventDefault(); setPage(1); loadNotifications(); }}
                className="flex gap-2"
              >
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search…"
                  className="admin-input text-sm py-2 w-36 sm:w-48"
                />
                <button type="submit" className="btn-secondary text-sm shrink-0">Search</button>
              </form>
            </div>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-sm text-slate-600">{selected.length} selected</span>
              <button type="button" onClick={() => handleBulk('published')} className="btn-primary text-xs py-1.5 px-3">Publish</button>
              <button type="button" onClick={() => handleBulk('approved')} className="btn-secondary text-xs py-1.5 px-3">Approve</button>
              <button type="button" onClick={() => handleBulk('rejected')} className="btn-secondary text-xs py-1.5 px-3">Reject</button>
              <button type="button" onClick={() => handleBulk('disabled')} className="btn-secondary text-xs py-1.5 px-3">Disable</button>
              <button
                type="button"
                onClick={handleBulkRemove}
                className="text-xs font-medium py-1.5 px-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200"
              >
                Remove
              </button>
            </div>
          )}

          {editItem && (
            <div className="admin-card space-y-3 max-w-3xl">
              <div className="flex justify-between gap-2">
                <h2 className="font-semibold text-slate-900">Edit notification</h2>
                <button type="button" onClick={() => setEditItem(null)} className="text-xs text-slate-500">Close</button>
              </div>
              <input className="admin-input" value={editItem.title} onChange={(e) => setEditItem({ ...editItem, title: e.target.value })} placeholder="Title (EN)" />
              <input className="admin-input" value={editItem.titleTamil || ''} onChange={(e) => setEditItem({ ...editItem, titleTamil: e.target.value })} placeholder="Title (Tamil)" />
              <textarea className="admin-input" rows={3} value={editItem.summary || ''} onChange={(e) => setEditItem({ ...editItem, summary: e.target.value })} placeholder="Summary (EN)" />
              <textarea className="admin-input" rows={2} value={editItem.summaryTamil || ''} onChange={(e) => setEditItem({ ...editItem, summaryTamil: e.target.value })} placeholder="Summary (Tamil)" />
              <div className="grid sm:grid-cols-2 gap-3">
                <select className="admin-input" value={editItem.category} onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select className="admin-input" value={editItem.level} onChange={(e) => setEditItem({ ...editItem, level: e.target.value })}>
                  {Object.entries(LEVEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <input className="admin-input" value={editItem.department || ''} onChange={(e) => setEditItem({ ...editItem, department: e.target.value })} placeholder="Department" />
                <select className="admin-input" value={editItem.language || 'en'} onChange={(e) => setEditItem({ ...editItem, language: e.target.value })}>
                  <option value="en">English</option>
                  <option value="ta">Tamil</option>
                  <option value="both">Both</option>
                </select>
                <input className="admin-input" value={editItem.officialUrl || ''} onChange={(e) => setEditItem({ ...editItem, officialUrl: e.target.value })} placeholder="Official URL" />
                <select className="admin-input" value={editItem.status} onChange={(e) => setEditItem({ ...editItem, status: e.target.value })}>
                  {(meta.statuses || Object.keys(STATUS_STYLES)).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={Boolean(editItem.isImportant)} onChange={(e) => setEditItem({ ...editItem, isImportant: e.target.checked })} className="rounded border-slate-300" />
                Important alert
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={saving} onClick={handleSaveEdit} className="btn-primary disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setStatus(editItem._id, 'published')} className="btn-secondary">Publish</button>
                <button
                  type="button"
                  onClick={() => handleDelete(editItem._id)}
                  className="text-sm font-medium px-3 py-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div className="admin-card text-center py-14 text-slate-500">
              <p className="font-medium text-slate-700 mb-1">No notifications found</p>
              <p className="text-sm mb-4">Add official RSS/API sources, then click Fetch Now.</p>
              <button type="button" onClick={handleFetch} disabled={fetching} className="btn-primary text-sm">
                {fetching ? 'Fetching…' : 'Fetch Now'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs text-slate-500 px-1">
                <input
                  type="checkbox"
                  checked={selected.length === items.length && items.length > 0}
                  onChange={() => setSelected(selected.length === items.length ? [] : items.map((i) => i._id))}
                  className="rounded border-slate-300"
                />
                Select all on page ({pagination.total} total)
              </label>
              {items.map((item) => (
                <div key={item._id} className="admin-card !p-3 sm:!p-4 flex gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-slate-300 shrink-0"
                    checked={selected.includes(item._id)}
                    onChange={() =>
                      setSelected((prev) =>
                        prev.includes(item._id) ? prev.filter((x) => x !== item._id) : [...prev, item._id]
                      )
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_STYLES[item.status] || STATUS_STYLES.pending}`}>
                        {item.status}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-teal-700">
                        {LEVEL_LABELS[item.level] || item.level}
                      </span>
                      <span className="text-[10px] text-slate-400">{CATEGORY_LABELS[item.category] || item.category}</span>
                      {item.isImportant && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">Alert</span>
                      )}
                    </div>
                    <p className="font-medium text-slate-900 line-clamp-2">{item.title}</p>
                    {item.titleTamil && <p className="text-sm text-slate-600 line-clamp-1 mt-0.5">{item.titleTamil}</p>}
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.summary}</p>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      {item.department || item.sourceName || 'Source'}
                      {item.publishedAt ? ` · ${new Date(item.publishedAt).toLocaleString()}` : ''}
                      {item.lastUpdatedAt ? ` · Updated ${new Date(item.lastUpdatedAt).toLocaleString()}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      <button type="button" onClick={() => setEditItem({ ...item })} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700">Edit</button>
                      <button type="button" onClick={() => setStatus(item._id, 'published')} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">Publish</button>
                      <button type="button" onClick={() => setStatus(item._id, 'approved')} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700">Approve</button>
                      <button type="button" onClick={() => setStatus(item._id, 'rejected')} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">Reject</button>
                      {item.officialUrl && (
                        <a href={item.officialUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600">
                          Official source
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-sm disabled:opacity-50">Previous</button>
                  <span className="text-sm text-slate-500 self-center">{page} / {pagination.pages}</span>
                  <button type="button" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="btn-secondary text-sm disabled:opacity-50">Next</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'sources' && (
        <div className="space-y-4 max-w-3xl">
          <div className="admin-card space-y-3">
            <p className="text-sm text-slate-500">
              Use only official government RSS feeds or public APIs. Do not add login-walled or scraped URLs.
            </p>
            <button type="button" onClick={() => setSourceForm(emptySource())} className="btn-primary text-sm">
              Add source
            </button>
          </div>

          {sourceForm && (
            <div className="admin-card space-y-3">
              <h2 className="font-semibold text-slate-900">
                {sourceForm._editIndex != null ? 'Edit source' : 'New source'}
              </h2>
              <input className="admin-input" value={sourceForm.name} onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })} placeholder="Source name *" />
              <div className="grid sm:grid-cols-2 gap-3">
                <select className="admin-input" value={sourceForm.level} onChange={(e) => setSourceForm({ ...sourceForm, level: e.target.value })}>
                  {Object.entries(LEVEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select className="admin-input" value={sourceForm.category} onChange={(e) => setSourceForm({ ...sourceForm, category: e.target.value })}>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <input className="admin-input" value={sourceForm.department} onChange={(e) => setSourceForm({ ...sourceForm, department: e.target.value })} placeholder="Department" />
                <select className="admin-input" value={sourceForm.language} onChange={(e) => setSourceForm({ ...sourceForm, language: e.target.value })}>
                  <option value="en">English</option>
                  <option value="ta">Tamil</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <input className="admin-input font-mono text-xs" value={sourceForm.feedUrl} onChange={(e) => setSourceForm({ ...sourceForm, feedUrl: e.target.value })} placeholder="Official RSS feed URL" />
              <input className="admin-input font-mono text-xs" value={sourceForm.apiUrl} onChange={(e) => setSourceForm({ ...sourceForm, apiUrl: e.target.value })} placeholder="Official JSON API URL (optional)" />
              <input className="admin-input" value={sourceForm.websiteUrl} onChange={(e) => setSourceForm({ ...sourceForm, websiteUrl: e.target.value })} placeholder="Department website" />
              <textarea className="admin-input" rows={2} value={typeof sourceForm.keywords === 'string' ? sourceForm.keywords : listToText(sourceForm.keywords)} onChange={(e) => setSourceForm({ ...sourceForm, keywords: e.target.value })} placeholder="Keywords (optional, one per line)" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={sourceForm.isActive !== false} onChange={(e) => setSourceForm({ ...sourceForm, isActive: e.target.checked })} className="rounded border-slate-300" />
                Active
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={saveSourceForm} className="btn-primary text-sm">Add to list</button>
                <button type="button" onClick={() => setSourceForm(null)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </div>
          )}

          {sources.map((s, idx) => (
            <div key={s._id || idx} className="admin-card !p-4 flex flex-col sm:flex-row gap-3 sm:items-start">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <StatusBadge active={s.isActive !== false} />
                  <span className="text-[10px] uppercase font-semibold text-teal-700">{LEVEL_LABELS[s.level] || s.level}</span>
                </div>
                <p className="font-medium text-slate-900">{s.name}</p>
                <p className="text-xs text-slate-500">{s.department}</p>
                <p className="text-[11px] font-mono text-slate-400 mt-1 truncate">{s.feedUrl || s.apiUrl || 'No feed URL'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSourceForm({
                    ...s,
                    keywords: listToText(s.keywords),
                    _editIndex: idx,
                  })}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setSources((prev) => prev.map((x, i) => (i === idx ? { ...x, isActive: !x.isActive } : x)))}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600"
                >
                  {s.isActive !== false ? 'Disable' : 'Enable'}
                </button>
                <button
                  type="button"
                  onClick={() => removeSource(idx)}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button type="button" disabled={saving} onClick={handleSaveSettings} className="btn-primary disabled:opacity-50">
            {saving ? 'Saving…' : 'Save sources & settings'}
          </button>
        </div>
      )}

      {tab === 'settings' && (
        <div className="admin-card space-y-4 max-w-2xl">
          <h2 className="font-semibold text-slate-900">Fetch & widgets</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Refresh interval (minutes)</label>
              <input type="number" min={15} max={1440} className="admin-input" value={settings.refreshIntervalMinutes} onChange={(e) => setSettings({ ...settings, refreshIntervalMinutes: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Max items per fetch</label>
              <input type="number" min={5} max={100} className="admin-input" value={settings.maxItemsPerFetch} onChange={(e) => setSettings({ ...settings, maxItemsPerFetch: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Global keywords</label>
            <textarea className="admin-input" rows={2} value={settings.keywords} onChange={(e) => setSettings({ ...settings, keywords: e.target.value })} placeholder="scheme&#10;tender&#10;job" />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 text-sm"><input type="checkbox" checked={settings.autoFetchEnabled} onChange={(e) => setSettings({ ...settings, autoFetchEnabled: e.target.checked })} className="rounded border-slate-300" /> Automatic fetching</label>
            <label className="flex items-center gap-2.5 text-sm"><input type="checkbox" checked={settings.autoPublish} onChange={(e) => setSettings({ ...settings, autoPublish: e.target.checked })} className="rounded border-slate-300" /> Auto-publish (skip review)</label>
            <label className="flex items-center gap-2.5 text-sm"><input type="checkbox" checked={settings.showOnHomepage} onChange={(e) => setSettings({ ...settings, showOnHomepage: e.target.checked })} className="rounded border-slate-300" /> Show on homepage</label>
            <label className="flex items-center gap-2.5 text-sm"><input type="checkbox" checked={settings.showLatestWidget} onChange={(e) => setSettings({ ...settings, showLatestWidget: e.target.checked })} className="rounded border-slate-300" /> Latest Government Notifications widget</label>
            <label className="flex items-center gap-2.5 text-sm"><input type="checkbox" checked={settings.showAlertsWidget} onChange={(e) => setSettings({ ...settings, showAlertsWidget: e.target.checked })} className="rounded border-slate-300" /> Important Government Alerts widget</label>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="admin-input" value={settings.latestWidgetTitle} onChange={(e) => setSettings({ ...settings, latestWidgetTitle: e.target.value })} placeholder="Latest widget title (EN)" />
            <input className="admin-input" value={settings.latestWidgetTitleTa} onChange={(e) => setSettings({ ...settings, latestWidgetTitleTa: e.target.value })} placeholder="Latest widget title (TA)" />
            <input className="admin-input" value={settings.alertsWidgetTitle} onChange={(e) => setSettings({ ...settings, alertsWidgetTitle: e.target.value })} placeholder="Alerts widget title (EN)" />
            <input className="admin-input" value={settings.alertsWidgetTitleTa} onChange={(e) => setSettings({ ...settings, alertsWidgetTitleTa: e.target.value })} placeholder="Alerts widget title (TA)" />
          </div>
          <button type="button" disabled={saving} onClick={handleSaveSettings} className="btn-primary disabled:opacity-50">
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      )}
    </div>
  );
};

export default GovernmentNotificationsAdmin;
