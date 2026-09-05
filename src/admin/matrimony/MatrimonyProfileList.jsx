import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { matrimonyService } from '../../services/articleService';
import AdminPageHeader, { StatusBadge } from '../AdminPageHeader';
import MatrimonyNav from './MatrimonyNav';
import DataTable from '../DataTable';
import NewsImage from '../../components/NewsImage';

const ROUTE_FILTERS = {
  '/admin/matrimony/pending': { status: 'PENDING', title: 'Pending Profiles' },
  '/admin/matrimony/approved': { status: 'APPROVED', title: 'Approved Profiles' },
  '/admin/matrimony/rejected': { status: 'REJECTED', title: 'Rejected Profiles' },
  '/admin/matrimony/featured': { featured: '1', title: 'Featured Profiles' },
  '/admin/matrimony/verified': { verified: '1', title: 'Verified Profiles' },
  '/admin/matrimony/profiles': { title: 'Profile Listing' },
};

const MatrimonyProfileList = () => {
  const location = useLocation();
  const routeCfg = ROUTE_FILTERS[location.pathname] || ROUTE_FILTERS['/admin/matrimony/profiles'];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(routeCfg.status || '');

  const load = useCallback(() => {
    setLoading(true);
    const params = { limit: 100 };
    if (routeCfg.status) params.status = routeCfg.status;
    else if (status) params.status = status;
    if (routeCfg.featured) params.featured = '1';
    if (routeCfg.verified) params.verified = '1';
    if (q.trim()) params.q = q.trim();
    matrimonyService
      .getProfiles(params)
      .then(({ data }) => setRows(data.data || []))
      .catch(() => toast.error('Failed to load profiles'))
      .finally(() => setLoading(false));
  }, [routeCfg, status, q]);

  useEffect(() => {
    setStatus(routeCfg.status || '');
  }, [routeCfg.status, location.pathname]);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (id, nextStatus) => {
    let rejectionReason = '';
    if (nextStatus === 'REJECTED') {
      rejectionReason = window.prompt('Rejection reason:') || 'Does not meet guidelines';
    }
    try {
      await matrimonyService.reviewProfile(id, { status: nextStatus, rejectionReason });
      toast.success(`Marked ${nextStatus.toLowerCase()}`);
      load();
    } catch {
      toast.error('Action failed');
    }
  };

  const flags = async (id, data) => {
    try {
      await matrimonyService.toggleFlags(id, data);
      toast.success('Updated');
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Delete profile “${name}”? This cannot be undone.`)) return;
    try {
      await matrimonyService.deleteProfile(id);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const columns = [
    {
      key: 'fullName',
      header: 'Profile',
      sortable: true,
      render: (row) => (
        <div className="flex gap-3 items-center min-w-0">
          <NewsImage src={row.profilePhoto} seed={row._id} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate">{row.fullName}</p>
            <p className="text-xs text-slate-500">{row.profileId}{row.age ? ` · ${row.age} yrs` : ''}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'religion',
      header: 'Details',
      render: (row) => (
        <div className="text-xs text-slate-600">
          <p>{[row.religion, row.caste].filter(Boolean).join(' · ') || '—'}</p>
          <p className="text-slate-400">{[row.education, row.profession].filter(Boolean).join(' · ')}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <div className="space-y-1">
          <StatusBadge status={row.status} />
          <div className="flex flex-wrap gap-1 text-[10px]">
            {row.isVerified && <span className="text-emerald-700 font-semibold">Verified</span>}
            {row.isFeatured && <span className="text-teal-700 font-semibold">Featured</span>}
            {!row.isActive && <span className="text-slate-400">Inactive</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <Link to={`/admin/matrimony/view/${row._id}`} className="text-xs font-medium text-brand-700 px-2 py-1 rounded hover:bg-brand-50">
            View
          </Link>
          <Link to={`/admin/matrimony/edit/${row._id}`} className="text-xs font-medium text-slate-700 px-2 py-1 rounded hover:bg-slate-100">
            Edit
          </Link>
          <Link to={`/admin/matrimony/enquiries/${row._id}`} className="text-xs font-medium text-teal-700 px-2 py-1 rounded hover:bg-teal-50">
            Enquiry list
          </Link>
          {row.status !== 'APPROVED' && (
            <button type="button" onClick={() => review(row._id, 'APPROVED')} className="text-xs font-medium text-emerald-700 px-2 py-1 rounded hover:bg-emerald-50">
              Approve
            </button>
          )}
          {row.status !== 'REJECTED' && (
            <button type="button" onClick={() => review(row._id, 'REJECTED')} className="text-xs font-medium text-rose-700 px-2 py-1 rounded hover:bg-rose-50">
              Reject
            </button>
          )}
          <button type="button" onClick={() => flags(row._id, { isVerified: !row.isVerified })} className="text-xs font-medium text-slate-600 px-2 py-1 rounded hover:bg-slate-100">
            {row.isVerified ? 'Unverify' : 'Verify'}
          </button>
          <button type="button" onClick={() => flags(row._id, { isFeatured: !row.isFeatured })} className="text-xs font-medium text-slate-600 px-2 py-1 rounded hover:bg-slate-100">
            {row.isFeatured ? 'Unfeature' : 'Feature'}
          </button>
          <button type="button" onClick={() => flags(row._id, { isActive: !row.isActive })} className="text-xs font-medium text-slate-600 px-2 py-1 rounded hover:bg-slate-100">
            {row.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button type="button" onClick={() => remove(row._id, row.fullName)} className="text-xs font-medium text-rose-600 px-2 py-1 rounded hover:bg-rose-50">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title={routeCfg.title}
        subtitle="Search, filter and manage matrimony profiles"
        actionLabel="Add Profile"
        actionTo="/admin/matrimony/add"
      />
      <MatrimonyNav />

      <div className="flex flex-wrap gap-2 mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="flex gap-2 flex-1 min-w-[200px]"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, ID, mobile…"
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm"
          />
          <button type="submit" className="btn-primary text-sm">Search</button>
        </form>
        {!routeCfg.status && !routeCfg.featured && !routeCfg.verified && (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        )}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        searchKeys={['fullName', 'profileId', 'mobile', 'city']}
        emptyMessage="No profiles found"
        emptyAction={<Link to="/admin/matrimony/add" className="btn-primary text-sm">Add Profile</Link>}
      />
    </div>
  );
};

export default MatrimonyProfileList;
