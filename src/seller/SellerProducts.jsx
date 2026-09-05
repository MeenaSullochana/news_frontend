import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { marketplaceService } from '../services/articleService';
import DataTable from '../admin/DataTable';
import NewsImage from '../components/NewsImage';

const statusStyle = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-teal-50 text-teal-700 border-teal-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  SOLD: 'bg-slate-100 text-slate-600 border-slate-200',
  INACTIVE: 'bg-slate-100 text-slate-500 border-slate-200',
};

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    marketplaceService
      .getMyProducts()
      .then(({ data }) => setProducts(data.data || []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const mark = async (id, status) => {
    try {
      await marketplaceService.updateProduct(id, { status });
      toast.success(`Marked ${status.toLowerCase()}`);
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await marketplaceService.deleteProduct(id);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Product',
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-3 min-w-[180px]">
            <NewsImage src={row.image} seed={row._id} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-slate-900 truncate max-w-[200px] sm:max-w-xs">{row.title}</p>
              {row.status === 'REJECTED' && row.rejectionReason && (
                <p className="text-[11px] text-rose-600 truncate">Rejected: {row.rejectionReason}</p>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (row) => (
          <span className={`inline-flex text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border whitespace-nowrap ${statusStyle[row.status] || statusStyle.INACTIVE}`}>
            {row.status}
          </span>
        ),
      },
      {
        key: 'price',
        header: 'Price',
        sortable: true,
        sortValue: (row) => Number(row.price) || 0,
        render: (row) => (
          <span className="font-semibold text-teal-700 whitespace-nowrap">
            ₹{Number(row.price).toLocaleString('en-IN')}
          </span>
        ),
      },
      {
        key: 'location',
        header: 'Location',
        sortable: true,
        render: (row) => <span className="text-slate-600 whitespace-nowrap">{row.location || '—'}</span>,
      },
      {
        key: 'category',
        header: 'Category',
        sortable: true,
        render: (row) => <span className="text-slate-500 text-xs">{row.category || '—'}</span>,
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (row) => (
          <div className="data-table-actions">
            {row.status === 'APPROVED' && (
              <>
                <button type="button" onClick={() => mark(row._id, 'SOLD')} className="data-table-action data-table-action-secondary">
                  Sold
                </button>
                <button type="button" onClick={() => mark(row._id, 'INACTIVE')} className="data-table-action data-table-action-secondary">
                  Hide
                </button>
              </>
            )}
            <Link to={`/seller/products/${row._id}/edit`} className="data-table-action data-table-action-edit">
              Edit
            </Link>
            <button type="button" onClick={() => remove(row._id)} className="data-table-action data-table-action-delete">
              Delete
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products]
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">{products.length} listing{products.length === 1 ? '' : 's'}</p>
        </div>
        <Link to="/seller/products/new" className="btn-primary text-sm w-full sm:w-auto text-center">
          + Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden p-3 sm:p-4">
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          searchPlaceholder="Search products..."
          searchKeys={['title', 'location', 'category', 'status']}
          emptyMessage="No products yet"
          emptyAction={
            <Link to="/seller/products/new" className="btn-primary text-sm mt-3 inline-flex">
              Add your first listing
            </Link>
          }
          pageSize={10}
        />
      </div>
    </div>
  );
};

export default SellerProducts;
