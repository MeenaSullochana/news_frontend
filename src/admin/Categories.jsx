import { useEffect, useState, useMemo } from 'react';
import { categoryService } from '../services/articleService';
import toast from 'react-hot-toast';
import AdminPageHeader from './AdminPageHeader';
import DataTable from './DataTable';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', nameTamil: '', slug: '', order: 0, status: 'active' });
  const [editId, setEditId] = useState(null);

  const fetchCategories = () => {
    setLoading(true);
    categoryService.getAll()
      .then(({ data }) => setCategories(data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setForm({ name: '', nameTamil: '', slug: '', order: 0, status: 'active' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await categoryService.update(editId, form);
        toast.success('Category updated');
      } else {
        await categoryService.create(form);
        toast.success('Category created');
      }
      resetForm();
      fetchCategories();
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, nameTamil: cat.nameTamil, slug: cat.slug, order: cat.order, status: cat.status });
    setEditId(cat._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete category?')) return;
    try {
      await categoryService.delete(id);
      toast.success('Deleted');
      fetchCategories();
    } catch {
      toast.error('Delete failed');
    }
  };

  const columns = useMemo(() => [
    { key: 'nameTamil', header: 'Tamil Name', sortable: true, render: (row) => <span className="font-medium text-slate-900">{row.nameTamil}</span> },
    { key: 'name', header: 'English', sortable: true },
    { key: 'slug', header: 'Slug', sortable: true, render: (row) => <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{row.slug}</code> },
    { key: 'order', header: 'Order', sortable: true, sortValue: (row) => row.order || 0 },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="data-table-actions">
          <button type="button" onClick={() => handleEdit(row)} className="data-table-action data-table-action-edit">Edit</button>
          <button type="button" onClick={() => handleDelete(row._id)} className="data-table-action data-table-action-delete">Delete</button>
        </div>
      ),
    },
  ], []);

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        subtitle="Manage news categories"
        actionLabel={showForm ? undefined : '+ Add Category'}
        onAction={() => { setShowForm(true); setEditId(null); }}
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">{editId ? 'Edit Category' : 'New Category'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input placeholder="Name (English)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="admin-input" />
            <input placeholder="Name (Tamil)" value={form.nameTamil} onChange={(e) => setForm({ ...form, nameTamil: e.target.value })} required className="admin-input" />
            <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="admin-input" />
            <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="admin-input" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button type="submit" className="btn-primary text-sm">Save</button>
            <button type="button" onClick={resetForm} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        searchPlaceholder="Search categories..."
        searchKeys={['name', 'nameTamil', 'slug']}
        emptyMessage="No categories found"
      />
    </div>
  );
};

export default Categories;
