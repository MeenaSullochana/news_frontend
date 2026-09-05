import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { matrimonyService } from '../../services/articleService';
import AdminPageHeader from '../AdminPageHeader';
import MatrimonyNav from './MatrimonyNav';

const MatrimonyCategories = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', nameTamil: '', slug: '', order: 0 });
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    matrimonyService
      .getCategories()
      .then(({ data }) => setItems(data.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm({ name: '', nameTamil: '', slug: '', order: 0 });
    setEditing(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name required');
      return;
    }
    try {
      if (editing) {
        await matrimonyService.updateCategory(editing, form);
        toast.success('Category updated');
      } else {
        await matrimonyService.createCategory(form);
        toast.success('Category created');
      }
      reset();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Delete category “${name}”?`)) return;
    try {
      await matrimonyService.deleteCategory(id);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <AdminPageHeader title="Profile Categories" subtitle="Organize matrimony profiles" />
      <MatrimonyNav />

      <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
          placeholder="Name *"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <input
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
          placeholder="Tamil name"
          value={form.nameTamil}
          onChange={(e) => setForm((f) => ({ ...f, nameTamil: e.target.value }))}
        />
        <input
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
          placeholder="Slug (optional)"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
        />
        <div className="flex gap-2">
          <input
            type="number"
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm w-20"
            value={form.order}
            onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) || 0 }))}
          />
          <button type="submit" className="btn-primary text-sm flex-1">{editing ? 'Update' : 'Add'}</button>
          {editing && (
            <button type="button" onClick={reset} className="btn-secondary text-sm">Cancel</button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6 skeleton h-32" />
        ) : !items.length ? (
          <p className="p-6 text-sm text-slate-500">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((c) => (
              <li key={c._id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.slug}{c.nameTamil ? ` · ${c.nameTamil}` : ''}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs font-medium text-brand-700"
                    onClick={() => {
                      setEditing(c._id);
                      setForm({
                        name: c.name,
                        nameTamil: c.nameTamil || '',
                        slug: c.slug || '',
                        order: c.order || 0,
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="text-xs font-medium text-rose-600" onClick={() => remove(c._id, c.name)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MatrimonyCategories;
