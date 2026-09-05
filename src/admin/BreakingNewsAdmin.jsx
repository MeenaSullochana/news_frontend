import { useEffect, useState, useMemo } from 'react';
import { breakingNewsService } from '../services/articleService';
import toast from 'react-hot-toast';
import AdminPageHeader, { StatusBadge } from './AdminPageHeader';
import DataTable from './DataTable';

const emptyForm = { text: '', link: '', priority: 0, isActive: true, endTime: '' };

const BreakingNewsAdmin = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchItems = () => {
    setLoading(true);
    breakingNewsService.getAll()
      .then(({ data }) => setItems(data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, endTime: form.endTime || null };
      if (editId) {
        await breakingNewsService.update(editId, payload);
        toast.success('Updated');
      } else {
        await breakingNewsService.create(payload);
        toast.success('Created');
      }
      resetForm();
      fetchItems();
    } catch {
      toast.error('Failed');
    }
  };

  const handleToggle = async (item) => {
    await breakingNewsService.update(item._id, { isActive: !item.isActive });
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    await breakingNewsService.delete(id);
    toast.success('Deleted');
    fetchItems();
  };

  const openEdit = (item) => {
    setForm({
      text: item.text || '',
      link: item.link || '',
      priority: item.priority || 0,
      isActive: item.isActive ?? true,
      endTime: item.endTime ? item.endTime.slice(0, 16) : '',
    });
    setEditId(item._id);
    setShowForm(true);
  };

  const columns = useMemo(() => [
    {
      key: 'text',
      header: 'Headline',
      sortable: true,
      cellClassName: 'max-w-md',
      render: (row) => <p className="font-medium text-slate-900 line-clamp-2">{row.text}</p>,
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      sortValue: (row) => row.priority || 0,
      render: (row) => <span className="font-semibold tabular-nums">{row.priority}</span>,
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      sortValue: (row) => (row.isActive ? 1 : 0),
      render: (row) => <StatusBadge active={row.isActive} />,
    },
    {
      key: 'endTime',
      header: 'End Time',
      sortable: true,
      sortValue: (row) => row.endTime ? new Date(row.endTime).getTime() : 0,
      render: (row) => (
        <span className="text-slate-500 text-xs whitespace-nowrap">
          {row.endTime ? new Date(row.endTime).toLocaleString('en-IN') : 'No expiry'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="data-table-actions">
          <button type="button" onClick={() => handleToggle(row)} className="data-table-action data-table-action-secondary">
            {row.isActive ? 'Disable' : 'Enable'}
          </button>
          <button type="button" onClick={() => openEdit(row)} className="data-table-action data-table-action-edit">Edit</button>
          <button type="button" onClick={() => handleDelete(row._id)} className="data-table-action data-table-action-delete">Delete</button>
        </div>
      ),
    },
  ], []);

  return (
    <div>
      <AdminPageHeader
        title="Breaking News"
        subtitle="Ticker headlines on the homepage"
        actionLabel={showForm ? undefined : '+ Add Breaking News'}
        onAction={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">{editId ? 'Edit' : 'New'} Breaking News</h2>
          <div className="space-y-4">
            <textarea placeholder="Breaking news text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required rows={2} className="admin-input" />
            <input placeholder="Link (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="admin-input" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="number" placeholder="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} className="admin-input" />
              <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="admin-input" />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-slate-300 text-brand-600" />
              Active
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button type="submit" className="btn-primary text-sm">Save</button>
            <button type="button" onClick={resetForm} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        searchPlaceholder="Search breaking news..."
        searchKeys={['text', 'link']}
        emptyMessage="No breaking news items"
      />
    </div>
  );
};

export default BreakingNewsAdmin;
