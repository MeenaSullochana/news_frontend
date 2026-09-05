import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { youtubeService } from '../services/articleService';
import AdminPageHeader from './AdminPageHeader';

const emptyVideo = {
  title: '',
  description: '',
  thumbnail: '',
  youtubeUrl: '',
  displayOrder: 0,
  isActive: true,
};

const statusStyles = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  running: 'bg-amber-50 text-amber-700 border-amber-200',
  idle: 'bg-slate-50 text-slate-600 border-slate-200',
};

const YoutubeSliderAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [tab, setTab] = useState('videos');
  const [form, setForm] = useState(emptyVideo);
  const [editingId, setEditingId] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [channelForm, setChannelForm] = useState({
    channelUrl: '',
    name: '',
    sliderTitle: 'YouTube',
    sliderTitleTamil: 'யூடியூப்',
    maxVideos: 15,
    autoFetchEnabled: true,
    sliderEnabled: true,
    isActive: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await youtubeService.getAdmin();
      setChannel(data.data.channel);
      let list = data.data.videos || [];
      setVideos(list);
      const ch = data.data.channel;
      setChannelForm({
        channelUrl: ch.channelUrl || '',
        name: ch.name || '',
        sliderTitle: ch.sliderTitle || 'YouTube',
        sliderTitleTamil: ch.sliderTitleTamil || 'யூடியூப்',
        maxVideos: ch.maxVideos || 15,
        autoFetchEnabled: ch.autoFetchEnabled !== false,
        sliderEnabled: ch.sliderEnabled !== false,
        isActive: ch.isActive !== false,
      });

      // Auto-sync if channel is set but list is empty
      if ((ch.channelUrl || ch.channelId) && list.length === 0) {
        try {
          const syncRes = await youtubeService.syncNow();
          setChannel(syncRes.data.data.channel);
          list = syncRes.data.data.videos || [];
          setVideos(list);
          if (list.length) toast.success(`Loaded ${list.length} latest videos`);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Could not fetch videos — try Sync Now');
        }
      }
    } catch {
      toast.error('Failed to load YouTube slider');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveChannel = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await youtubeService.updateChannel({ ...channelForm, syncNow: true });
      setChannel(data.data);
      if (data.videos) setVideos(data.videos);
      else await load();
      if (data.syncError) toast.error(data.message || data.syncError);
      else toast.success(data.message || 'Channel settings saved');
      setTab('videos');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    if (!channelForm.channelUrl && !channel?.channelUrl) {
      toast.error('Set a YouTube channel URL first');
      setTab('settings');
      return;
    }
    setSyncing(true);
    try {
      const { data } = await youtubeService.syncNow();
      setChannel(data.data.channel);
      setVideos(data.data.videos || []);
      toast.success(data.message || 'Synced');
    } catch (err) {
      const msg = err.response?.data?.message || 'Sync failed';
      toast.error(msg);
      if (err.response?.data?.data?.channel) setChannel(err.response.data.data.channel);
      await load();
    } finally {
      setSyncing(false);
    }
  };

  const saveVideo = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await youtubeService.updateVideo(editingId, form);
        toast.success('Video updated');
      } else {
        await youtubeService.createVideo(form);
        toast.success('Video added');
      }
      setForm(emptyVideo);
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const moveVideo = async (index, dir) => {
    const next = [...videos];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setVideos(next);
    try {
      const { data } = await youtubeService.reorderVideos(next.map((v) => v._id));
      setVideos(data.data || next);
    } catch {
      toast.error('Reorder failed');
      load();
    }
  };

  if (loading) {
    return (
      <div>
        <AdminPageHeader title="YouTube Slider" subtitle="Channel sync & homepage carousel" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const fetchStatus = channel?.lastFetchStatus || 'idle';

  return (
    <div>
      <AdminPageHeader title="YouTube Slider" subtitle="Admin → Channel Settings → Auto Fetch → Videos → Homepage">
        <button type="button" onClick={handleSync} disabled={syncing} className="btn-primary text-sm py-2.5 px-4">
          {syncing ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Syncing…
            </span>
          ) : (
            'Fetch Now / Sync Now'
          )}
        </button>
      </AdminPageHeader>

      <div className="admin-card mb-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800">
            {channel?.channelTitle || channel?.name || 'Primary channel'}
            {channel?.channelHandle ? ` · ${channel.channelHandle}` : ''}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xl">{channel?.channelUrl || 'No channel URL configured'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyles[fetchStatus] || statusStyles.idle}`}>
            {fetchStatus}
          </span>
          <span className="text-xs text-slate-500">
            Last fetch:{' '}
            {channel?.lastFetchAt ? new Date(channel.lastFetchAt).toLocaleString() : 'Never'}
          </span>
        </div>
      </div>
      {channel?.lastFetchMessage && (
        <p className={`text-sm mb-4 px-1 ${fetchStatus === 'error' ? 'text-rose-600' : 'text-slate-500'}`}>
          {channel.lastFetchMessage}
        </p>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4">
        {[
          { key: 'videos', label: 'Video Management' },
          { key: 'settings', label: 'Channel Settings' },
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
        <form onSubmit={saveChannel} className="admin-card space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">YouTube Channel URL</label>
            <input
              className="admin-input"
              value={channelForm.channelUrl}
              onChange={(e) => setChannelForm({ ...channelForm, channelUrl: e.target.value })}
              placeholder="https://www.youtube.com/@YourChannel"
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              Supports @handle, /channel/UCxxxx. Auto-fetch uses YouTube RSS (no API key). Runs every 1 hour.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Internal name</label>
              <input className="admin-input" value={channelForm.name} onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Max videos (auto)</label>
              <input
                type="number"
                min={1}
                max={50}
                className="admin-input"
                value={channelForm.maxVideos}
                onChange={(e) => setChannelForm({ ...channelForm, maxVideos: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Slider title (EN)</label>
              <input className="admin-input" value={channelForm.sliderTitle} onChange={(e) => setChannelForm({ ...channelForm, sliderTitle: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Slider title (TA)</label>
              <input className="admin-input" value={channelForm.sliderTitleTamil} onChange={(e) => setChannelForm({ ...channelForm, sliderTitleTamil: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={channelForm.autoFetchEnabled} onChange={(e) => setChannelForm({ ...channelForm, autoFetchEnabled: e.target.checked })} />
            Auto-fetch every hour
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={channelForm.sliderEnabled} onChange={(e) => setChannelForm({ ...channelForm, sliderEnabled: e.target.checked })} />
            Show on homepage
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={channelForm.isActive} onChange={(e) => setChannelForm({ ...channelForm, isActive: e.target.checked })} />
            Channel active
          </label>
          {channel?.channelId && (
            <p className="text-xs text-slate-500 font-mono">Resolved ID: {channel.channelId}</p>
          )}
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save channel settings'}
          </button>
        </form>
      )}

      {tab === 'videos' && (
        <div className="grid lg:grid-cols-5 gap-6">
          <form onSubmit={saveVideo} className="lg:col-span-2 admin-card space-y-3 h-fit">
            <h2 className="font-semibold text-slate-900">{editingId ? 'Edit video' : 'Add video manually'}</h2>
            <input
              required
              className="admin-input"
              placeholder="YouTube URL"
              value={form.youtubeUrl}
              onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
            />
            <input
              required
              className="admin-input"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="admin-input"
              rows={3}
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              className="admin-input"
              placeholder="Thumbnail URL (optional)"
              value={form.thumbnail}
              onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active
            </label>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">{editingId ? 'Update' : 'Add'}</button>
              {editingId && (
                <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(emptyVideo); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="lg:col-span-3 space-y-3">
            <p className="text-sm text-slate-500">{videos.length} latest videos (newest first)</p>
            {videos.map((v, index) => (
              <div key={v._id} className="admin-card !p-3 flex gap-3 items-start">
                <button type="button" className="shrink-0 w-28 aspect-video rounded-lg overflow-hidden bg-slate-200 relative group" onClick={() => setPreviewId(v.videoId)}>
                  {v.thumbnail ? (
                    <img src={v.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No thumb</div>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-lg opacity-0 group-hover:opacity-100">▶</span>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 line-clamp-2">{v.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{v.youtubeUrl}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${v.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {v.isActive ? 'Active' : 'Disabled'}
                    </span>
                    {v.isManual && <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">Manual</span>}
                    {v.titleLocked && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Title locked</span>}
                    {v.publishedAt && (
                      <span className="text-[10px] text-slate-400">{new Date(v.publishedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button type="button" className="text-xs text-slate-600" onClick={() => moveVideo(index, -1)} disabled={index === 0}>↑</button>
                    <button type="button" className="text-xs text-slate-600" onClick={() => moveVideo(index, 1)} disabled={index === videos.length - 1}>↓</button>
                    <button
                      type="button"
                      className="text-xs text-teal-700"
                      onClick={() => {
                        setEditingId(v._id);
                        setForm({
                          title: v.title,
                          description: v.description || '',
                          thumbnail: v.thumbnail || '',
                          youtubeUrl: v.youtubeUrl,
                          displayOrder: v.displayOrder,
                          isActive: v.isActive,
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-xs text-slate-600"
                      onClick={async () => {
                        await youtubeService.updateVideo(v._id, { isActive: !v.isActive });
                        load();
                      }}
                    >
                      {v.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button type="button" className="text-xs text-sky-700" onClick={() => setPreviewId(v.videoId)}>Preview</button>
                    <button
                      type="button"
                      className="text-xs text-rose-600"
                      onClick={async () => {
                        if (!confirm('Delete this video?')) return;
                        await youtubeService.deleteVideo(v._id);
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
            {videos.length === 0 && (
              <div className="admin-card text-sm text-slate-500">
                No videos yet. Save a channel URL and click <strong>Fetch Now / Sync Now</strong>, or add a video manually.
              </div>
            )}
          </div>
        </div>
      )}

      {previewId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPreviewId(null)}>
          <div className="w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <iframe
              title="YouTube preview"
              src={`https://www.youtube.com/embed/${previewId}?autoplay=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default YoutubeSliderAdmin;
