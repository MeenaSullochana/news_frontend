import { useEffect, useState } from 'react';
import { adService } from '../services/articleService';
import toast from 'react-hot-toast';

const AD_POSITIONS = [
  'header', 'top_banner', 'homepage_top', 'homepage_middle',
  'sidebar', 'article_top', 'article_middle', 'article_bottom', 'footer', 'mobile_sticky',
];

const Advertisements = () => {
  const [ads, setAds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', position: 'sidebar', type: 'image', image: '', link: '', code: '', isActive: true, priority: 0 });

  const fetchAds = () => adService.getAll().then(({ data }) => setAds(data.data || []));
  useEffect(() => { fetchAds(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adService.create(form);
      toast.success('Ad created');
      setShowForm(false);
      fetchAds();
    } catch {
      toast.error('Failed');
    }
  };

  const handleToggle = async (ad) => {
    await adService.update(ad._id, { isActive: !ad.isActive });
    fetchAds();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete ad?')) return;
    await adService.delete(id);
    toast.success('Deleted');
    fetchAds();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Advertisements</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Add Ad</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 mb-6 space-y-3">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 border rounded-md text-sm" />
          <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm">
            {AD_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm">
            <option value="image">Image</option>
            <option value="code">HTML Code</option>
          </select>
          {form.type === 'image' ? (
            <>
              <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm" />
              <input placeholder="Link URL" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm" />
            </>
          ) : (
            <textarea placeholder="HTML Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-md text-sm" />
          )}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Position</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ads.map((ad) => (
              <tr key={ad._id}>
                <td className="px-4 py-3">{ad.title}</td>
                <td className="px-4 py-3 text-gray-500">{ad.position}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                    {ad.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(ad)} className="text-xs text-brand-600 mr-2">Toggle</button>
                  <button onClick={() => handleDelete(ad._id)} className="text-xs text-red-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Advertisements;
