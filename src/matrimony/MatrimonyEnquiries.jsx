import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { matrimonyService } from '../services/articleService';
import DataTable from '../admin/DataTable';
import { getImageUrl } from '../utils/images';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'sent', label: 'Sent by me' },
  { id: 'received', label: 'Received on my profile' },
];

const MatrimonyEnquiries = () => {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    matrimonyService
      .getMyEnquiries()
      .then(({ data }) => setItems(data.data || []))
      .catch(() => toast.error('Failed to load enquiries'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (tab === 'sent') {
      return items.filter((row) => row.enquiryType === 'sent' || row.enquiryType === 'both');
    }
    if (tab === 'received') {
      return items.filter((row) => row.enquiryType === 'received' || row.enquiryType === 'both');
    }
    return items;
  }, [items, tab]);

  const columns = useMemo(
    () => [
      {
        key: 'enquiryType',
        header: 'Type',
        sortable: true,
        render: (row) => {
          const label =
            row.enquiryType === 'both'
              ? 'Sent & Received'
              : row.enquiryType === 'received'
                ? 'Received'
                : 'Sent';
          const tone =
            row.enquiryType === 'received'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : row.enquiryType === 'sent'
                ? 'bg-sky-50 text-sky-800 border-sky-200'
                : 'bg-violet-50 text-violet-800 border-violet-200';
          return (
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${tone}`}>
              {label}
            </span>
          );
        },
      },
      {
        key: 'profile',
        header: 'Profile',
        sortable: true,
        sortValue: (row) => row.profile?.fullName || '',
        render: (row) => (
          <div className="flex items-center gap-3 min-w-[160px]">
            {row.profile?.profilePhoto ? (
              <img
                src={getImageUrl(row.profile.profilePhoto)}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-stone-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold">
                {(row.profile?.fullName || '?').charAt(0)}
              </div>
            )}
            <div>
              <p className="font-medium text-slate-900">{row.profile?.fullName || '—'}</p>
              <p className="text-xs text-slate-500">{row.profile?.profileId || '—'}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'enquirerName',
        header: 'From',
        sortable: true,
        render: (row) => (
          <div>
            <p className="text-sm font-medium text-slate-900">{row.enquirerName}</p>
            <p className="text-xs text-slate-500">{row.enquirerPhone}</p>
          </div>
        ),
      },
      {
        key: 'comment',
        header: 'Comment',
        render: (row) => (
          <span className="text-sm text-slate-600 line-clamp-3 max-w-[280px] whitespace-pre-wrap">{row.comment}</span>
        ),
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
            {row.createdAt ? new Date(row.createdAt).toLocaleString('en-IN') : '—'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'View',
        render: (row) =>
          row.profile?.profileId || row.profile?._id ? (
            <Link
              to={`/matrimony/${row.profile.profileId || row.profile._id}`}
              className="data-table-action data-table-action-edit"
            >
              Profile
            </Link>
          ) : (
            '—'
          ),
      },
    ],
    []
  );

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Enquiries</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Enquiries you sent and enquiries received on your profile
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={tab === item.id ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden p-3 sm:p-4">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          searchPlaceholder="Search enquiries..."
          searchKeys={['enquirerName', 'enquirerPhone', 'comment', 'status', 'enquiryType']}
          emptyMessage={
            tab === 'received'
              ? 'No enquiries received on your profile yet.'
              : tab === 'sent'
                ? 'No sent enquiries yet. Browse profiles and submit an enquiry while logged in.'
                : 'No enquiries yet. Browse profiles and send an enquiry, or wait for others to contact you.'
          }
        />
      </div>
    </div>
  );
};

export default MatrimonyEnquiries;
