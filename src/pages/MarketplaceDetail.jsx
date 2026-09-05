import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { marketplaceService } from '../services/articleService';
import NewsImage from '../components/NewsImage';

const MarketplaceDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ buyerName: '', buyerEmail: '', buyerPhone: '', message: '' });

  useEffect(() => {
    setLoading(true);
    marketplaceService
      .getProduct(id)
      .then(({ data }) => setProduct(data.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnquiry = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await marketplaceService.sendEnquiry(id, form);
      toast.success('Enquiry sent to the seller');
      setForm({ buyerName: '', buyerEmail: '', buyerPhone: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send enquiry');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="container-news py-12">
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-news py-12 text-center">
        <h1 className="text-xl font-bold">Product not found</h1>
        <Link to="/marketplace" className="text-teal-700 text-sm mt-3 inline-block">← Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="container-news py-8">
      <Helmet>
        <title>{product.title} | Marketplace</title>
      </Helmet>
      <Link to="/marketplace" className="text-sm text-teal-700 font-medium">← All listings</Link>
      <div className="mt-4 grid lg:grid-cols-2 gap-8">
        <NewsImage src={product.image} seed={product._id} alt={product.title} className="w-full rounded-2xl object-cover aspect-[4/3]" />
        <div>
          <p className="text-xs font-semibold uppercase text-teal-700">{product.category}</p>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-900 mt-1">{product.title}</h1>
          <p className="text-2xl font-bold text-teal-700 mt-3">₹{Number(product.price).toLocaleString('en-IN')}</p>
          <p className="text-sm text-slate-500 mt-1">{product.location} · {product.condition?.replace('_', ' ')}</p>
          {product.description && (
            <p className="text-slate-700 mt-4 whitespace-pre-wrap leading-relaxed">{product.description}</p>
          )}
          <div className="mt-4 p-4 rounded-2xl bg-stone-100 text-sm">
            <p className="font-semibold text-slate-900">Seller</p>
            <p className="text-slate-600">{product.seller?.businessName || product.seller?.name}</p>
            {product.seller?.city && <p className="text-slate-500 text-xs">{product.seller.city}</p>}
          </div>

          <form onSubmit={handleEnquiry} className="mt-6 bg-white border border-stone-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <h2 className="font-bold text-slate-900">Send enquiry to seller</h2>
            <p className="text-xs text-slate-500">Your message goes directly to the seller’s dashboard.</p>
            <input required placeholder="Your name" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.buyerName} onChange={(e) => setForm({ ...form, buyerName: e.target.value })} />
            <input required type="email" placeholder="Email" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.buyerEmail} onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })} />
            <input placeholder="Phone (optional)" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.buyerPhone} onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })} />
            <textarea required rows={4} placeholder="Message" className="w-full border rounded-xl px-3 py-2.5 text-sm" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <button type="submit" disabled={sending} className="btn-primary w-full">
              {sending ? 'Sending…' : 'Send enquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceDetail;
