import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { matrimonyService } from '../../services/articleService';
import AdminPageHeader from '../AdminPageHeader';
import MatrimonyNav from './MatrimonyNav';
import {
  emptyMatrimonyForm,
  emptyMemberLoginForm,
  MatrimonyProfileFields,
  MatrimonyMemberLoginSection,
  createMatrimonyUploadHandlers,
} from '../../matrimony/matrimonyFormShared';

const MatrimonyProfileForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyMatrimonyForm());
  const [login, setLogin] = useState(emptyMemberLoginForm());
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    matrimonyService
      .getCategories()
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return undefined;
    setLoading(true);
    matrimonyService
      .getProfile(id)
      .then(({ data }) => {
        const p = data.data;
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
        setLogin({
          ...emptyMemberLoginForm(),
          memberName: p.memberAccount?.name || p.fullName || '',
          memberLoginEmail: p.memberAccount?.email || p.email || '',
          memberPhone: p.memberAccount?.phone || p.mobile || '',
          memberCity: p.memberAccount?.city || p.city || '',
        });
      })
      .catch(() => {
        toast.error('Profile not found');
        navigate('/admin/matrimony/profiles');
      })
      .finally(() => setLoading(false));
    return undefined;
  }, [id, isEdit, navigate]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const syncFromLogin = (key, value) => {
    setForm((f) => {
      if (key === 'fullName') return { ...f, fullName: value };
      return f[key] ? f : { ...f, [key]: value };
    });
  };

  const handlers = createMatrimonyUploadHandlers({
    uploadPhoto: matrimonyService.uploadPhoto,
    uploadDocument: matrimonyService.uploadDocument,
    setForm,
    setUploading,
    onUploadError: () => toast.error('Upload failed'),
  });

  const validateLogin = () => {
    if (!login.memberName.trim()) {
      toast.error('Your name is required');
      return false;
    }
    if (!login.memberLoginEmail.trim()) {
      toast.error('Login email is required');
      return false;
    }
    if (!login.memberPhone.trim()) {
      toast.error('Mobile number is required');
      return false;
    }
    if (!login.memberCity.trim()) {
      toast.error('City is required');
      return false;
    }
    if (!isEdit && login.memberPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!form.gender) {
      toast.error('Gender is required');
      return;
    }
    if (!validateLogin()) return;

    setSaving(true);
    const payload = {
      ...form,
      category: form.category || null,
      prefAgeMin: form.prefAgeMin === '' ? undefined : Number(form.prefAgeMin),
      prefAgeMax: form.prefAgeMax === '' ? undefined : Number(form.prefAgeMax),
      numberOfBrothers: Number(form.numberOfBrothers) || 0,
      numberOfSisters: Number(form.numberOfSisters) || 0,
      photos: Array.isArray(form.photos) ? form.photos.filter(Boolean) : [],
      profileId: form.profileId || undefined,
      memberName: login.memberName.trim(),
      memberLoginEmail: login.memberLoginEmail.trim(),
      memberPhone: login.memberPhone.trim(),
      memberCity: login.memberCity.trim(),
      ...(isEdit
        ? { newPassword: login.newPassword || undefined }
        : { memberPassword: login.memberPassword }),
    };
    try {
      if (isEdit) {
        await matrimonyService.updateProfile(id, payload);
        toast.success('Profile updated');
        navigate(`/admin/matrimony/view/${id}`);
      } else {
        const { data } = await matrimonyService.createProfile(payload);
        toast.success('Profile created');
        navigate(`/admin/matrimony/view/${data.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminPageHeader title={isEdit ? 'Edit Profile' : 'Add Profile'} />
        <MatrimonyNav />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title={isEdit ? 'Edit Profile' : 'Add Profile'}
        subtitle="Complete matrimony profile details"
      >
        {isEdit && (
          <Link to={`/admin/matrimony/view/${id}`} className="btn-secondary text-sm py-2.5 px-4">
            View
          </Link>
        )}
      </AdminPageHeader>
      <MatrimonyNav />

      <form onSubmit={handleSubmit} className="space-y-1 pb-24">
        <MatrimonyMemberLoginSection
          isEdit={isEdit}
          login={login}
          setLogin={setLogin}
          onSyncProfile={syncFromLogin}
        />

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
          showProfileIdField
          showAdminFields
        />

        <div className="sticky bottom-0 bg-slate-100/95 backdrop-blur border-t border-slate-200 py-3 flex flex-wrap gap-2 justify-end -mx-1 px-1">
          <Link to="/admin/matrimony/profiles" className="btn-secondary text-sm py-2.5 px-4">Cancel</Link>
          <button type="submit" disabled={saving || uploading} className="btn-primary text-sm py-2.5 px-5 disabled:opacity-50">
            {saving ? 'Saving…' : isEdit ? 'Update Profile' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MatrimonyProfileForm;
