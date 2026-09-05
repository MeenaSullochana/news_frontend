import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { marketplaceService } from '../services/articleService';

const SellerDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    marketplaceService.getSellerStats().then(({ data }) => setStats(data.data)).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total products', key: 'total', color: 'text-slate-900' },
    { label: 'Pending review', key: 'pending', color: 'text-amber-600' },
    { label: 'Live (approved)', key: 'approved', color: 'text-teal-700' },
    { label: 'Sold', key: 'sold', color: 'text-slate-600' },
    { label: 'Enquiries', key: 'enquiries', color: 'text-slate-900' },
    { label: 'New enquiries', key: 'newEnquiries', color: 'text-rose-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Products go live only after admin approval</p>
        </div>
        <Link to="/seller/products/new" className="btn-primary text-sm">+ Add Product</Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((c) => (
          <div key={c.key} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{stats?.[c.key] ?? '—'}</p>
          </div>
        ))}
      </div>
      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-sm text-teal-900">
        Tip: After you submit a product, wait for admin approval. Customers can then send enquiries — manage them under{' '}
        <Link to="/seller/enquiries" className="font-semibold underline">Enquiries</Link>.
      </div>
    </div>
  );
};

export default SellerDashboard;
