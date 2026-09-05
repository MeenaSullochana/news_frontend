import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adSenseService, categoryService } from '../services/articleService';
import AdminPageHeader, { StatusBadge } from './AdminPageHeader';

const emptyForm = {
  name: '',
  location: 'header',
  customLocation: '',
  publisherId: '',
  adSlotId: '',
  adFormat: 'auto',
  sizeMode: 'responsive',
  width: 336,
  height: 280,
  isActive: true,
  pages: ['all'],
  categories: [],
  priority: 0,
  notes: '',
};

const LOCATION_LABELS = {
  header: 'Header',
  homepage: 'Homepage',
  homepage_top: 'Homepage Top',
  homepage_middle: 'Homepage Middle',
  article_top: 'Article Top',
  article_middle: 'Article Middle',
  article_bottom: 'Article Bottom',
  sidebar: 'Sidebar',
  footer: 'Footer',
  top_banner: 'Top Banner',
  mobile_sticky: 'Mobile Sticky',
  custom: 'Custom',
};

const PAGE_OPTIONS = [
  { value: 'all', label: 'All pages' },
  { value: 'home', label: 'Home' },
  { value: 'article', label: 'Article' },
  { value: 'category', label: 'Category' },
  { value: 'explore', label: 'Explore' },
  { value: 'search', label: 'Search' },
  { value: 'author', label: 'Author' },
  { value: 'static', label: 'Static pages' },
];

const AdSenseAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [placements, setPlacements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ locations: [], formats: [] });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, metaRes, catRes] = await Promise.all([
        adSenseService.getAll(),
        adSenseService.getMeta(),
        categoryService.getAll({ districts: 'false' }).catch(() => ({ data: { data: [] } })),
      ]);
      setPlacements(listRes.data.data || []);
      setMeta(metaRes.data.data || { locations: [], formats: [] });
      setCategories(catRes.data.data || []);
    } catch {
      toast.error('Failed to load AdSense placements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      publisherId: placements[0]?.publisherId || '',
    });
    setShowForm(true);
    setPreview(null);
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || '',
      location: item.location || 'header',
      customLocation: item.customLocation || '',
      publisherId: item.publisherId || '',
      adSlotId: item.adSlotId || '',
      adFormat: item.adFormat || 'auto',
      sizeMode: item.sizeMode || 'responsive',
      width: item.width || 336,
      height: item.height || 280,
      isActive: item.isActive !== false,
      pages: item.pages?.length ? item.pages : ['all'],
      categories: item.categories || [],
      priority: item.priority || 0,
      notes: item.notes || '',
    });
    setShowForm(true);
    setPreview(null);
  };

  const validateClient = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!/^ca-pub-\d{10,20}$/i.test(form.publisherId.trim())) {
      return 'Publisher ID must look like ca-pub-xxxxxxxxxxxxxxxx';
    }
    if (!/^\d{5,20}$/.test(form.adSlotId.trim())) {
      return 'Ad Slot ID must be numeric';
    }
    if (form.location === 'custom' && !form.customLocation.trim()) {
      return 'Custom location key is required';
    }
    if (!form.pages?.length) return 'Select at least one page';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateClient();
    if (err) {
      toast.error(err);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        publisherId: form.publisherId.trim(),
        adSlotId: form.adSlotId.trim(),
        customLocation: form.location === 'custom' ? form.customLocation.trim().toLowerCase() : '',
        pages: form.pages.includes('all') ? ['all'] : form.pages,
      };
      if (editingId) {
        const { data } = await adSenseService.update(editingId, payload);
        toast.success(data.message || 'Placement updated');
      } else {
        const { data } = await adSenseService.create(payload);
        toast.success(data.message || 'Placement created');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      const { data } = await adSenseService.toggle(item._id, !item.isActive);
      toast.success(data.message || 'Updated');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Toggle failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this AdSense placement?')) return;
    try {
      await adSenseService.delete(id);
      toast.success('Placement deleted');
      if (preview?._id === id) setPreview(null);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const togglePage = (page) => {
    setForm((prev) => {
      if (page === 'all') return { ...prev, pages: ['all'] };
      const withoutAll = prev.pages.filter((p) => p !== 'all');
      const next = withoutAll.includes(page)
        ? withoutAll.filter((p) => p !== page)
        : [...withoutAll, page];
      return { ...prev, pages: next.length ? next : ['all'] };
    });
  };

  const toggleCategory = (slug) => {
    setForm((prev) => {
      const next = prev.categories.includes(slug)
        ? prev.categories.filter((c) => c !== slug)
        : [...prev.categories, slug];
      return { ...prev, categories: next };
    });
  };

  const filtered = placements.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'active') return p.isActive;
    if (filter === 'inactive') return !p.isActive;
    return p.location === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="AdSense Ad Placement"
        subtitle="Manage Google AdSense units by location, format, and page targeting."
        actionLabel={showForm ? undefined : 'Add Placement'}
        onAction={showForm ? undefined : openCreate}
      >
        {showForm && (
          <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary text-sm">
            Cancel
          </button>
        )}
      </AdminPageHeader>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="admin-stat-card">
          <p className="text-xs text-slate-500 uppercase">Total</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{placements.length}</p>
        </div>
        <div className="admin-stat-card bg-emerald-50">
          <p className="text-xs text-slate-500 uppercase">Active</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {placements.filter((p) => p.isActive).length}
          </p>
        </div>
        <div className="admin-stat-card bg-slate-50">
          <p className="text-xs text-slate-500 uppercase">Disabled</p>
          <p className="text-2xl font-bold text-slate-600 mt-1">
            {placements.filter((p) => !p.isActive).length}
          </p>
        </div>
        <div className="admin-stat-card bg-brand-50">
          <p className="text-xs text-slate-500 uppercase">Locations</p>
          <p className="text-2xl font-bold text-brand-700 mt-1">
            {new Set(placements.map((p) => p.location)).size}
          </p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card space-y-4 mb-6 max-w-3xl">
          <h2 className="font-semibold text-slate-900">
            {editingId ? 'Edit placement' : 'New AdSense placement'}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
              <input
                className="admin-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Homepage banner"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Placement *</label>
              <select
                className="admin-input"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              >
                {(meta.locations?.length ? meta.locations : Object.keys(LOCATION_LABELS)).map((loc) => (
                  <option key={loc} value={loc}>
                    {LOCATION_LABELS[loc] || loc}
                  </option>
                ))}
              </select>
            </div>
            {form.location === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Custom location key *</label>
                <input
                  className="admin-input"
                  value={form.customLocation}
                  onChange={(e) => setForm({ ...form, customLocation: e.target.value })}
                  placeholder="e.g. explore_top"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Publisher ID *</label>
              <input
                className="admin-input font-mono text-xs sm:text-sm"
                value={form.publisherId}
                onChange={(e) => setForm({ ...form, publisherId: e.target.value })}
                placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ad Slot ID *</label>
              <input
                className="admin-input font-mono text-xs sm:text-sm"
                value={form.adSlotId}
                onChange={(e) => setForm({ ...form, adSlotId: e.target.value })}
                placeholder="1234567890"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ad format</label>
              <select
                className="admin-input"
                value={form.adFormat}
                onChange={(e) => setForm({ ...form, adFormat: e.target.value })}
              >
                {(meta.formats?.length ? meta.formats : ['auto', 'fluid', 'rectangle', 'horizontal', 'vertical']).map(
                  (f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Size mode</label>
              <select
                className="admin-input"
                value={form.sizeMode}
                onChange={(e) => setForm({ ...form, sizeMode: e.target.value })}
              >
                <option value="responsive">Responsive</option>
                <option value="fixed">Fixed size</option>
              </select>
            </div>
            {form.sizeMode === 'fixed' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Width (px)</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={form.width}
                    onChange={(e) => setForm({ ...form, width: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Height (px)</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
              <input
                type="number"
                className="admin-input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Show on pages</label>
            <div className="flex flex-wrap gap-2">
              {PAGE_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePage(p.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                    form.pages.includes(p.value)
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
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Categories <span className="text-slate-400 font-normal">(empty = all)</span>
            </label>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
              {categories.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => toggleCategory(c.slug)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                    form.categories.includes(c.slug)
                      ? 'bg-teal-50 text-teal-800 border-teal-200'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {c.nameTamil || c.name}
                </button>
              ))}
              {!categories.length && (
                <p className="text-xs text-slate-400">No categories loaded</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <input
              className="admin-input"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional internal note"
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded border-slate-300 text-brand-600"
            />
            Enabled
          </label>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Saving…' : editingId ? 'Update placement' : 'Create placement'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setPreview({ ...form, _id: editingId || 'preview' })}
            >
              Preview
            </button>
          </div>
        </form>
      )}

      {preview && (
        <div className="admin-card mb-6 max-w-3xl space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-slate-900">Placement preview</h2>
            <button type="button" onClick={() => setPreview(null)} className="text-xs text-slate-500 hover:text-slate-800">
              Close
            </button>
          </div>
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">Advertisement</p>
            <div
              className="mx-auto bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm"
              style={
                preview.sizeMode === 'fixed'
                  ? { width: Math.min(preview.width || 336, 100) + '%', maxWidth: preview.width || 336, height: preview.height || 280 }
                  : { width: '100%', minHeight: 90 }
              }
            >
              <div className="px-4 py-6">
                <p className="font-medium text-slate-600">{preview.name || 'Ad unit'}</p>
                <p className="text-xs font-mono mt-1 text-slate-400">{preview.publisherId}</p>
                <p className="text-xs font-mono text-slate-400">slot: {preview.adSlotId}</p>
                <p className="text-xs mt-2 text-slate-500">
                  {LOCATION_LABELS[preview.location] || preview.location}
                  {preview.location === 'custom' && preview.customLocation ? ` / ${preview.customLocation}` : ''}
                  {' · '}
                  {preview.adFormat} · {preview.sizeMode}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Live AdSense creatives appear on the public site after the unit is approved by Google.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {['all', 'active', 'inactive', 'header', 'homepage', 'article_top', 'sidebar', 'footer', 'custom'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg capitalize ${
              filter === f ? 'admin-tab admin-tab-active' : 'admin-tab'
            }`}
          >
            {LOCATION_LABELS[f] || f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="admin-card text-center py-14 text-slate-500">
          <p className="font-medium text-slate-700 mb-1">No AdSense placements yet</p>
          <p className="text-sm mb-4">Add a placement with your Publisher ID and Ad Slot ID.</p>
          <button type="button" onClick={openCreate} className="btn-primary text-sm">
            Add Placement
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item._id} className="admin-card !p-3 sm:!p-4 flex flex-col sm:flex-row gap-3 sm:items-start">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <StatusBadge active={item.isActive} />
                  <span className="text-[10px] uppercase tracking-wide font-semibold text-teal-700">
                    {LOCATION_LABELS[item.location] || item.location}
                    {item.location === 'custom' && item.customLocation ? ` · ${item.customLocation}` : ''}
                  </span>
                  <span className="text-[10px] text-slate-400">{item.adFormat} · {item.sizeMode}</span>
                </div>
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="text-xs font-mono text-slate-400 mt-0.5 truncate">
                  {item.publisherId} · slot {item.adSlotId}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Pages: {(item.pages || ['all']).join(', ')}
                  {item.categories?.length ? ` · Categories: ${item.categories.join(', ')}` : ' · All categories'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreview(item)}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle(item)}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600"
                >
                  {item.isActive ? 'Disable' : 'Enable'}
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
  );
};

export default AdSenseAdmin;
