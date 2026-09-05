import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { marketplaceService } from '../services/articleService';
import DataTable from '../admin/DataTable';

const SellerEnquiries = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    marketplaceService
      .getMyEnquiries()
      .then(({ data }) => setItems(data.data || []))
      .catch(() => toast.error('Failed to load enquiries'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    try {
      await marketplaceService.updateEnquiry(id, { status });
      toast.success('Updated');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'buyerName',
        header: 'Buyer',
        sortable: true,
        render: (row) => (
          <div className="min-w-[140px]">
            <p className="font-medium text-slate-900">{row.buyerName}</p>
            <p className="text-xs text-slate-500 truncate max-w-[180px]">{row.buyerEmail}</p>
            {row.buyerPhone && <p className="text-xs text-slate-400">{row.buyerPhone}</p>}
          </div>
        ),
      },
      {
        key: 'product',
        header: 'Product',
        sortable: true,
        sortValue: (row) => row.product?.title || '',
        render: (row) => <span className="text-sm text-teal-700 font-medium">{row.product?.title || '—'}</span>,
      },
      {
        key: 'message',
        header: 'Message',
        render: (row) => <span className="text-sm text-slate-600 line-clamp-2 max-w-[240px]">{row.message}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (row) => (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-100 text-slate-600 border border-stone-200">
            {row.status}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Date',
        sortable: true,
        sortValue: (row) => new Date(row.createdAt).getTime(),
        render: (row) => (
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : '—'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (row) => (
          <div className="data-table-actions">
            {row.status === 'NEW' && (
              <button type="button" onClick={() => setStatus(row._id, 'READ')} className="data-table-action data-table-action-secondary">
                Read
              </button>
            )}
            <button type="button" onClick={() => setStatus(row._id, 'REPLIED')} className="data-table-action data-table-action-secondary">
              Replied
            </button>
            <button type="button" onClick={() => setStatus(row._id, 'CLOSED')} className="data-table-action data-table-action-secondary">
              Close
            </button>
            <a href={`mailto:${row.buyerEmail}`} className="data-table-action data-table-action-edit">
              Email
            </a>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  );

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Enquiries</h1>
        <p className="text-sm text-slate-500 mt-0.5">Messages from customers interested in your products</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden p-3 sm:p-4">
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          searchPlaceholder="Search enquiries..."
          searchKeys={['buyerName', 'buyerEmail', 'buyerPhone', 'message', 'status']}
          onSearch={(row, q) => {
            const hay = [
              row.buyerName,
              row.buyerEmail,
              row.buyerPhone,
              row.message,
              row.status,
              row.product?.title,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();
            return hay.includes(q.toLowerCase());
          }}
          emptyMessage="No enquiries yet"
          pageSize={10}
        />
      </div>
    </div>
  );
};

export default SellerEnquiries;
