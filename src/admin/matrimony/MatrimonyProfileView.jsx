import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { matrimonyService } from '../../services/articleService';
import AdminPageHeader, { StatusBadge } from '../AdminPageHeader';
import MatrimonyNav from './MatrimonyNav';
import NewsImage from '../../components/NewsImage';
import { getImageUrl } from '../../utils/images';

const Row = ({ label, value }) => (
  <div className="py-2 border-b border-slate-50 last:border-0">
    <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
    <p className="text-sm text-slate-800 mt-0.5 break-words">{value || '—'}</p>
  </div>
);

const Block = ({ title, children }) => (
  <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 mb-4">
    <h2 className="text-sm font-bold text-slate-900 mb-3">{title}</h2>
    <div className="grid sm:grid-cols-2 gap-x-6">{children}</div>
  </section>
);

const MatrimonyProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    matrimonyService
      .getProfile(id)
      .then(({ data }) => setP(data.data))
      .catch(() => {
        toast.error('Not found');
        navigate('/admin/matrimony/profiles');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const review = async (status) => {
    let rejectionReason = '';
    if (status === 'REJECTED') {
      rejectionReason = window.prompt('Rejection reason:') || 'Does not meet guidelines';
    }
    try {
      await matrimonyService.reviewProfile(id, { status, rejectionReason });
      toast.success(`Marked ${status.toLowerCase()}`);
      load();
    } catch {
      toast.error('Failed');
    }
  };

  const flags = async (data) => {
    try {
      await matrimonyService.toggleFlags(id, data);
      toast.success('Updated');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete “${p.fullName}”?`)) return;
    try {
      await matrimonyService.deleteProfile(id);
      toast.success('Deleted');
      navigate('/admin/matrimony/profiles');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading || !p) {
    return (
      <div>
        <AdminPageHeader title="View Profile" />
        <MatrimonyNav />
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader title={p.fullName} subtitle={p.profileId}>
        <Link to={`/admin/matrimony/edit/${id}`} className="btn-primary text-sm py-2.5 px-4">Edit</Link>
        <Link to={`/admin/matrimony/enquiries/${id}`} className="btn-secondary text-sm py-2.5 px-4">Enquiry list</Link>
        <button type="button" onClick={remove} className="btn-secondary text-sm py-2.5 px-4 text-rose-700">Delete</button>
      </AdminPageHeader>
      <MatrimonyNav />

      <div className="flex flex-wrap items-start gap-4 mb-6">
        <NewsImage src={p.profilePhoto} seed={p._id} alt="" className="w-28 h-28 rounded-2xl object-cover border border-slate-200" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <StatusBadge status={p.status} />
            {p.isVerified && <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Verified</span>}
            {p.isFeatured && <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">Featured</span>}
            <StatusBadge active={p.isActive} />
          </div>
          <p className="text-sm text-slate-600">
            {[p.age ? `${p.age} years` : null, p.gender, p.city || p.currentLocation].filter(Boolean).join(' · ')}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {p.status !== 'APPROVED' && (
              <button type="button" onClick={() => review('APPROVED')} className="btn-primary text-xs py-2 px-3">Approve</button>
            )}
            {p.status !== 'REJECTED' && (
              <button type="button" onClick={() => review('REJECTED')} className="btn-secondary text-xs py-2 px-3">Reject</button>
            )}
            <button type="button" onClick={() => flags({ isVerified: !p.isVerified })} className="btn-secondary text-xs py-2 px-3">
              {p.isVerified ? 'Unverify' : 'Verify'}
            </button>
            <button type="button" onClick={() => flags({ isFeatured: !p.isFeatured })} className="btn-secondary text-xs py-2 px-3">
              {p.isFeatured ? 'Unfeature' : 'Feature'}
            </button>
            <button type="button" onClick={() => flags({ isActive: !p.isActive })} className="btn-secondary text-xs py-2 px-3">
              {p.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button type="button" onClick={() => flags({ isVisible: !p.isVisible })} className="btn-secondary text-xs py-2 px-3">
              {p.isVisible ? 'Hide' : 'Show'}
            </button>
            {p.status === 'APPROVED' && (
              <a href={`/matrimony/${p.profileId}`} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-2 px-3">
                View on website
              </a>
            )}
          </div>
        </div>
      </div>

      <Block title="Basic">
        <Row label="Profile ID" value={p.profileId} />
        <Row label="DOB" value={p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : ''} />
        <Row label="Birth Time / Place" value={[p.birthTime, p.birthPlace].filter(Boolean).join(' · ')} />
        <Row label="Native / Current" value={[p.nativePlace, p.currentLocation].filter(Boolean).join(' · ')} />
        <Row label="Marital Status" value={p.maritalStatus} />
        <Row label="Mother Tongue" value={p.motherTongue} />
      </Block>

      <Block title="Religion & Horoscope">
        <Row label="Religion / Caste" value={[p.religion, p.caste, p.subCaste].filter(Boolean).join(' · ')} />
        <Row label="Rasi / Nakshatra" value={[p.rasi, p.nakshatra].filter(Boolean).join(' · ')} />
        <Row label="Lagnam / Gothram" value={[p.lagnam, p.gothram].filter(Boolean).join(' · ')} />
        <Row label="Birth Star / Dosham" value={[p.birthStar, p.dosham].filter(Boolean).join(' · ')} />
        <Row
          label="Horoscope"
          value={
            p.horoscopeUrl ? (
              <a href={getImageUrl(p.horoscopeUrl)} target="_blank" rel="noreferrer" className="text-brand-700 font-medium">
                Open document
              </a>
            ) : (
              '—'
            )
          }
        />
      </Block>

      <Block title="Physical">
        <Row label="Height / Weight" value={[p.height, p.weight].filter(Boolean).join(' · ')} />
        <Row label="Body / Complexion" value={[p.bodyType, p.complexion].filter(Boolean).join(' · ')} />
        <Row label="Physical Status" value={p.physicalStatus} />
        <Row label="Blood Group" value={p.bloodGroup} />
      </Block>

      <Block title="Education & Career">
        <Row label="Education" value={p.education} />
        <Row label="College" value={p.college} />
        <Row label="Profession" value={p.profession} />
        <Row label="Company / Job Location" value={[p.company, p.jobLocation].filter(Boolean).join(' · ')} />
        <Row label="Income / Experience" value={[p.annualIncome, p.workExperience].filter(Boolean).join(' · ')} />
      </Block>

      <Block title="Family">
        <Row label="Father" value={[p.fatherName, p.fatherOccupation].filter(Boolean).join(' — ')} />
        <Row label="Mother" value={[p.motherName, p.motherOccupation].filter(Boolean).join(' — ')} />
        <Row label="Brothers" value={`${p.numberOfBrothers || 0}${p.brotherName ? ` (${p.brotherName}, ${p.brotherMaritalStatus})` : ''}`} />
        <Row label="Sisters" value={`${p.numberOfSisters || 0}${p.sisterName ? ` (${p.sisterName}, ${p.sisterMaritalStatus})` : ''}`} />
        <Row label="Family Type / Status" value={[p.familyType, p.familyStatus].filter(Boolean).join(' · ')} />
        <Row label="Family Location" value={p.familyLocation} />
      </Block>

      <Block title="Contact (admin only)">
        <Row label="Address" value={p.address} />
        <Row label="City / District" value={[p.city, p.district].filter(Boolean).join(', ')} />
        <Row label="State / Country" value={[p.state, p.country].filter(Boolean).join(', ')} />
        <Row label="Mobile" value={p.mobile} />
        <Row label="Alternate Mobile" value={p.alternateMobile} />
        <Row label="Email" value={p.email} />
        <Row label="Preferred Contact" value={p.preferredContactMethod} />
      </Block>

      <Block title="Partner Preferences">
        <Row label="Age Range" value={[p.prefAgeMin, p.prefAgeMax].filter((v) => v != null && v !== '').join(' – ')} />
        <Row label="Height Range" value={[p.prefHeightMin, p.prefHeightMax].filter(Boolean).join(' – ')} />
        <Row label="Religion / Caste" value={[p.prefReligion, p.prefCaste].filter(Boolean).join(' · ')} />
        <Row label="Education / Profession" value={[p.prefEducation, p.prefProfession].filter(Boolean).join(' · ')} />
        <Row label="Location / Marital" value={[p.prefLocation, p.prefMaritalStatus].filter(Boolean).join(' · ')} />
        <Row label="Other Expectations" value={p.otherExpectations} />
      </Block>

      <Block title="Additional">
        <Row label="About Me" value={p.aboutMe} />
        <Row label="Hobbies / Interests" value={[p.hobbies, p.interests].filter(Boolean).join(' · ')} />
        <Row label="Food / Smoking / Drinking" value={[p.foodHabits, p.smoking, p.drinking].filter(Boolean).join(' · ')} />
        <Row label="Languages" value={p.languagesKnown} />
        <Row label="Admin Notes" value={p.adminNotes} />
        <Row label="Created" value={p.createdAt ? new Date(p.createdAt).toLocaleString() : ''} />
        <Row label="Updated" value={p.updatedAt ? new Date(p.updatedAt).toLocaleString() : ''} />
      </Block>

      {p.history?.length > 0 && (
        <Block title="Profile History">
          <div className="sm:col-span-2 space-y-2">
            {p.history.map((h, i) => (
              <div key={`${h.at}-${i}`} className="text-sm border-b border-slate-50 pb-2">
                <p className="font-medium text-slate-800 capitalize">{h.action}</p>
                {h.note && <p className="text-slate-600 text-xs mt-0.5">{h.note}</p>}
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {h.at ? new Date(h.at).toLocaleString() : ''}
                  {h.by?.name ? ` · ${h.by.name}` : ''}
                </p>
              </div>
            ))}
          </div>
        </Block>
      )}
    </div>
  );
};

export default MatrimonyProfileView;
