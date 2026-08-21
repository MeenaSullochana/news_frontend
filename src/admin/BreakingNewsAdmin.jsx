import { useEffect, useState } from 'react';
import { breakingNewsService } from '../services/articleService';
import toast from 'react-hot-toast';

const BreakingNewsAdmin = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ text: '', link: '', priority: 0, isActive: true, endTime: '' });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchItems = () => {
    breakingNewsService.getAll().then(({ data }) => setItems(data.data || []));
  };

  useEffect(() => { fetchItems(); }, []);

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
      setShowForm(false);
      setEditId(null);
      setForm({ text: '', link: '', priority: 0, isActive: true, endTime: '' });
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Breaking News</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Add</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 mb-6 space-y-3">
          <textarea placeholder="Breaking news text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required rows={2} className="w-full px-3 py-2 border rounded-md text-sm" />
          <input placeholder="Link (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })} className="px-3 py-2 border rounded-md text-sm" />
            <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="px-3 py-2 border rounded-md text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow-sm p-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium">{item.text}</p>
              <p className="text-xs text-gray-400 mt-1">Priority: {item.priority} • {item.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => handleToggle(item)} className="text-xs btn-secondary py-1 px-2">
                {item.isActive ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => { setForm(item); setEditId(item._id); setShowForm(true); }} className="text-xs text-brand-600">Edit</button>
              <button onClick={() => handleDelete(item._id)} className="text-xs text-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BreakingNewsAdmin;
