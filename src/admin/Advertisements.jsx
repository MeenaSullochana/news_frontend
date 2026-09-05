import { useCallback, useEffect, useMemo, useState } from 'react';
import { adService } from '../services/articleService';
import toast from 'react-hot-toast';
import AdminPageHeader, { StatusBadge } from './AdminPageHeader';
import DataTable from './DataTable';
import NewsImage from '../components/NewsImage';

const AD_POSITIONS = [
  'header', 'top_banner', 'homepage_top', 'homepage_middle',
  'sidebar', 'article_top', 'article_middle', 'article_bottom', 'footer', 'mobile_sticky',
];

const emptyForm = {
  title: '',
  position: 'sidebar',
  type: 'image',
  image: '',
  link: '',
  code: '',
  isActive: true,
  priority: 0,
};

const Advertisements = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAds = useCallback(() => {
    setLoading(true);
    adService
      .getAll()
      .then(({ data }) => setAds(data.data || []))
      .catch(() => toast.error('Failed to load advertisements'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (ad) => {
    setEditingId(ad._id);
    setForm({
      title: ad.title || '',
      position: ad.position || 'sidebar',
      type: ad.type || 'image',
      image: ad.image || '',
      link: ad.link || '',
      code: ad.code || '',
      isActive: ad.isActive !== false,
      priority: ad.priority ?? 0,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.type === 'image' && !form.image?.trim()) {
      toast.error('Image URL is required for image ads');
      return;
    }
    if (form.type === 'code' && !form.code?.trim()) {
      toast.error('HTML code is required for code ads');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        position: form.position,
        type: form.type,
        image: form.type === 'image' ? form.image.trim() : '',
        link: form.type === 'image' ? form.link.trim() : '',
        code: form.type === 'code' ? form.code : '',
        isActive: Boolean(form.isActive),
        priority: Number(form.priority) || 0,
      };

      if (editingId) {
        await adService.update(editingId, payload);
        toast.success('Advertisement updated');
      } else {
        await adService.create(payload);
        toast.success('Advertisement created');
      }
      resetForm();
      fetchAds();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (ad) => {
    try {
      await adService.update(ad._id, { isActive: !ad.isActive });
      toast.success(ad.isActive ? 'Ad disabled' : 'Ad enabled — will show on website');
      fetchAds();
    } catch {
      toast.error('Failed to update ad');
    }
  };

  const handleEnableAll = async () => {
    const inactive = ads.filter((a) => !a.isActive);
    if (!inactive.length) {
      toast.success('All ads are already active');
      return;
    }
    try {
      await Promise.all(inactive.map((ad) => adService.update(ad._id, { isActive: true })));
      toast.success(`Enabled ${inactive.length} ad(s) — refresh the website to see them`);
      fetchAds();
    } catch {
      toast.error('Failed to enable ads');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this advertisement?')) return;
    try {
      await adService.delete(id);
      toast.success('Deleted');
      if (editingId === id) resetForm();
      fetchAds();
    } catch {
      toast.error('Delete failed');
    }
  };

  const inactiveCount = ads.filter((a) => !a.isActive).length;

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title',
        sortable: true,
        render: (row) => (
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate">{row.title}</p>
            {row.type === 'image' && row.image && (
              <p className="text-[10px] text-slate-400 truncate max-w-[220px]">{row.image}</p>
            )}
          </div>
        ),
      },
      {
        key: 'position',
        header: 'Position',
        sortable: true,
        render: (row) => (
          <span className="capitalize text-slate-600 whitespace-nowrap">{row.position.replace(/_/g, ' ')}</span>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        sortable: true,
        render: (row) => <span className="uppercase text-xs font-semibold text-slate-500">{row.type}</span>,
      },
      {
        key: 'priority',
        header: 'Priority',
        sortable: true,
        sortValue: (row) => row.priority || 0,
      },
      {
        key: 'isActive',
        header: 'Status',
        sortable: true,
        sortValue: (row) => (row.isActive ? 1 : 0),
        render: (row) => <StatusBadge active={row.isActive} />,
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (row) => (
          <div className="data-table-actions">
            <button
              type="button"
              onClick={() => openEdit(row)}
              className="data-table-action data-table-action-secondary"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleToggle(row)}
              className="data-table-action data-table-action-secondary"
            >
              {row.isActive ? 'Disable' : 'Enable'}
            </button>
            <button
              type="button"
              onClick={() => handleDelete(row._id)}
              className="data-table-action data-table-action-delete"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editingId]
  );

  return (
    <div>
      <AdminPageHeader
        title="Advertisements"
        subtitle="Manage ad placements — only Active ads appear on the website"
        actionLabel={showForm ? undefined : '+ Add Ad'}
        onAction={openCreate}
      >
        {inactiveCount > 0 && !showForm && (
          <button type="button" onClick={handleEnableAll} className="btn-secondary text-sm py-2.5 px-4 w-full sm:w-auto">
            Enable All ({inactiveCount})
          </button>
        )}
      </AdminPageHeader>

      {inactiveCount > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>{inactiveCount} inactive ad(s)</strong> will not show on the public website.
          Click <strong>Enable</strong> on each row or use <strong>Enable All</strong>.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="font-semibold text-slate-900">
              {editingId ? 'Edit Advertisement' : 'New Advertisement'}
            </h2>
            {editingId && (
              <span className="text-xs text-slate-500 font-mono">ID: {editingId}</span>
            )}
          </div>
          <div className="space-y-4">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="admin-input"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="admin-input">
                {AD_POSITIONS.map((p) => (
                  <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="admin-input">
                <option value="image">Image</option>
                <option value="code">HTML Code</option>
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Priority (higher shows first)"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="admin-input"
              />
              <label className="flex items-center gap-2 text-sm text-slate-700 px-1">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-slate-300"
                />
                Active on website
              </label>
            </div>
            {form.type === 'image' ? (
              <>
                <input
                  placeholder="Image URL"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  required
                  className="admin-input"
                />
                <input
                  placeholder="Link URL (optional)"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="admin-input"
                />
                {form.image && (
                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                    <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-2">Preview</p>
                    <NewsImage
                      src={form.image}
                      seed={editingId || 'ad-preview'}
                      alt=""
                      className="max-h-32 w-full object-contain rounded-lg bg-white"
                    />
                  </div>
                )}
              </>
            ) : (
              <textarea
                placeholder="HTML Code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                rows={6}
                required
                className="admin-input font-mono text-xs"
              />
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">
              {saving ? 'Saving…' : editingId ? 'Update Ad' : 'Save Ad'}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      <DataTable
        columns={columns}
        data={ads}
        loading={loading}
        searchPlaceholder="Search ads..."
        searchKeys={['title', 'position', 'type']}
        emptyMessage="No advertisements found"
      />
    </div>
  );
};

export default Advertisements;
