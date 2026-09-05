import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { marketplaceService } from '../services/articleService';

const empty = {
  title: '',
  description: '',
  price: '',
  location: '',
  image: '',
  category: 'General',
  condition: 'used',
};

const SellerProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    marketplaceService
      .getMyProducts()
      .then(({ data }) => {
        const p = (data.data || []).find((x) => x._id === id);
        if (!p) {
          toast.error('Product not found');
          navigate('/seller/products');
          return;
        }
        setForm({
          title: p.title || '',
          description: p.description || '',
          price: p.price ?? '',
          location: p.location || '',
          image: p.image || '',
          category: p.category || 'General',
          condition: p.condition || 'used',
        });
      })
      .catch(() => toast.error('Failed to load'));
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (isEdit) {
        await marketplaceService.updateProduct(id, payload);
        toast.success('Updated — resubmitted for review if content changed');
      } else {
        await marketplaceService.createProduct(payload);
        toast.success('Submitted for admin approval');
      }
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link to="/seller/products" className="text-sm text-teal-700 font-medium">← My Products</Link>
      <h1 className="text-2xl font-bold text-slate-900 mt-2">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      <p className="text-sm text-slate-500 mb-6">Listings appear on the website only after admin approval.</p>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-4">
        <label className="block text-sm">
          <span className="text-slate-600">Title</span>
          <input required className="mt-1 w-full border rounded-xl px-3 py-2.5" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label className="block text-sm">
          <span className="text-slate-600">Description</span>
          <textarea rows={4} className="mt-1 w-full border rounded-xl px-3 py-2.5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="text-slate-600">Price (₹)</span>
            <input required type="number" min="0" step="1" className="mt-1 w-full border rounded-xl px-3 py-2.5" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Location</span>
            <input className="mt-1 w-full border rounded-xl px-3 py-2.5" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Category</span>
            <input className="mt-1 w-full border rounded-xl px-3 py-2.5" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Condition</span>
            <select className="mt-1 w-full border rounded-xl px-3 py-2.5" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
              {['new', 'like_new', 'good', 'fair', 'used'].map((c) => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-slate-600">Image URL</span>
          <input className="mt-1 w-full border rounded-xl px-3 py-2.5" placeholder="https://…" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        </label>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving…' : isEdit ? 'Save changes' : 'Submit for review'}</button>
          <Link to="/seller/products" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default SellerProductForm;
