import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { featureService } from '../services/articleService';
import AdminPageHeader, { StatusBadge } from './AdminPageHeader';
import DataTable from './DataTable';

const emptyItem = {
  featureKey: 'jobs',
  itemType: 'job',
  title: '',
  titleTamil: '',
  subtitle: '',
  description: '',
  image: '',
  link: '',
  icon: '',
  color: '',
  meta: {},
  isActive: true,
  priority: 0,
};

const FeatureContentAdmin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const featureFilter = searchParams.get('feature') || '';
  const [features, setFeatures] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [metaText, setMetaText] = useState('{}');

  const fetchAll = () => {
    setLoading(true);
    const params = featureFilter ? { featureKey: featureFilter } : {};
    Promise.all([featureService.getAll(), featureService.getItems(params)])
      .then(([fRes, iRes]) => {
        setFeatures(fRes.data.data || []);
        setItems(iRes.data.data || []);
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, [featureFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let meta = {};
    try {
      meta = JSON.parse(metaText || '{}');
    } catch {
      toast.error('Meta must be valid JSON');
      return;
    }
    const payload = { ...form, meta, featureKey: form.featureKey.toLowerCase() };
    try {
      if (editingId) {
        await featureService.updateItem(editingId, payload);
        toast.success('Item updated');
      } else {
        await featureService.createItem(payload);
        toast.success('Item created');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyItem, featureKey: featureFilter || 'jobs' });
      setMetaText('{}');
      fetchAll();
    } catch {
      toast.error('Save failed');
    }
  };

  const openEdit = (row) => {
    setEditingId(row._id);
    setForm({
      featureKey: row.featureKey,
      itemType: row.itemType,
      title: row.title,
      titleTamil: row.titleTamil || '',
      subtitle: row.subtitle || '',
      description: row.description || '',
      image: row.image || '',
      link: row.link || '',
      icon: row.icon || '',
      color: row.color || '',
      isActive: row.isActive,
      priority: row.priority || 0,
      meta: row.meta || {},
    });
    setMetaText(JSON.stringify(row.meta || {}, null, 2));
    setShowForm(true);
  };

  const toggleActive = async (row) => {
    try {
      await featureService.updateItem(row._id, { isActive: !row.isActive });
      toast.success('Updated');
      fetchAll();
    } catch {
      toast.error('Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    await featureService.deleteItem(id);
    toast.success('Deleted');
    fetchAll();
  };

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title',
        sortable: true,
        render: (row) => (
          <div>
            <p className="font-medium text-slate-900">{row.title}</p>
            {row.titleTamil && <p className="text-xs text-slate-500 font-tamil">{row.titleTamil}</p>}
          </div>
        ),
      },
      { key: 'featureKey', header: 'Feature', sortable: true },
      { key: 'itemType', header: 'Type', sortable: true },
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
            <button type="button" onClick={() => toggleActive(row)} className="data-table-action data-table-action-secondary">
              {row.isActive ? 'Hide' : 'Show'}
            </button>
            <button type="button" onClick={() => openEdit(row)} className="data-table-action data-table-action-secondary">
              Edit
            </button>
            <button type="button" onClick={() => handleDelete(row._id)} className="data-table-action data-table-action-delete">
              Delete
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  );

  return (
    <div>
      <AdminPageHeader
        title="Feature Content"
        subtitle="CMS for jobs, marketplace, alerts, community, quiz questions, and more"
        actionLabel={showForm ? undefined : '+ Add Item'}
        onAction={() => {
          setEditingId(null);
          setForm({ ...emptyItem, featureKey: featureFilter || 'jobs' });
          setMetaText('{}');
          setShowForm(true);
        }}
      >
        <Link to="/admin/features" className="btn-secondary text-sm py-2.5 px-4 text-center">
          Feature Manager
        </Link>
      </AdminPageHeader>

      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <label className="text-sm text-slate-600">Filter by feature:</label>
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={featureFilter}
          onChange={(e) => {
            const v = e.target.value;
            if (v) setSearchParams({ feature: v });
            else setSearchParams({});
          }}
        >
          <option value="">All modules</option>
          {features.map((f) => (
            <option key={f.key} value={f.key}>
              {f.name} ({f.key})
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card mb-6 space-y-4">
          <h2 className="font-semibold text-slate-900">{editingId ? 'Edit Item' : 'New Item'}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="text-slate-600">Feature key</span>
              <select
                required
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={form.featureKey}
                onChange={(e) => setForm({ ...form, featureKey: e.target.value })}
              >
                {features.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Item type</span>
              <input required className="mt-1 w-full border rounded-lg px-3 py-2" value={form.itemType} onChange={(e) => setForm({ ...form, itemType: e.target.value })} placeholder="job, event, alert…" />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Title</span>
              <input required className="mt-1 w-full border rounded-lg px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Title (Tamil)</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.titleTamil} onChange={(e) => setForm({ ...form, titleTamil: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Subtitle</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Image URL</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Link</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Priority</span>
              <input type="number" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Icon</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600">Color</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#2563eb" />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-slate-600">Description</span>
              <textarea rows={2} className="mt-1 w-full border rounded-lg px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-slate-600">Meta (JSON) — salary, price, options, AQI…</span>
              <textarea rows={5} className="mt-1 w-full border rounded-lg px-3 py-2 font-mono text-xs" value={metaText} onChange={(e) => setMetaText(e.target.value)} />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">
              Save
            </button>
            <button type="button" className="btn-secondary text-sm" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <DataTable columns={columns} data={items} loading={loading} emptyMessage="No content items" searchPlaceholder="Search items..." />
    </div>
  );
};

export default FeatureContentAdmin;
