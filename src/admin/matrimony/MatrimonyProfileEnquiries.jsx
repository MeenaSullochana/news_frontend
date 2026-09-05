import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { matrimonyService } from '../../services/articleService';
import AdminPageHeader from '../AdminPageHeader';
import MatrimonyNav from './MatrimonyNav';
import DataTable from '../DataTable';

const MatrimonyProfileEnquiries = () => {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    matrimonyService
      .getProfileEnquiries(id)
      .then(({ data }) => {
        setItems(data.data || []);
        setProfile(data.profile || null);
      })
      .catch(() => toast.error('Failed to load enquiries'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const setStatus = async (enquiryId, status) => {
    try {
      await matrimonyService.updateProfileEnquiry(id, enquiryId, { status });
      toast.success('Updated');
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'enquirerName',
        header: 'Name',
        sortable: true,
        render: (row) => (
          <div className="min-w-[140px]">
            <p className="font-medium text-slate-900">{row.enquirerName}</p>
            <p className="text-xs text-slate-500">{row.enquirerPhone}</p>
          </div>
        ),
      },
      {
        key: 'comment',
        header: 'Comment',
        render: (row) => (
          <span className="text-sm text-slate-600 line-clamp-3 max-w-[320px] whitespace-pre-wrap">{row.comment}</span>
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
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );

  return (
    <div>
      <AdminPageHeader
        title="Enquiry List"
        subtitle={profile ? `${profile.fullName} · ${profile.profileId}` : 'Profile enquiries'}
      >
        <Link to={`/admin/matrimony/view/${id}`} className="btn-secondary text-sm py-2.5 px-4">
          View Profile
        </Link>
        <Link to={`/admin/matrimony/edit/${id}`} className="btn-primary text-sm py-2.5 px-4">
          Edit Profile
        </Link>
      </AdminPageHeader>
      <MatrimonyNav />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-3 sm:p-4">
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          searchPlaceholder="Search enquiries..."
          searchKeys={['enquirerName', 'enquirerPhone', 'comment', 'status']}
          emptyMessage="No enquiries for this profile yet."
        />
      </div>
    </div>
  );
};

export default MatrimonyProfileEnquiries;
