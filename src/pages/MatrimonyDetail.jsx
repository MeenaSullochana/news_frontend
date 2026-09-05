import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { matrimonyService } from '../services/articleService';
import { useAuth } from '../context/AuthContext';
import NewsImage from '../components/NewsImage';
import { getImageUrl } from '../utils/images';

const LABEL = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
  never_married: 'Never Married',
  divorced: 'Divorced',
  widowed: 'Widowed',
  separated: 'Separated',
  awaiting_divorce: 'Awaiting Divorce',
  no: 'No',
  yes: 'Yes',
  occasionally: 'Occasionally',
};

const pretty = (v) => {
  if (v == null || v === '') return '';
  return LABEL[v] || String(v);
};

const Fact = ({ label, value, always = false }) => {
  const display = value === 0 ? '0' : value;
  if (!always && (display == null || display === '')) return null;
  return (
    <div className="py-2.5 border-b border-stone-100 last:border-0">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm text-slate-800 mt-0.5 break-words whitespace-pre-wrap">
        {display == null || display === '' ? '—' : display}
      </p>
    </div>
  );
};

const Section = ({ title, children }) => (
  <section className="bg-white rounded-2xl border border-stone-200 p-5">
    <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-stone-100">{title}</h2>
    <div className="grid sm:grid-cols-2 gap-x-6">{children}</div>
  </section>
);

const MatrimonyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [related, setRelated] = useState([]);
  const [contact, setContact] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({ enquirerName: '', enquirerPhone: '', comment: '' });
  const [sendingEnquiry, setSendingEnquiry] = useState(false);

  useEffect(() => {
    if (user) {
      setEnquiryForm((f) => ({
        ...f,
        enquirerName: f.enquirerName || user.name || '',
        enquirerPhone: f.enquirerPhone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    matrimonyService
      .getPublicProfile(id)
      .then(({ data }) => {
        setProfile(data.data);
        setRelated(data.related || []);
        setContact(data.contactVisibility || {});
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnquiry = async (e) => {
    e.preventDefault();
    setSendingEnquiry(true);
    try {
      await matrimonyService.sendEnquiry(id, enquiryForm);
      toast.success('Enquiry submitted successfully');
      setEnquiryForm({
        enquirerName: user?.name || '',
        enquirerPhone: user?.phone || '',
        comment: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit enquiry');
    } finally {
      setSendingEnquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="container-news py-10">
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container-news py-16 text-center">
        <p className="text-slate-700 font-medium">Profile not found or not published.</p>
        <Link to="/matrimony" className="text-brand-700 font-semibold mt-3 inline-block">
          ← Back to listing
        </Link>
      </div>
    );
  }

  const p = profile;
  const dob = p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('en-IN') : '';

  return (
    <div className="min-h-[50vh]">
      <Helmet>
        <title>
          {p.fullName} ({p.profileId}) | Matrimony
        </title>
        <meta
          name="description"
          content={`${p.fullName} — ${[p.age ? `${p.age} yrs` : '', p.education, p.profession, p.city]
            .filter(Boolean)
            .join(', ')}`}
        />
      </Helmet>

      <div className="border-b border-stone-200 bg-white/70">
        <div className="container-news py-8">
          <Link to="/matrimony" className="text-xs font-semibold text-brand-700 hover:underline">
            ← Matrimony Profiles
          </Link>
          <div className="mt-5 flex flex-col sm:flex-row gap-6">
            <NewsImage
              src={p.profilePhoto}
              seed={p._id}
              alt={p.fullName}
              className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl object-cover border border-stone-200 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{p.profileId}</p>
              <h1 className="text-3xl font-headline font-bold text-slate-900 mt-1 flex flex-wrap items-center gap-2">
                {p.fullName}
                {p.isVerified && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                )}
                {p.isFeatured && (
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                    Featured
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                {[
                  p.age ? `${p.age} years` : null,
                  pretty(p.gender),
                  p.height,
                  p.religion,
                  p.caste,
                  p.currentLocation || p.city,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {[p.education, p.profession, p.company].filter(Boolean).join(' · ')}
              </p>
              {(p.rasi || p.nakshatra) && (
                <p className="text-xs text-slate-400 mt-2">
                  {[p.rasi, p.nakshatra].filter(Boolean).join(' / ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-news py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          {p.aboutMe && (
            <section className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-2">About Me</h2>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{p.aboutMe}</p>
            </section>
          )}

          <Section title="Basic Details">
            <Fact label="Profile ID" value={p.profileId} always />
            <Fact label="Full Name" value={p.fullName} always />
            <Fact label="Gender" value={pretty(p.gender)} always />
            <Fact label="Date of Birth" value={dob} always />
            <Fact label="Age" value={p.age != null ? `${p.age} years` : ''} always />
            <Fact label="Birth Time" value={p.birthTime} always />
            <Fact label="Birth Place" value={p.birthPlace} always />
            <Fact label="Native Place" value={p.nativePlace} always />
            <Fact label="Current Location" value={p.currentLocation} always />
            <Fact label="Marital Status" value={pretty(p.maritalStatus)} always />
            <Fact label="Mother Tongue" value={p.motherTongue} always />
            <Fact label="Category" value={p.categoryName} />
          </Section>

          <Section title="Religion & Horoscope">
            <Fact label="Religion" value={p.religion} always />
            <Fact label="Caste" value={p.caste} always />
            <Fact label="Sub-Caste" value={p.subCaste} always />
            <Fact label="Rasi" value={p.rasi} always />
            <Fact label="Nakshatra" value={p.nakshatra} always />
            <Fact label="Lagnam" value={p.lagnam} always />
            <Fact label="Gothram" value={p.gothram} always />
            <Fact label="Birth Star" value={p.birthStar} always />
            <Fact label="Dosham" value={p.dosham} always />
          </Section>

          <Section title="Physical Details">
            <Fact label="Height" value={p.height} always />
            <Fact label="Weight" value={p.weight} always />
            <Fact label="Body Type" value={p.bodyType} always />
            <Fact label="Complexion" value={p.complexion} always />
            <Fact label="Physical Status" value={p.physicalStatus} always />
            <Fact label="Blood Group" value={p.bloodGroup} always />
          </Section>

          <Section title="Education & Career">
            <Fact label="Education / Qualification" value={p.education} always />
            <Fact label="College / University" value={p.college} always />
            <Fact label="Profession / Job" value={p.profession} always />
            <Fact label="Company / Organization" value={p.company} always />
            <Fact label="Job Location" value={p.jobLocation} always />
            <Fact label="Annual Salary / Income" value={p.annualIncome} always />
            <Fact label="Work Experience" value={p.workExperience} always />
          </Section>

          <Section title="Family Details">
            <Fact
              label="Father"
              value={[p.fatherName, p.fatherOccupation].filter(Boolean).join(' — ')}
              always
            />
            <Fact
              label="Mother"
              value={[p.motherName, p.motherOccupation].filter(Boolean).join(' — ')}
              always
            />
            <Fact label="Number of Brothers" value={p.numberOfBrothers} always />
            <Fact
              label="Brother"
              value={[p.brotherName, p.brotherMaritalStatus].filter(Boolean).join(' — ')}
            />
            <Fact label="Number of Sisters" value={p.numberOfSisters} always />
            <Fact
              label="Sister"
              value={[p.sisterName, p.sisterMaritalStatus].filter(Boolean).join(' — ')}
            />
            <Fact label="Family Type" value={p.familyType} always />
            <Fact label="Family Status" value={p.familyStatus} always />
            <Fact label="Family Location" value={p.familyLocation} always />
          </Section>

          <Section title="Partner Preferences">
            <Fact
              label="Preferred Age Range"
              value={[p.prefAgeMin, p.prefAgeMax].filter((v) => v != null && v !== '').join(' – ')}
              always
            />
            <Fact
              label="Preferred Height Range"
              value={[p.prefHeightMin, p.prefHeightMax].filter(Boolean).join(' – ')}
              always
            />
            <Fact label="Preferred Religion" value={p.prefReligion} always />
            <Fact label="Preferred Caste" value={p.prefCaste} always />
            <Fact label="Preferred Education" value={p.prefEducation} always />
            <Fact label="Preferred Profession" value={p.prefProfession} always />
            <Fact label="Preferred Location" value={p.prefLocation} always />
            <Fact label="Preferred Marital Status" value={pretty(p.prefMaritalStatus) || p.prefMaritalStatus} always />
            <div className="sm:col-span-2">
              <Fact label="Other Expectations" value={p.otherExpectations} always />
            </div>
          </Section>

          <Section title="Additional Information">
            <Fact label="Hobbies" value={p.hobbies} always />
            <Fact label="Interests" value={p.interests} always />
            <Fact label="Food Habits" value={p.foodHabits} always />
            <Fact label="Smoking" value={pretty(p.smoking)} always />
            <Fact label="Drinking" value={pretty(p.drinking)} always />
            <Fact label="Languages Known" value={p.languagesKnown} always />
            <Fact
              label="Profile Created"
              value={p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN') : ''}
            />
            <Fact
              label="Profile Updated"
              value={p.updatedAt ? new Date(p.updatedAt).toLocaleString('en-IN') : ''}
            />
          </Section>
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Location</h2>
            <Fact label="City" value={p.city} always />
            <Fact label="District" value={p.district} always />
            <Fact label="State" value={p.state} always />
            <Fact label="Country" value={p.country} always />
            <Fact label="Current Location" value={p.currentLocation} always />
            {contact.showAddress && <Fact label="Address" value={p.address} always />}
          </div>

          {(contact.showMobile || contact.showEmail || contact.showAlternateMobile) ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Contact</h2>
              {contact.showMobile && <Fact label="Mobile" value={p.mobile} always />}
              {contact.showAlternateMobile && <Fact label="Alternate Mobile" value={p.alternateMobile} always />}
              {contact.showEmail && <Fact label="Email" value={p.email} always />}
              <Fact label="Preferred Contact" value={p.preferredContactMethod} />
            </div>
          ) : (
            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 text-sm text-slate-600">
              Mobile, email and full address are private. Use the enquiry form below to express interest.
            </div>
          )}

          <form
            onSubmit={handleEnquiry}
            className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-sm"
          >
            <h2 className="text-sm font-bold text-slate-900">Send Enquiry</h2>
            <p className="text-xs text-slate-500">
              Express interest in this profile. {user?.role === 'MATRIMONY' ? 'Track your enquiries in the member portal.' : 'Log in as a matrimony member to track enquiries.'}
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                required
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm"
                value={enquiryForm.enquirerName}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, enquirerName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                required
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm"
                value={enquiryForm.enquirerPhone}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, enquirerPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Comment <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm"
                placeholder="Your message or interest details…"
                value={enquiryForm.comment}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, comment: e.target.value })}
              />
            </div>
            <button type="submit" disabled={sendingEnquiry} className="btn-primary w-full text-sm">
              {sendingEnquiry ? 'Submitting…' : 'Submit Enquiry'}
            </button>
          </form>

          {contact.allowHoroscopeDownload && p.horoscopeUrl && (
            <a
              href={getImageUrl(p.horoscopeUrl)}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary text-sm w-full text-center block"
            >
              View Horoscope / Jathagam
            </a>
          )}

          {Array.isArray(p.photos) && p.photos.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Photos</h2>
              <div className="grid grid-cols-2 gap-2">
                {p.photos.map((url) => (
                  <NewsImage
                    key={url}
                    src={url}
                    seed={p._id}
                    alt=""
                    className="w-full h-28 object-cover rounded-xl"
                  />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <div className="container-news pb-12">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Similar profiles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link
                key={r._id}
                to={`/matrimony/${r.profileId || r._id}`}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <NewsImage src={r.profilePhoto} seed={r._id} alt="" className="w-full h-36 object-cover" />
                <div className="p-3">
                  <p className="font-medium text-sm text-slate-900 truncate">{r.fullName}</p>
                  <p className="text-[11px] text-slate-500">
                    {[r.age ? `${r.age} yrs` : null, r.city].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatrimonyDetail;
