import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { matrimonyService } from '../services/articleService';
import { useAuth } from '../context/AuthContext';

const statusTone = {
  PENDING: 'bg-amber-50 border-amber-200 text-amber-900',
  APPROVED: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  REJECTED: 'bg-rose-50 border-rose-200 text-rose-900',
  INACTIVE: 'bg-slate-50 border-slate-200 text-slate-700',
};

const MatrimonyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    matrimonyService
      .getMemberProfile()
      .then(({ data }) => setProfile(data.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirmDelete = async () => {
    if (!profile) return;

    setDeleting(true);
    try {
      await matrimonyService.deleteMemberProfile();
      await logout();
      toast.success('Profile deleted successfully.');
      setDeleteOpen(false);
      navigate('/matrimony/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete profile');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="skeleton h-64 rounded-2xl" />;
  }

  const hasProfile = Boolean(profile);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name}</h1>
          <p className="text-sm text-slate-500">Create or update your full matrimony profile</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/matrimony/member/profile" className="btn-primary text-sm">
            {hasProfile ? 'Edit Profile' : '+ Create Profile'}
          </Link>
          {hasProfile && (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              disabled={deleting}
              className="text-sm py-2 px-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100 disabled:opacity-50"
            >
              Delete Profile
            </button>
          )}
        </div>
      </div>

      {!hasProfile && (
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 text-sm text-teal-900">
          <p className="font-semibold">No profile yet</p>
          <p className="mt-1 text-teal-800">
            Fill in all details — basic info, horoscope, education, family, contact and partner preferences.
            Your profile will appear on the public listing after admin approval.
          </p>
          <Link to="/matrimony/member/profile" className="inline-block mt-3 font-semibold underline">
            Start your profile →
          </Link>
        </div>
      )}

      {hasProfile && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Profile ID</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{profile.profileId}</p>
            <p className="text-sm text-slate-600 mt-2">{profile.fullName}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Status</p>
            <span className={`inline-block mt-2 text-sm font-semibold px-3 py-1 rounded-lg border ${statusTone[profile.status] || statusTone.PENDING}`}>
              {profile.status}
            </span>
            {profile.status === 'REJECTED' && profile.rejectionReason && (
              <p className="text-sm text-rose-700 mt-3">{profile.rejectionReason}</p>
            )}
          </div>
        </div>
      )}

      {hasProfile && profile.status === 'APPROVED' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-4 text-sm">
          Your profile is live.{' '}
          <a
            href={`/matrimony/${profile.profileId}`}
            target="_blank"
            rel="noreferrer"
            className="text-teal-700 font-semibold hover:underline"
          >
            View public profile →
          </a>
        </div>
      )}

      {hasProfile && profile.status === 'PENDING' && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-900">
          Your profile is under admin review. You will be visible on the matrimony page once approved.
        </div>
      )}

      {deleteOpen && profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteOpen(false)}
            aria-hidden
          />
          <div
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-stone-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-profile-title"
          >
            <h2 id="delete-profile-title" className="text-lg font-bold text-slate-900">
              Delete Profile
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Profile: <strong>{profile.profileId}</strong> — {profile.fullName}
            </p>

            <div className="mt-4 rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-900 space-y-2">
              <p className="font-semibold">Please read before you continue:</p>
              <ul className="list-disc list-inside space-y-1 text-rose-800">
                <li>Your matrimony profile will be permanently removed.</li>
                <li>It will no longer appear on the public matrimony listing.</li>
                <li>All profile photos and details will be deleted.</li>
                <li>You will be logged out after deletion.</li>
                <li>You can register again and create a new profile later.</li>
              </ul>
            </div>

            <p className="text-xs text-slate-500 mt-4">
              This action cannot be undone. Click <strong>Confirm Delete</strong> only if you are sure.
            </p>

            <div className="flex flex-wrap gap-2 mt-6">
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 min-w-[140px] text-sm py-2.5 px-4 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Confirm Delete'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
                className="btn-secondary text-sm py-2.5 px-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatrimonyDashboard;
