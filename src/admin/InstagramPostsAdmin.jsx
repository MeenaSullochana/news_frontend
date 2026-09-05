import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { instagramPostService } from '../services/articleService';
import { getImageUrl } from '../utils/images';
import { useAuth } from '../context/AuthContext';
import AdminPageHeader from './AdminPageHeader';

const emptyEdit = {
  title: '',
  description: '',
  caption: '',
  category: '',
  image: '',
  status: 'published',
  isActive: true,
  displayOrder: 0,
  carouselImages: [],
  instagramUrl: '',
  mediaType: 'UNKNOWN',
  embedHtml: '',
  authorName: '',
  publishedAt: '',
};

const InstagramPostsAdmin = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [tab, setTab] = useState('import');
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [config, setConfig] = useState(null);
  const [tokenInput, setTokenInput] = useState('');
  const [url, setUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const [preview, setPreview] = useState(null);
  const [edit, setEdit] = useState(emptyEdit);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: list }, { data: cfg }] = await Promise.all([
        instagramPostService.getAll(),
        instagramPostService.getConfig(),
      ]);
      setPosts(list.data || []);
      setConfig(cfg.data);
    } catch {
      toast.error('Failed to load Instagram posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveConfig = async () => {
    try {
      const { data } = await instagramPostService.updateConfig({ accessToken: tokenInput });
      setConfig(data.data);
      setTokenInput('');
      toast.success('API settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Config save failed');
    }
  };

  const handleFetch = async (e) => {
    e?.preventDefault?.();
    if (!url.trim()) {
      toast.error('Paste an Instagram post URL');
      return;
    }
    setFetching(true);
    setPreview(null);
    try {
      const { data } = await instagramPostService.fetchPreview(url.trim());
      setPreview(data.data);
      setEdit({
        ...emptyEdit,
        title: data.data.title || '',
        description: data.data.description || '',
        caption: data.data.caption || '',
        image: data.data.image || data.data.thumbnailUrl || '',
        carouselImages: data.data.carouselImages || [],
        instagramUrl: data.data.instagramUrl,
        mediaType: data.data.mediaType || 'UNKNOWN',
        embedHtml: data.data.embedHtml || '',
        authorName: data.data.authorName || '',
        publishedAt: data.data.publishedAt ? String(data.data.publishedAt).slice(0, 16) : '',
        status: 'published',
        isActive: true,
      });
      setEditingId(data.data.existingId || null);
      if (data.data.alreadyImported) {
        toast(data.message || 'Already imported', { icon: 'ℹ️' });
      } else {
        toast.success('Preview loaded');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Fetch failed');
    } finally {
      setFetching(false);
    }
  };

  const approvePublish = async () => {
    if (!edit.instagramUrl && !url) {
      toast.error('Fetch a post first');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...edit,
        instagramUrl: edit.instagramUrl || url,
        publishedAt: edit.publishedAt || undefined,
      };
      if (editingId && preview?.alreadyImported) {
        await instagramPostService.update(editingId, payload);
        toast.success('Existing post updated');
      } else {
        await instagramPostService.create(payload);
        toast.success('Published to website');
      }
      setPreview(null);
      setEdit(emptyEdit);
      setUrl('');
      setEditingId(null);
      setTab('list');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Publish failed');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (post) => {
    setEditingId(post._id);
    setPreview({
      shortcode: post.shortcode,
      alreadyImported: true,
      enrichment: Boolean(post.graphMediaId),
    });
    setEdit({
      title: post.title || '',
      description: post.description || '',
      caption: post.caption || '',
      category: post.category || '',
      image: post.image || post.thumbnailUrl || '',
      status: post.status || 'published',
      isActive: post.isActive !== false,
      displayOrder: post.displayOrder || 0,
      carouselImages: post.carouselImages || [],
      instagramUrl: post.instagramUrl,
      mediaType: post.mediaType || 'UNKNOWN',
      embedHtml: post.embedHtml || '',
      authorName: post.authorName || '',
      publishedAt: post.publishedAt ? String(post.publishedAt).slice(0, 16) : '',
    });
    setUrl(post.instagramUrl);
    setTab('import');
  };

  const syncAll = async () => {
    setSyncing(true);
    try {
      const { data } = await instagramPostService.syncAll();
      setPosts(data.data || []);
      toast.success(data.message || 'Synced');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const movePost = async (index, dir) => {
    const next = [...posts];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setPosts(next);
    try {
      const { data } = await instagramPostService.reorder(next.map((p) => p._id));
      setPosts(data.data || next);
    } catch {
      toast.error('Reorder failed');
      load();
    }
  };

  if (loading) {
    return (
      <div>
        <AdminPageHeader title="Instagram Posts" subtitle="Import posts via Meta Instagram API" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader title="Instagram Posts" subtitle="Paste URL → Fetch → Preview → Edit → Publish">
        <button type="button" className="btn-primary text-sm py-2.5 px-4" disabled={syncing} onClick={syncAll}>
          {syncing ? 'Syncing…' : 'Import / Sync Now'}
        </button>
      </AdminPageHeader>

      <div className="admin-card mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-800">Meta API status</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Official Instagram oEmbed only — no page scraping.
            {config?.businessAccountConfigured ? ' Business account enrichment enabled.' : ''}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
            config?.configured
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {config?.configured ? `Token OK (${config.source}) ${config.maskedToken || ''}` : 'Token missing'}
        </span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4">
        {[
          { key: 'import', label: 'Import / Preview' },
          { key: 'list', label: 'Website listing' },
          { key: 'settings', label: 'API settings' },
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

      {tab === 'settings' && (
        <div className="admin-card space-y-3 max-w-xl">
          <p className="text-sm text-slate-600">
            Prefer <code className="text-xs bg-slate-100 px-1 rounded">INSTAGRAM_ACCESS_TOKEN</code> or{' '}
            <code className="text-xs bg-slate-100 px-1 rounded">META_APP_ID|META_APP_SECRET</code> in server env.
            Enable <strong>Instagram oEmbed Read</strong> on your Meta App.
          </p>
          {isSuperAdmin ? (
            <>
              <input
                type="password"
                autoComplete="new-password"
                className="admin-input font-mono text-sm"
                placeholder={config?.maskedToken || 'Access token'}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
              />
              <button type="button" className="btn-primary" onClick={saveConfig}>
                Save token
              </button>
            </>
          ) : (
            <p className="text-sm text-amber-700">Only Super Admin can change the API token.</p>
          )}
        </div>
      )}

      {tab === 'import' && (
        <div className="space-y-4 max-w-3xl">
          <form onSubmit={handleFetch} className="admin-card space-y-3">
            <label className="block text-sm font-medium text-slate-700">Instagram post URL</label>
            <input
              className="admin-input"
              placeholder="https://www.instagram.com/p/POST_ID/"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button type="submit" disabled={fetching} className="btn-primary">
              {fetching ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Fetching…
                </span>
              ) : (
                'Fetch'
              )}
            </button>
          </form>

          {preview && (
            <div className="admin-card space-y-4 border-teal-100">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-slate-900">Preview before publishing</h2>
                <div className="flex gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{edit.mediaType}</span>
                  {preview.alreadyImported && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Already imported</span>
                  )}
                  {preview.enrichment && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">Graph enriched</span>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl overflow-hidden bg-slate-100 aspect-square">
                  {edit.image ? (
                    <img src={getImageUrl(edit.image)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">No media preview</div>
                  )}
                </div>
                <div className="space-y-3">
                  <input className="admin-input" placeholder="Website title" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
                  <textarea className="admin-input" rows={2} placeholder="Description" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
                  <textarea className="admin-input" rows={2} placeholder="Caption" value={edit.caption} onChange={(e) => setEdit({ ...edit, caption: e.target.value })} />
                  <input className="admin-input" placeholder="Category" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} />
                  <input className="admin-input" placeholder="Image URL" value={edit.image} onChange={(e) => setEdit({ ...edit, image: e.target.value })} />
                  <select className="admin-input" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={edit.isActive} onChange={(e) => setEdit({ ...edit, isActive: e.target.checked })} />
                    Active on website
                  </label>
                  <p className="text-xs text-slate-400 break-all">
                    Linked to:{' '}
                    <a href={edit.instagramUrl} target="_blank" rel="noreferrer" className="text-teal-700 underline">
                      {edit.instagramUrl}
                    </a>
                  </p>
                </div>
              </div>

              {edit.carouselImages?.length > 1 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Carousel images ({edit.carouselImages.length})</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {edit.carouselImages.map((src) => (
                      <img key={src} src={getImageUrl(src)} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-primary" disabled={saving} onClick={approvePublish}>
                  {saving ? 'Saving…' : preview.alreadyImported ? 'Update & sync to website' : 'Approve / Publish'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => { setPreview(null); setEdit(emptyEdit); }}>
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'list' && (
        <div className="space-y-3">
          {posts.map((post, index) => (
            <div key={post._id} className="admin-card !p-3 flex gap-3 items-start">
              <img
                src={getImageUrl(post.image || post.thumbnailUrl, post.shortcode)}
                alt=""
                className="w-20 h-20 rounded-lg object-cover bg-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 line-clamp-1">{post.title || post.caption || post.shortcode}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{post.instagramUrl}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${post.status === 'published' && post.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {post.status}{!post.isActive ? ' · off' : ''}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{post.mediaType}</span>
                  {post.category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">{post.category}</span>}
                  <span className="text-[10px] text-slate-400">{post.lastSyncStatus}: {post.lastSyncMessage?.slice(0, 40) || '—'}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button type="button" className="text-xs text-slate-600" onClick={() => movePost(index, -1)} disabled={index === 0}>↑</button>
                  <button type="button" className="text-xs text-slate-600" onClick={() => movePost(index, 1)} disabled={index === posts.length - 1}>↓</button>
                  <button type="button" className="text-xs text-teal-700" onClick={() => openEdit(post)}>Edit</button>
                  <button
                    type="button"
                    className="text-xs text-sky-700"
                    onClick={async () => {
                      try {
                        await instagramPostService.syncPost(post._id);
                        toast.success('Synced');
                        load();
                      } catch (err) {
                        toast.error(err.response?.data?.message || 'Sync failed');
                        load();
                      }
                    }}
                  >
                    Sync
                  </button>
                  <button
                    type="button"
                    className="text-xs text-slate-600"
                    onClick={async () => {
                      await instagramPostService.update(post._id, {
                        isActive: !post.isActive,
                        status: !post.isActive ? 'published' : 'inactive',
                      });
                      load();
                    }}
                  >
                    {post.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <a href={post.instagramUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-600">Open IG</a>
                  <button
                    type="button"
                    className="text-xs text-rose-600"
                    onClick={async () => {
                      if (!confirm('Delete this imported post?')) return;
                      await instagramPostService.delete(post._id);
                      toast.success('Deleted');
                      load();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="admin-card text-sm text-slate-500">
              No imported posts yet. Paste a URL under <strong>Import / Preview</strong>.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstagramPostsAdmin;
