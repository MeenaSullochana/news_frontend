import { getImageUrl } from '../utils/images';

export const emptyMatrimonyForm = () => ({
  profileId: '',
  fullName: '',
  profilePhoto: '',
  photos: [],
  gender: 'female',
  dateOfBirth: '',
  birthTime: '',
  birthPlace: '',
  nativePlace: '',
  currentLocation: '',
  maritalStatus: 'never_married',
  motherTongue: 'Tamil',
  religion: 'Hindu',
  caste: '',
  subCaste: '',
  rasi: '',
  nakshatra: '',
  lagnam: '',
  gothram: '',
  birthStar: '',
  dosham: '',
  horoscopeUrl: '',
  height: '',
  weight: '',
  bodyType: '',
  complexion: '',
  physicalStatus: 'normal',
  bloodGroup: '',
  education: '',
  college: '',
  profession: '',
  company: '',
  jobLocation: '',
  annualIncome: '',
  workExperience: '',
  fatherName: '',
  fatherOccupation: '',
  motherName: '',
  motherOccupation: '',
  brotherName: '',
  brotherMaritalStatus: '',
  sisterName: '',
  sisterMaritalStatus: '',
  numberOfBrothers: 0,
  numberOfSisters: 0,
  familyType: '',
  familyStatus: '',
  familyLocation: '',
  address: '',
  city: '',
  district: '',
  state: 'Tamil Nadu',
  country: 'India',
  mobile: '',
  alternateMobile: '',
  email: '',
  preferredContactMethod: 'mobile',
  prefAgeMin: '',
  prefAgeMax: '',
  prefHeightMin: '',
  prefHeightMax: '',
  prefReligion: '',
  prefCaste: '',
  prefEducation: '',
  prefProfession: '',
  prefLocation: '',
  prefMaritalStatus: '',
  otherExpectations: '',
  aboutMe: '',
  hobbies: '',
  interests: '',
  foodHabits: '',
  smoking: 'no',
  drinking: 'no',
  languagesKnown: '',
  adminNotes: '',
  category: '',
  categoryName: '',
  isVisible: true,
});

/** @deprecated use emptyMatrimonyForm */
export const emptyMemberForm = emptyMatrimonyForm;

export const buildProfilePayload = (form, { includeProfileId = false } = {}) => {
  const payload = {
    ...form,
    category: form.category || null,
    prefAgeMin: form.prefAgeMin === '' ? undefined : Number(form.prefAgeMin),
    prefAgeMax: form.prefAgeMax === '' ? undefined : Number(form.prefAgeMax),
    numberOfBrothers: Number(form.numberOfBrothers) || 0,
    numberOfSisters: Number(form.numberOfSisters) || 0,
    photos: Array.isArray(form.photos) ? form.photos.filter(Boolean) : [],
  };
  if (includeProfileId && form.profileId) {
    payload.profileId = form.profileId;
  } else {
    delete payload.profileId;
  }
  delete payload.adminNotes;
  return payload;
};

const FIELD_LABELS = {
  fullName: 'Full Name',
  profilePhoto: 'Profile Photo',
  dateOfBirth: 'Date of Birth',
  birthTime: 'Birth Time',
  birthPlace: 'Birth Place',
  nativePlace: 'Native Place',
  currentLocation: 'Current Location',
  motherTongue: 'Mother Tongue',
  category: 'Category',
  categoryName: 'Category Name',
  religion: 'Religion',
  caste: 'Caste',
  subCaste: 'Sub-Caste',
  rasi: 'Rasi',
  nakshatra: 'Nakshatra',
  lagnam: 'Lagnam',
  gothram: 'Gothram',
  birthStar: 'Birth Star',
  dosham: 'Dosham',
  horoscopeUrl: 'Horoscope / Jathagam',
  height: 'Height',
  weight: 'Weight',
  bodyType: 'Body Type',
  complexion: 'Complexion',
  bloodGroup: 'Blood Group',
  education: 'Education',
  college: 'College',
  profession: 'Profession',
  company: 'Company',
  jobLocation: 'Job Location',
  annualIncome: 'Annual Income',
  workExperience: 'Work Experience',
  fatherName: "Father's Name",
  fatherOccupation: "Father's Occupation",
  motherName: "Mother's Name",
  motherOccupation: "Mother's Occupation",
  brotherName: "Brother's Name",
  brotherMaritalStatus: "Brother's Marital Status",
  sisterName: "Sister's Name",
  sisterMaritalStatus: "Sister's Marital Status",
  familyType: 'Family Type',
  familyStatus: 'Family Status',
  familyLocation: 'Family Location',
  address: 'Address',
  city: 'City',
  district: 'District',
  state: 'State',
  country: 'Country',
  mobile: 'Mobile Number',
  alternateMobile: 'Alternate Mobile',
  email: 'Email Address',
  prefAgeMin: 'Preferred Age Min',
  prefAgeMax: 'Preferred Age Max',
  prefHeightMin: 'Preferred Height Min',
  prefHeightMax: 'Preferred Height Max',
  prefReligion: 'Preferred Religion',
  prefCaste: 'Preferred Caste',
  prefEducation: 'Preferred Education',
  prefProfession: 'Preferred Profession',
  prefLocation: 'Preferred Location',
  prefMaritalStatus: 'Preferred Marital Status',
  otherExpectations: 'Other Expectations',
  aboutMe: 'About Me',
  hobbies: 'Hobbies',
  interests: 'Interests',
  foodHabits: 'Food Habits',
  languagesKnown: 'Languages Known',
};

const REQUIRED_TEXT_KEYS = Object.keys(FIELD_LABELS);

/** Returns first validation error message, or null if valid. */
export const validateMatrimonyProfileForm = (form) => {
  for (const key of REQUIRED_TEXT_KEYS) {
    const val = form[key];
    if (val === undefined || val === null || String(val).trim() === '') {
      return `${FIELD_LABELS[key]} is required`;
    }
  }
  if (!Array.isArray(form.photos) || form.photos.filter(Boolean).length === 0) {
    return 'At least one additional photo is required';
  }
  return null;
};

export const Field = ({ label, children, required }) => (
  <label className="block text-sm">
    <span className="text-slate-600 font-medium">
      {label}
      {required && <span className="text-rose-500"> *</span>}
    </span>
    <div className="mt-1">{children}</div>
  </label>
);

export const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white';

export const Section = ({ title, children }) => (
  <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 mb-4">
    <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">{title}</h2>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
  </section>
);

export const calcAge = (dob) => {
  if (!dob) return '';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
  return age;
};

export const MatrimonyProfileFields = ({
  form,
  set,
  categories,
  uploading,
  onPhoto,
  onHoroscope,
  onGalleryPhoto,
  onRemoveGalleryPhoto,
  onAddGalleryPhotoUrl,
  readOnlyProfileId = false,
  showProfileIdField = false,
  showAdminFields = false,
  requireAllFields = false,
}) => {
  const age = calcAge(form.dateOfBirth);
  const req = (also) => requireAllFields || also;

  return (
    <>
      {requireAllFields && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>All fields are required.</strong> Fill every section completely before submitting.
        </div>
      )}
      <Section title="Basic Details">
        {showProfileIdField && (
          <Field label="Matrimony / Profile ID">
            <input
              className={inputCls}
              value={form.profileId}
              onChange={(e) => set('profileId', e.target.value.toUpperCase())}
              readOnly={readOnlyProfileId}
              disabled={readOnlyProfileId}
              placeholder="Auto-generated if empty"
            />
          </Field>
        )}
        {!showProfileIdField && form.profileId && (
          <Field label="Profile ID">
            <input className={inputCls} value={form.profileId} readOnly disabled />
          </Field>
        )}
        <Field label="Full Name" required={req(true)}>
          <input
            className={inputCls}
            required={req(true)}
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
          />
        </Field>
        <Field label="Gender" required={req(true)}>
          <select className={inputCls} required={req(true)} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Date of Birth">
          <input
            type="date"
            className={inputCls}
            value={form.dateOfBirth}
            onChange={(e) => set('dateOfBirth', e.target.value)}
          />
        </Field>
        <Field label="Age (auto)">
          <input className={inputCls} value={age !== '' ? age : '—'} readOnly disabled />
        </Field>
        <Field label="Birth Time">
          <input className={inputCls} value={form.birthTime} onChange={(e) => set('birthTime', e.target.value)} placeholder="HH:MM" />
        </Field>
        <Field label="Birth Place">
          <input className={inputCls} value={form.birthPlace} onChange={(e) => set('birthPlace', e.target.value)} />
        </Field>
        <Field label="Native Place">
          <input className={inputCls} value={form.nativePlace} onChange={(e) => set('nativePlace', e.target.value)} />
        </Field>
        <Field label="Current Location">
          <input className={inputCls} value={form.currentLocation} onChange={(e) => set('currentLocation', e.target.value)} />
        </Field>
        <Field label="Marital Status">
          <select className={inputCls} value={form.maritalStatus} onChange={(e) => set('maritalStatus', e.target.value)}>
            <option value="never_married">Never Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
            <option value="separated">Separated</option>
            <option value="awaiting_divorce">Awaiting Divorce</option>
          </select>
        </Field>
        <Field label="Mother Tongue">
          <input className={inputCls} value={form.motherTongue} onChange={(e) => set('motherTongue', e.target.value)} />
        </Field>
        <Field label="Category">
          <select className={inputCls} value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Category Name (optional label)">
          <input
            className={inputCls}
            value={form.categoryName}
            onChange={(e) => set('categoryName', e.target.value)}
            placeholder="Custom category label if needed"
          />
        </Field>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Profile Photo">
            <div className="flex flex-wrap items-center gap-4">
              {form.profilePhoto && (
                <img
                  src={getImageUrl(form.profilePhoto)}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover border border-slate-200"
                />
              )}
              <input type="file" accept="image/*" onChange={onPhoto} disabled={uploading} className="text-sm" />
              <input
                className={`${inputCls} max-w-md`}
                value={form.profilePhoto}
                onChange={(e) => set('profilePhoto', e.target.value)}
                placeholder="Or paste image URL"
              />
            </div>
          </Field>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Additional Photos">
            <div className="space-y-3">
              {Array.isArray(form.photos) && form.photos.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {form.photos.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative">
                      <img
                        src={getImageUrl(url)}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveGalleryPhoto?.(index)}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white text-xs leading-none"
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <input type="file" accept="image/*" onChange={onGalleryPhoto} disabled={uploading} className="text-sm" />
                {onAddGalleryPhotoUrl && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <input
                      className={`${inputCls} max-w-xs`}
                      id="gallery-url-input"
                      placeholder="Paste photo URL"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          onAddGalleryPhotoUrl(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn-secondary text-xs py-2 px-3"
                      onClick={() => {
                        const el = document.getElementById('gallery-url-input');
                        if (el?.value) {
                          onAddGalleryPhotoUrl(el.value);
                          el.value = '';
                        }
                      }}
                    >
                      Add URL
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Field>
        </div>
      </Section>

      <Section title="Religion & Horoscope">
        <Field label="Religion"><input className={inputCls} value={form.religion} onChange={(e) => set('religion', e.target.value)} /></Field>
        <Field label="Caste"><input className={inputCls} value={form.caste} onChange={(e) => set('caste', e.target.value)} /></Field>
        <Field label="Sub-Caste"><input className={inputCls} value={form.subCaste} onChange={(e) => set('subCaste', e.target.value)} /></Field>
        <Field label="Rasi"><input className={inputCls} value={form.rasi} onChange={(e) => set('rasi', e.target.value)} /></Field>
        <Field label="Nakshatra"><input className={inputCls} value={form.nakshatra} onChange={(e) => set('nakshatra', e.target.value)} /></Field>
        <Field label="Lagnam"><input className={inputCls} value={form.lagnam} onChange={(e) => set('lagnam', e.target.value)} /></Field>
        <Field label="Gothram"><input className={inputCls} value={form.gothram} onChange={(e) => set('gothram', e.target.value)} /></Field>
        <Field label="Birth Star"><input className={inputCls} value={form.birthStar} onChange={(e) => set('birthStar', e.target.value)} /></Field>
        <Field label="Dosham"><input className={inputCls} value={form.dosham} onChange={(e) => set('dosham', e.target.value)} /></Field>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Horoscope / Jathagam Upload">
            <div className="flex flex-wrap items-center gap-3">
              <input type="file" accept="image/*,.pdf" onChange={onHoroscope} disabled={uploading} className="text-sm" />
              <input
                className={`${inputCls} max-w-md`}
                value={form.horoscopeUrl}
                onChange={(e) => set('horoscopeUrl', e.target.value)}
                placeholder="Or paste document URL"
              />
              {form.horoscopeUrl && (
                <a href={getImageUrl(form.horoscopeUrl)} target="_blank" rel="noreferrer" className="text-sm text-brand-700 font-medium">
                  View file
                </a>
              )}
            </div>
          </Field>
        </div>
      </Section>

      <Section title="Physical Details">
        <Field label="Height"><input className={inputCls} value={form.height} onChange={(e) => set('height', e.target.value)} placeholder="e.g. 5'6&quot;" /></Field>
        <Field label="Weight"><input className={inputCls} value={form.weight} onChange={(e) => set('weight', e.target.value)} /></Field>
        <Field label="Body Type"><input className={inputCls} value={form.bodyType} onChange={(e) => set('bodyType', e.target.value)} /></Field>
        <Field label="Complexion"><input className={inputCls} value={form.complexion} onChange={(e) => set('complexion', e.target.value)} /></Field>
        <Field label="Physical Status"><input className={inputCls} value={form.physicalStatus} onChange={(e) => set('physicalStatus', e.target.value)} /></Field>
        <Field label="Blood Group"><input className={inputCls} value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)} /></Field>
      </Section>

      <Section title="Education & Career">
        <Field label="Education / Qualification"><input className={inputCls} value={form.education} onChange={(e) => set('education', e.target.value)} /></Field>
        <Field label="College / University"><input className={inputCls} value={form.college} onChange={(e) => set('college', e.target.value)} /></Field>
        <Field label="Profession / Job"><input className={inputCls} value={form.profession} onChange={(e) => set('profession', e.target.value)} /></Field>
        <Field label="Company / Organization"><input className={inputCls} value={form.company} onChange={(e) => set('company', e.target.value)} /></Field>
        <Field label="Job Location"><input className={inputCls} value={form.jobLocation} onChange={(e) => set('jobLocation', e.target.value)} /></Field>
        <Field label="Annual Salary / Income"><input className={inputCls} value={form.annualIncome} onChange={(e) => set('annualIncome', e.target.value)} /></Field>
        <Field label="Work Experience"><input className={inputCls} value={form.workExperience} onChange={(e) => set('workExperience', e.target.value)} /></Field>
      </Section>

      <Section title="Family Details">
        <Field label="Father's Name"><input className={inputCls} value={form.fatherName} onChange={(e) => set('fatherName', e.target.value)} /></Field>
        <Field label="Father's Occupation"><input className={inputCls} value={form.fatherOccupation} onChange={(e) => set('fatherOccupation', e.target.value)} /></Field>
        <Field label="Mother's Name"><input className={inputCls} value={form.motherName} onChange={(e) => set('motherName', e.target.value)} /></Field>
        <Field label="Mother's Occupation"><input className={inputCls} value={form.motherOccupation} onChange={(e) => set('motherOccupation', e.target.value)} /></Field>
        <Field label="Brother's Name"><input className={inputCls} value={form.brotherName} onChange={(e) => set('brotherName', e.target.value)} /></Field>
        <Field label="Brother's Marital Status"><input className={inputCls} value={form.brotherMaritalStatus} onChange={(e) => set('brotherMaritalStatus', e.target.value)} /></Field>
        <Field label="Sister's Name"><input className={inputCls} value={form.sisterName} onChange={(e) => set('sisterName', e.target.value)} /></Field>
        <Field label="Sister's Marital Status"><input className={inputCls} value={form.sisterMaritalStatus} onChange={(e) => set('sisterMaritalStatus', e.target.value)} /></Field>
        <Field label="Number of Brothers"><input type="number" min="0" className={inputCls} value={form.numberOfBrothers} onChange={(e) => set('numberOfBrothers', e.target.value)} /></Field>
        <Field label="Number of Sisters"><input type="number" min="0" className={inputCls} value={form.numberOfSisters} onChange={(e) => set('numberOfSisters', e.target.value)} /></Field>
        <Field label="Family Type"><input className={inputCls} value={form.familyType} onChange={(e) => set('familyType', e.target.value)} placeholder="Joint / Nuclear" /></Field>
        <Field label="Family Status"><input className={inputCls} value={form.familyStatus} onChange={(e) => set('familyStatus', e.target.value)} /></Field>
        <Field label="Family Location"><input className={inputCls} value={form.familyLocation} onChange={(e) => set('familyLocation', e.target.value)} /></Field>
      </Section>

      <Section title="Contact Details (private by default)">
        <Field label="Address"><input className={inputCls} value={form.address} onChange={(e) => set('address', e.target.value)} /></Field>
        <Field label="City"><input className={inputCls} value={form.city} onChange={(e) => set('city', e.target.value)} /></Field>
        <Field label="District"><input className={inputCls} value={form.district} onChange={(e) => set('district', e.target.value)} /></Field>
        <Field label="State"><input className={inputCls} value={form.state} onChange={(e) => set('state', e.target.value)} /></Field>
        <Field label="Country"><input className={inputCls} value={form.country} onChange={(e) => set('country', e.target.value)} /></Field>
        <Field label="Mobile Number"><input className={inputCls} value={form.mobile} onChange={(e) => set('mobile', e.target.value)} /></Field>
        <Field label="Alternate Mobile"><input className={inputCls} value={form.alternateMobile} onChange={(e) => set('alternateMobile', e.target.value)} /></Field>
        <Field label="Email Address"><input type="email" className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} /></Field>
        <Field label="Preferred Contact Method">
          <select className={inputCls} value={form.preferredContactMethod} onChange={(e) => set('preferredContactMethod', e.target.value)}>
            <option value="mobile">Mobile</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </Field>
      </Section>

      <Section title="Partner Preferences">
        <Field label="Preferred Age Min"><input type="number" className={inputCls} value={form.prefAgeMin} onChange={(e) => set('prefAgeMin', e.target.value)} /></Field>
        <Field label="Preferred Age Max"><input type="number" className={inputCls} value={form.prefAgeMax} onChange={(e) => set('prefAgeMax', e.target.value)} /></Field>
        <Field label="Preferred Height Min"><input className={inputCls} value={form.prefHeightMin} onChange={(e) => set('prefHeightMin', e.target.value)} /></Field>
        <Field label="Preferred Height Max"><input className={inputCls} value={form.prefHeightMax} onChange={(e) => set('prefHeightMax', e.target.value)} /></Field>
        <Field label="Preferred Religion"><input className={inputCls} value={form.prefReligion} onChange={(e) => set('prefReligion', e.target.value)} /></Field>
        <Field label="Preferred Caste"><input className={inputCls} value={form.prefCaste} onChange={(e) => set('prefCaste', e.target.value)} /></Field>
        <Field label="Preferred Education"><input className={inputCls} value={form.prefEducation} onChange={(e) => set('prefEducation', e.target.value)} /></Field>
        <Field label="Preferred Profession"><input className={inputCls} value={form.prefProfession} onChange={(e) => set('prefProfession', e.target.value)} /></Field>
        <Field label="Preferred Location"><input className={inputCls} value={form.prefLocation} onChange={(e) => set('prefLocation', e.target.value)} /></Field>
        <Field label="Preferred Marital Status"><input className={inputCls} value={form.prefMaritalStatus} onChange={(e) => set('prefMaritalStatus', e.target.value)} /></Field>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Other Expectations">
            <textarea className={inputCls} rows={3} value={form.otherExpectations} onChange={(e) => set('otherExpectations', e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Additional Information">
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="About Me">
            <textarea className={inputCls} rows={3} value={form.aboutMe} onChange={(e) => set('aboutMe', e.target.value)} />
          </Field>
        </div>
        <Field label="Hobbies"><input className={inputCls} value={form.hobbies} onChange={(e) => set('hobbies', e.target.value)} /></Field>
        <Field label="Interests"><input className={inputCls} value={form.interests} onChange={(e) => set('interests', e.target.value)} /></Field>
        <Field label="Food Habits"><input className={inputCls} value={form.foodHabits} onChange={(e) => set('foodHabits', e.target.value)} /></Field>
        <Field label="Smoking">
          <select className={inputCls} value={form.smoking} onChange={(e) => set('smoking', e.target.value)}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
            <option value="occasionally">Occasionally</option>
          </select>
        </Field>
        <Field label="Drinking">
          <select className={inputCls} value={form.drinking} onChange={(e) => set('drinking', e.target.value)}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
            <option value="occasionally">Occasionally</option>
          </select>
        </Field>
        <Field label="Languages Known"><input className={inputCls} value={form.languagesKnown} onChange={(e) => set('languagesKnown', e.target.value)} /></Field>
        {showAdminFields && (
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Admin Notes">
              <textarea className={inputCls} rows={2} value={form.adminNotes} onChange={(e) => set('adminNotes', e.target.value)} />
            </Field>
          </div>
        )}
        <Field label="Visible on website">
          <select className={inputCls} value={form.isVisible ? '1' : '0'} onChange={(e) => set('isVisible', e.target.value === '1')}>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </Field>
      </Section>
    </>
  );
};

export const createMatrimonyUploadHandlers = ({
  uploadPhoto,
  uploadDocument,
  setForm,
  setUploading,
  onUploadError,
}) => {
  const uploadFile = async (file, asDocument = false) => {
    if (!file) return null;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const uploadFn = asDocument ? uploadDocument : uploadPhoto;
      const { data } = await uploadFn(fd);
      return data.data?.url || null;
    } catch {
      onUploadError?.();
      return null;
    } finally {
      setUploading(false);
    }
  };

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return {
    handlePhoto: async (e) => {
      const url = await uploadFile(e.target.files?.[0]);
      if (url) set('profilePhoto', url);
      e.target.value = '';
    },
    handleHoroscope: async (e) => {
      const url = await uploadFile(e.target.files?.[0], true);
      if (url) set('horoscopeUrl', url);
      e.target.value = '';
    },
    handleGalleryPhoto: async (e) => {
      const url = await uploadFile(e.target.files?.[0]);
      if (url) setForm((f) => ({ ...f, photos: [...(f.photos || []), url] }));
      e.target.value = '';
    },
    handleRemoveGalleryPhoto: (index) => {
      setForm((f) => ({
        ...f,
        photos: (f.photos || []).filter((_, i) => i !== index),
      }));
    },
    handleAddGalleryPhotoUrl: (url) => {
      const trimmed = String(url || '').trim();
      if (!trimmed) return;
      setForm((f) => ({ ...f, photos: [...(f.photos || []), trimmed] }));
    },
  };
};

export const emptyMemberLoginForm = () => ({
  memberName: '',
  memberLoginEmail: '',
  memberPassword: '',
  memberPhone: '',
  memberCity: '',
  newPassword: '',
});

export const MatrimonyMemberLoginSection = ({
  isEdit,
  login,
  setLogin,
  onSyncProfile,
}) => {
  const set = (key, value) => setLogin((f) => ({ ...f, [key]: value }));

  const sync = (key, value) => {
    if (onSyncProfile) onSyncProfile(key, value);
  };

  return (
    <Section title="Account Login Details">
      <Field label="Your Name" required>
        <input
          required
          className={inputCls}
          value={login.memberName}
          onChange={(e) => {
            const value = e.target.value;
            set('memberName', value);
            sync('fullName', value);
          }}
        />
      </Field>
      <Field label="Login Email" required>
        <input
          required
          type="email"
          autoComplete="email"
          className={inputCls}
          value={login.memberLoginEmail}
          onChange={(e) => {
            set('memberLoginEmail', e.target.value);
            sync('email', e.target.value);
          }}
        />
      </Field>
      {!isEdit ? (
        <Field label="Password (min 6)" required>
          <input
            required
            type="password"
            autoComplete="new-password"
            minLength={6}
            className={inputCls}
            value={login.memberPassword}
            onChange={(e) => set('memberPassword', e.target.value)}
          />
        </Field>
      ) : (
        <Field label="New Password (min 6)">
          <input
            type="password"
            autoComplete="new-password"
            minLength={6}
            className={inputCls}
            value={login.newPassword}
            onChange={(e) => set('newPassword', e.target.value)}
            placeholder="Leave blank to keep current password"
          />
        </Field>
      )}
      <Field label="Mobile Number" required>
        <input
          required
          className={inputCls}
          value={login.memberPhone}
          onChange={(e) => {
            set('memberPhone', e.target.value);
            sync('mobile', e.target.value);
          }}
        />
      </Field>
      <Field label="City" required>
        <input
          required
          className={inputCls}
          value={login.memberCity}
          onChange={(e) => {
            set('memberCity', e.target.value);
            sync('city', e.target.value);
          }}
        />
      </Field>
    </Section>
  );
};
