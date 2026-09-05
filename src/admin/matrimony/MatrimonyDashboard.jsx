import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { matrimonyService } from '../../services/articleService';
import AdminPageHeader, { StatusBadge } from '../AdminPageHeader';
import MatrimonyNav from './MatrimonyNav';
import NewsImage from '../../components/NewsImage';

const Stat = ({ label, value, to, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-slate-50 border-slate-200 text-slate-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    rose: 'bg-rose-50 border-rose-200 text-rose-900',
    teal: 'bg-teal-50 border-teal-200 text-teal-900',
  };
  const inner = (
    <div className={`rounded-2xl border p-4 ${tones[tone] || tones.slate}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value ?? 0}</p>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
};

const MatrimonyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    matrimonyService
      .getDashboard()
      .then(({ data: res }) => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats || {};

  return (
    <div>
      <AdminPageHeader
        title="Matrimony"
        subtitle="Manage profiles, approvals, verification and visibility"
        actionLabel="Add Profile"
        actionTo="/admin/matrimony/add"
      />
      <MatrimonyNav />

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <Stat label="Total" value={s.total} to="/admin/matrimony/profiles" />
            <Stat label="Pending" value={s.pending} to="/admin/matrimony/pending" tone="amber" />
            <Stat label="Approved" value={s.approved} to="/admin/matrimony/approved" tone="green" />
            <Stat label="Rejected" value={s.rejected} to="/admin/matrimony/rejected" tone="rose" />
            <Stat label="Featured" value={s.featured} to="/admin/matrimony/featured" tone="teal" />
            <Stat label="Verified" value={s.verified} to="/admin/matrimony/verified" tone="teal" />
            <Stat label="Inactive" value={s.inactive} />
          </div>

          <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent profiles</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {!data?.recent?.length ? (
              <p className="p-6 text-sm text-slate-500">No profiles yet. Add your first profile.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.recent.map((p) => (
                  <li key={p._id}>
                    <Link
                      to={`/admin/matrimony/view/${p._id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                    >
                      <NewsImage
                        src={p.profilePhoto}
                        seed={p._id}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 truncate">{p.fullName}</p>
                        <p className="text-xs text-slate-500">
                          {p.profileId}
                          {p.age ? ` · ${p.age} yrs` : ''}
                        </p>
                      </div>
                      <StatusBadge status={p.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MatrimonyDashboard;
