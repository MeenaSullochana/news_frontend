import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { matrimonyService } from '../services/articleService';
import { useAuth } from '../context/AuthContext';
import {
  emptyMatrimonyForm,
  MatrimonyProfileFields,
  buildProfilePayload,
  validateMatrimonyProfileForm,
  createMatrimonyUploadHandlers,
} from './matrimonyFormShared';

const MatrimonyMemberProfileForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyMatrimonyForm());
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    matrimonyService
      .getPublicCategories()
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    matrimonyService
      .getMemberProfile()
      .then(({ data }) => {
        const p = data.data;
        if (!p) {
          setForm((f) => ({
            ...f,
            fullName: user?.name || f.fullName,
            mobile: user?.phone || '',
            email: user?.email || '',
            city: user?.city || f.city,
          }));
          setHasProfile(false);
          return;
        }
        setHasProfile(true);
        setForm({
          ...emptyMatrimonyForm(),
          ...p,
          dateOfBirth: p.dateOfBirth ? String(p.dateOfBirth).slice(0, 10) : '',
          category: p.category?._id || p.category || '',
          photos: p.photos || [],
          prefAgeMin: p.prefAgeMin ?? '',
          prefAgeMax: p.prefAgeMax ?? '',
          numberOfBrothers: p.numberOfBrothers ?? 0,
          numberOfSisters: p.numberOfSisters ?? 0,
          isVisible: p.isVisible !== false,
        });
      })
      .catch(() => {
        toast.error('Could not load profile');
        navigate('/matrimony/member');
      })
      .finally(() => setLoading(false));
  }, [navigate, user?.name, user?.phone, user?.email, user?.city]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handlers = createMatrimonyUploadHandlers({
    uploadPhoto: matrimonyService.uploadMemberPhoto,
    uploadDocument: matrimonyService.uploadMemberDocument,
    setForm,
    setUploading,
    onUploadError: () => toast.error('Upload failed'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasProfile) {
      const err = validateMatrimonyProfileForm(form);
      if (err) {
        toast.error(err);
        return;
      }
    } else {
      if (!form.fullName.trim()) {
        toast.error('Full name is required');
        return;
      }
      if (!form.gender) {
        toast.error('Gender is required');
        return;
      }
    }
    setSaving(true);
    const payload = buildProfilePayload(form);

    try {
      if (hasProfile) {
        const { data } = await matrimonyService.updateMemberProfile(payload);
        toast.success(data.message || 'Profile updated');
      } else {
        const { data } = await matrimonyService.createMemberProfile(payload);
        toast.success(data.message || 'Profile submitted');
        setHasProfile(true);
        if (data.data?.profileId) set('profileId', data.data.profileId);
      }
      navigate('/matrimony/member');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="skeleton h-96 rounded-2xl" />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {hasProfile ? 'Edit Profile' : 'Create Profile'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {hasProfile
            ? 'Update your matrimony profile details'
            : 'All fields are required — complete every section before submitting'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-1 pb-24">
        <MatrimonyProfileFields
          form={form}
          set={set}
          categories={categories}
          uploading={uploading}
          onPhoto={handlers.handlePhoto}
          onHoroscope={handlers.handleHoroscope}
          onGalleryPhoto={handlers.handleGalleryPhoto}
          onRemoveGalleryPhoto={handlers.handleRemoveGalleryPhoto}
          onAddGalleryPhotoUrl={handlers.handleAddGalleryPhotoUrl}
          readOnlyProfileId
          requireAllFields={!hasProfile}
        />

        <div className="sticky bottom-0 bg-stone-100/95 backdrop-blur border-t border-slate-200 py-3 flex flex-wrap gap-2 justify-end">
          <Link to="/matrimony/member" className="btn-secondary text-sm py-2.5 px-4">Cancel</Link>
          <button type="submit" disabled={saving || uploading} className="btn-primary text-sm py-2.5 px-5 disabled:opacity-50">
            {saving ? 'Saving…' : hasProfile ? 'Update Profile' : 'Submit Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MatrimonyMemberProfileForm;
