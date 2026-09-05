import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { matrimonyService } from '../services/articleService';
import {
  emptyMatrimonyForm,
  MatrimonyProfileFields,
  buildProfilePayload,
  validateMatrimonyProfileForm,
  Section,
  Field,
  inputCls,
} from './matrimonyFormShared';

const emptyAccount = () => ({ name: '', email: '', password: '', phone: '', city: '' });

const MatrimonyRegister = () => {
  const { user, registerMatrimonyMember } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState(emptyAccount());
  const [form, setForm] = useState(emptyMatrimonyForm());
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingUploads, setPendingUploads] = useState([]);

  if (user) {
    return <Navigate to={user.role === 'MATRIMONY' ? '/matrimony/member' : '/admin'} replace />;
  }

  useEffect(() => {
    matrimonyService
      .getPublicCategories()
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => {});
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const queueFile = (file, target) => {
    if (!file) return;
    setPendingUploads((p) => [...p, { file, target }]);
    const preview = URL.createObjectURL(file);
    if (target === 'profilePhoto') set('profilePhoto', preview);
    else if (target === 'horoscope') set('horoscopeUrl', preview);
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) queueFile(file, 'profilePhoto');
    e.target.value = '';
  };

  const handleHoroscope = (e) => {
    const file = e.target.files?.[0];
    if (file) queueFile(file, 'horoscope');
    e.target.value = '';
  };

  const handleGalleryPhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const index = (form.photos || []).length;
      setPendingUploads((p) => [...p, { file, target: 'gallery', index }]);
      setForm((f) => ({ ...f, photos: [...(f.photos || []), URL.createObjectURL(file)] }));
    }
    e.target.value = '';
  };

  const handleRemoveGalleryPhoto = (index) => {
    setForm((f) => ({
      ...f,
      photos: (f.photos || []).filter((_, i) => i !== index),
    }));
    setPendingUploads((p) => p.filter((item) => !(item.target === 'gallery' && item.index === index)));
  };

  const handleAddGalleryPhotoUrl = (url) => {
    const trimmed = String(url || '').trim();
    if (!trimmed) return;
    setForm((f) => ({ ...f, photos: [...(f.photos || []), trimmed] }));
  };

  const uploadPendingFiles = async () => {
    let profilePhoto = form.profilePhoto?.startsWith('blob:') ? '' : (form.profilePhoto || '');
    let horoscopeUrl = form.horoscopeUrl?.startsWith('blob:') ? '' : (form.horoscopeUrl || '');
    const photos = (form.photos || []).filter((u) => !String(u).startsWith('blob:'));

    for (const item of pendingUploads) {
      const fd = new FormData();
      fd.append('file', item.file);
      const { data } = item.target === 'horoscope'
        ? await matrimonyService.uploadMemberDocument(fd)
        : await matrimonyService.uploadMemberPhoto(fd);
      const url = data.data?.url;
      if (!url) continue;

      if (item.target === 'profilePhoto') profilePhoto = url;
      else if (item.target === 'horoscope') horoscopeUrl = url;
      else if (item.target === 'gallery') photos.push(url);
    }

    return { profilePhoto, horoscopeUrl, photos };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account.email.trim() || !account.password) {
      toast.error('Email and password are required');
      return;
    }
    if (account.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!account.name.trim()) {
      toast.error('Your name is required');
      return;
    }
    if (!account.phone.trim()) {
      toast.error('Mobile number is required');
      return;
    }
    if (!account.city.trim()) {
      toast.error('City is required');
      return;
    }
    const profileErr = validateMatrimonyProfileForm(form);
    if (profileErr) {
      toast.error(profileErr);
      return;
    }

    setLoading(true);
    try {
      const name = account.name.trim() || form.fullName.trim() || account.email.trim().split('@')[0];
      await registerMatrimonyMember({
        name,
        email: account.email.trim(),
        password: account.password,
        phone: account.phone,
        city: account.city,
      });

      const uploads = await uploadPendingFiles();
      const payload = buildProfilePayload({
        ...form,
        ...uploads,
        fullName: form.fullName || name,
        mobile: form.mobile || account.phone,
        email: form.email || account.email,
        city: form.city || account.city,
      });

      const { data } = await matrimonyService.createMemberProfile(payload);
      toast.success(data.message || 'Registration complete — profile submitted for approval');
      navigate('/matrimony/member');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link to="/matrimony" className="text-sm text-teal-700 font-semibold hover:underline">← Back to Matrimony</Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-headline mt-3">Matrimony Registration</h1>
          <p className="text-sm text-slate-500 mt-1">
            Account (email + password) and every admin matrimony field — nothing missing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-1 pb-24">
          <Section title="Account Login Details">
            <Field label="Your Name" required>
              <input
                required
                className={inputCls}
                value={account.name}
                onChange={(e) => setAccount({ ...account, name: e.target.value })}
              />
            </Field>
            <Field label="Login Email" required>
              <input
                required
                type="email"
                autoComplete="email"
                className={inputCls}
                value={account.email}
                onChange={(e) => {
                  setAccount({ ...account, email: e.target.value });
                  if (!form.email) set('email', e.target.value);
                }}
              />
            </Field>
            <Field label="Password (min 6)" required>
              <input
                required
                type="password"
                autoComplete="new-password"
                minLength={6}
                className={inputCls}
                value={account.password}
                onChange={(e) => setAccount({ ...account, password: e.target.value })}
              />
            </Field>
            <Field label="Mobile Number" required>
              <input
                required
                className={inputCls}
                value={account.phone}
                onChange={(e) => {
                  setAccount({ ...account, phone: e.target.value });
                  if (!form.mobile) set('mobile', e.target.value);
                }}
              />
            </Field>
            <Field label="City" required>
              <input
                required
                className={inputCls}
                value={account.city}
                onChange={(e) => {
                  setAccount({ ...account, city: e.target.value });
                  if (!form.city) set('city', e.target.value);
                }}
              />
            </Field>
          </Section>

          <MatrimonyProfileFields
            form={form}
            set={set}
            categories={categories}
            uploading={loading}
            onPhoto={handlePhoto}
            onHoroscope={handleHoroscope}
            onGalleryPhoto={handleGalleryPhoto}
            onRemoveGalleryPhoto={handleRemoveGalleryPhoto}
            onAddGalleryPhotoUrl={handleAddGalleryPhotoUrl}
            requireAllFields
          />

          <div className="sticky bottom-0 bg-stone-100/95 backdrop-blur border-t border-slate-200 py-3 flex flex-wrap gap-2 justify-end">
            <Link to="/matrimony/login" className="btn-secondary text-sm py-2.5 px-4">Already registered?</Link>
            <button type="submit" disabled={loading} className="btn-primary text-sm py-2.5 px-5 disabled:opacity-50">
              {loading ? 'Submitting…' : 'Register & Submit Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatrimonyRegister;
