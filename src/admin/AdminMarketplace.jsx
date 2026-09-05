import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { marketplaceService } from '../services/articleService';
import AdminPageHeader from './AdminPageHeader';
import DataTable from './DataTable';
import NewsImage from '../components/NewsImage';

const AdminMarketplace = () => {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProducts = () => {
    setLoading(true);
    const params = filter ? { status: filter } : {};
    marketplaceService
      .getAdminProducts(params)
      .then(({ data }) => setProducts(data.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  const loadEnquiries = () => {
    setLoading(true);
    marketplaceService
      .getAdminEnquiries()
      .then(({ data }) => setEnquiries(data.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === 'products') loadProducts();
    else loadEnquiries();
  }, [tab, filter]);

  const review = async (id, status) => {
    let rejectionReason = '';
    if (status === 'REJECTED') {
      rejectionReason = prompt('Rejection reason (shown to seller):') || 'Does not meet guidelines';
    }
    try {
      await marketplaceService.reviewProduct(id, { status, rejectionReason });
      toast.success(`Product ${status.toLowerCase()}`);
      loadProducts();
    } catch {
      toast.error('Review failed');
    }
  };

  const productColumns = [
    {
      key: 'title',
      header: 'Product',
      sortable: true,
      render: (row) => (
        <div className="flex gap-3 items-center">
          <NewsImage src={row.image} seed={row._id} alt="" className="w-12 h-10 rounded-lg object-cover" />
          <div>
            <p className="font-medium text-slate-900">{row.title}</p>
            <p className="text-xs text-slate-500">₹{Number(row.price).toLocaleString('en-IN')} · {row.location}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'seller',
      header: 'Seller',
      render: (row) => (
        <div className="text-sm">
          <p className="font-medium">{row.seller?.name}</p>
          <p className="text-xs text-slate-500">{row.seller?.email}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-bold uppercase">{row.status}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="data-table-actions">
          {row.status === 'PENDING' && (
            <>
              <button type="button" className="data-table-action data-table-action-edit" onClick={() => review(row._id, 'APPROVED')}>
                Approve
              </button>
              <button type="button" className="data-table-action data-table-action-delete" onClick={() => review(row._id, 'REJECTED')}>
                Reject
              </button>
            </>
          )}
          {row.status === 'APPROVED' && (
            <button type="button" className="data-table-action data-table-action-secondary" onClick={() => review(row._id, 'INACTIVE')}>
              Unlist
            </button>
          )}
          {row.status === 'INACTIVE' && (
            <button type="button" className="data-table-action data-table-action-edit" onClick={() => review(row._id, 'APPROVED')}>
              Relist
            </button>
          )}
        </div>
      ),
    },
  ];

  const enquiryColumns = [
    { key: 'buyerName', header: 'Buyer', sortable: true, render: (row) => (
      <div>
        <p className="font-medium">{row.buyerName}</p>
        <p className="text-xs text-slate-500">{row.buyerEmail}</p>
      </div>
    )},
    { key: 'product', header: 'Product', render: (row) => row.product?.title || '—' },
    { key: 'seller', header: 'Seller', render: (row) => row.seller?.name || '—' },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'message', header: 'Message', render: (row) => <span className="text-sm line-clamp-2">{row.message}</span> },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Marketplace"
        subtitle="Review seller products and monitor customer enquiries"
      />
      <div className="flex flex-wrap gap-2 mb-4">
        <button type="button" onClick={() => setTab('products')} className={tab === 'products' ? 'btn-primary text-sm' : 'btn-secondary text-sm'}>
          Products
        </button>
        <button type="button" onClick={() => setTab('enquiries')} className={tab === 'enquiries' ? 'btn-primary text-sm' : 'btn-secondary text-sm'}>
          Enquiries
        </button>
        {tab === 'products' && (
          <select className="border rounded-xl px-3 py-2 text-sm ml-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All statuses</option>
            {['PENDING', 'APPROVED', 'REJECTED', 'SOLD', 'INACTIVE'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>
      {tab === 'products' ? (
        <DataTable columns={productColumns} data={products} loading={loading} emptyMessage="No products" searchPlaceholder="Search products..." />
      ) : (
        <DataTable columns={enquiryColumns} data={enquiries} loading={loading} emptyMessage="No enquiries" searchPlaceholder="Search enquiries..." />
      )}
    </div>
  );
};

export default AdminMarketplace;
