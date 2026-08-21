import { useEffect, useState } from 'react';
import { categoryService } from '../services/articleService';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', nameTamil: '', slug: '', order: 0, status: 'active' });
  const [editId, setEditId] = useState(null);

  const fetchCategories = () => {
    categoryService.getAll().then(({ data }) => setCategories(data.data || []));
  };

  useEffect(() => { fetchCategories(); }, []);

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
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', nameTamil: '', slug: '', order: 0, status: 'active' });
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); }} className="btn-primary">+ Add Category</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Name (English)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="px-3 py-2 border rounded-md text-sm" />
          <input placeholder="Name (Tamil)" value={form.nameTamil} onChange={(e) => setForm({ ...form, nameTamil: e.target.value })} required className="px-3 py-2 border rounded-md text-sm" />
          <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="px-3 py-2 border rounded-md text-sm" />
          <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })} className="px-3 py-2 border rounded-md text-sm" />
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" className="btn-primary text-sm">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Tamil Name</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">English</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td className="px-4 py-3 font-medium">{cat.nameTamil}</td>
                <td className="px-4 py-3 hidden md:table-cell">{cat.name}</td>
                <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                <td className="px-4 py-3">{cat.order}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleEdit(cat)} className="text-brand-600 text-xs mr-2">Edit</button>
                  <button onClick={() => handleDelete(cat._id)} className="text-red-500 text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categories;
