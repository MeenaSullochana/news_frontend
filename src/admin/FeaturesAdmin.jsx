import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { featureService } from '../services/articleService';
import AdminPageHeader, { StatusBadge } from './AdminPageHeader';
import DataTable from './DataTable';
import { StatusPill } from '../features/FeatureIcons';

const emptyFeature = {
  key: '',
  name: '',
  nameTamil: '',
  description: '',
  category: 'engagement',
  icon: 'spark',
  status: 'coming_soon',
  enabled: true,
  order: 999,
  row: 6,
  colSpan: 4,
  config: {},
};

const FeaturesAdmin = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyFeature);
  const [editingId, setEditingId] = useState(null);
  const [configText, setConfigText] = useState('{}');

  const fetchFeatures = () => {
    setLoading(true);
    featureService
      .getAll()
      .then(({ data }) => setFeatures(data.data || []))
      .catch(() => toast.error('Failed to load features'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleSync = async () => {
    try {
      const { data } = await featureService.syncDefaults();
      toast.success(`Synced registry — created ${data.data.created}, updated ${data.data.updated}`);
      fetchFeatures();
    } catch {
      toast.error('Sync failed');
    }
  };

  const openEdit = (row) => {
    setEditingId(row._id);
    setForm({
      key: row.key,
      name: row.name,
      nameTamil: row.nameTamil || '',
      description: row.description || '',
      category: row.category,
      icon: row.icon || 'spark',
      status: row.status,
      enabled: row.enabled,
      order: row.order,
      row: row.row,
      colSpan: row.colSpan,
      config: row.config || {},
    });
    setConfigText(JSON.stringify(row.config || {}, null, 2));
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let config = {};
    try {
      config = JSON.parse(configText || '{}');
    } catch {
      toast.error('Config must be valid JSON');
      return;
    }
    const payload = { ...form, config, key: form.key.trim().toLowerCase().replace(/\s+/g, '_') };
    try {
      if (editingId) {
        await featureService.update(editingId, payload);
        toast.success('Feature updated');
      } else {
        await featureService.create(payload);
        toast.success('Feature created — add a client renderer if it needs a custom widget');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyFeature);
      setConfigText('{}');
      fetchFeatures();
    } catch {
      toast.error('Save failed');
    }
  };

  const toggleEnabled = async (row) => {
    try {
      await featureService.update(row._id, { enabled: !row.enabled });
      toast.success(row.enabled ? 'Disabled on website' : 'Enabled on website');
      fetchFeatures();
    } catch {
      toast.error('Update failed');
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Feature',
        sortable: true,
        render: (row) => (
          <div>
            <p className="font-medium text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-400 font-mono">{row.key}</p>
          </div>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        sortable: true,
        render: (row) => <span className="capitalize text-slate-600">{row.category}</span>,
      },
      {
        key: 'row',
        header: 'Layout',
        sortable: true,
        render: (row) => (
          <span className="text-xs text-slate-500">
            Row {row.row} · span {row.colSpan} · ord {row.order}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (row) => <StatusPill status={row.status} />,
      },
      {
        key: 'enabled',
        header: 'On site',
        sortable: true,
        sortValue: (row) => (row.enabled ? 1 : 0),
        render: (row) => <StatusBadge active={row.enabled} />,
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (row) => (
          <div className="data-table-actions">
            <button type="button" onClick={() => toggleEnabled(row)} className="data-table-action data-table-action-secondary">
              {row.enabled ? 'Disable' : 'Enable'}
            </button>
            <button type="button" onClick={() => openEdit(row)} className="data-table-action data-table-action-secondary">
              Edit
            </button>
            <Link to={`/admin/feature-content?feature=${row.key}`} className="data-table-action data-table-action-secondary">
              Content
            </Link>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [features]
  );

  return (
    <div>
      <AdminPageHeader
        title="Feature Manager"
        subtitle="Enable, configure, and order hub modules — future features register here"
        actionLabel={showForm ? undefined : '+ Add Feature'}
        onAction={() => {
          setEditingId(null);
          setForm(emptyFeature);
          setConfigText('{}');
          setShowForm(true);
        }}
      >
        {!showForm && (
          <>
            <button type="button" onClick={handleSync} className="btn-secondary text-sm py-2.5 px-4">
              Sync Registry
            </button>
            <Link to="/explore" target="_blank" className="btn-secondary text-sm py-2.5 px-4 text-center">
              View Hub
            </Link>
          </>
        )}
      </AdminPageHeader>

      <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
        Architecture: each module is a <strong>SiteFeature</strong> (toggle/layout/config) plus optional{' '}
        <strong>FeatureItem</strong> content. New widgets: add registry entry → Sync → (optional) client renderer → content.
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card mb-6 space-y-4">
          <h2 className="font-semibold text-slate-900">{editingId ? 'Edit Feature' : 'New Feature'}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="text-slate-600">Key (unique)</span>
              <input
                required
                disabled={!!editingId}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Category</span>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {['utilities', 'news', 'classifieds', 'engagement', 'community', 'portal'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Name</span>
              <input required className="mt-1 w-full border rounded-lg px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Name (Tamil)</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.nameTamil} onChange={(e) => setForm({ ...form, nameTamil: e.target.value })} />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-slate-600">Description</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Status</span>
              <select className="mt-1 w-full border rounded-lg px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {['live', 'beta', 'coming_soon', 'disabled'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Icon key</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Row</span>
              <input type="number" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.row} onChange={(e) => setForm({ ...form, row: Number(e.target.value) })} />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Column span (1–12)</span>
              <input type="number" min={1} max={12} className="mt-1 w-full border rounded-lg px-3 py-2" value={form.colSpan} onChange={(e) => setForm({ ...form, colSpan: Number(e.target.value) })} />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Order</span>
              <input type="number" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </label>
            <label className="flex items-center gap-2 text-sm mt-6">
              <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
              Enabled on website
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-slate-600">Config (JSON) — rates, city, API settings, links…</span>
              <textarea rows={6} className="mt-1 w-full border rounded-lg px-3 py-2 font-mono text-xs" value={configText} onChange={(e) => setConfigText(e.target.value)} />
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">
              Save
            </button>
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <DataTable columns={columns} data={features} loading={loading} emptyMessage="No features — click Sync Registry" searchPlaceholder="Search features..." />
    </div>
  );
};

export default FeaturesAdmin;
