import { useEffect, useState } from 'react';
import { authorService } from '../services/articleService';
import toast from 'react-hot-toast';

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', designation: '', bio: '', profileImage: '', status: 'active' });
  const [editId, setEditId] = useState(null);

  const fetchAuthors = () => {
    authorService.getAllAdmin().then(({ data }) => setAuthors(data.data || []));
  };

  useEffect(() => { fetchAuthors(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await authorService.update(editId, form);
        toast.success('Author updated');
      } else {
        await authorService.create(form);
        toast.success('Author created');
      }
      setShowForm(false);
      setEditId(null);
      fetchAuthors();
    } catch {
      toast.error('Failed to save');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Authors</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Add Author</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="px-3 py-2 border rounded-md text-sm" />
            <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="px-3 py-2 border rounded-md text-sm" />
            <input placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="px-3 py-2 border rounded-md text-sm" />
            <input placeholder="Profile Image URL" value={form.profileImage} onChange={(e) => setForm({ ...form, profileImage: e.target.value })} className="px-3 py-2 border rounded-md text-sm" />
          </div>
          <textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-md text-sm" />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {authors.map((author) => (
          <div key={author._id} className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-bold">{author.name}</h3>
            <p className="text-sm text-brand-600">{author.designation}</p>
            <p className="text-xs text-gray-500 mt-1">{author.slug}</p>
            <button
              onClick={() => { setForm(author); setEditId(author._id); setShowForm(true); }}
              className="text-brand-600 text-xs mt-2"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Authors;
