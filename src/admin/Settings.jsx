import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { settingService } from '../services/articleService';
import { getBrandAssetUrl, isBrandVideo } from '../utils/images';
import { patchCachedBrandAsset } from '../utils/brandSettingsCache';
import toast from 'react-hot-toast';
import AdminPageHeader from './AdminPageHeader';

const ACCEPTED_BRAND_FILES = '.png,.jpg,.jpeg,.gif,.mp4';
const BRAND_FIELDS = [
  { key: 'headerLogo', label: 'Header Logo' },
  { key: 'footerLogo', label: 'Footer Logo', hint: 'If empty, the header logo/video is shown in the footer.' },
  { key: 'favicon', label: 'Favicon', hint: 'Use PNG, JPG, JPEG, or GIF only (not MP4).' },
];

const BrandUploadField = ({ fieldKey, label, hint, asset, onUploaded, uploadingKey, setUploadingKey }) => {
  const inputRef = useRef(null);
  const previewUrl = getBrandAssetUrl(asset);
  const isUploading = uploadingKey === fieldKey;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['png', 'jpg', 'jpeg', 'gif', 'mp4'];
    if (!allowed.includes(ext)) {
      toast.error('Only PNG, JPG, JPEG, GIF, and MP4 files are allowed');
      return;
    }

    setUploadingKey(fieldKey);
    try {
      const { data } = await settingService.uploadBrand(fieldKey, file);
      onUploaded(fieldKey, data.data.asset);
      patchCachedBrandAsset(fieldKey, data.data.asset);
      toast.success(`${label} uploaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || `${label} upload failed`);
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/30">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
        {label}
      </label>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-20 h-20 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden flex-shrink-0">
          {previewUrl ? (
            isBrandVideo(asset) ? (
              <video
                src={previewUrl}
                autoPlay
                loop
                muted
                playsInline
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <img src={previewUrl} alt={`${label} preview`} className="max-w-full max-h-full object-contain" />
            )
          ) : (
            <span className="text-xs text-slate-400 text-center px-2">No image</span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Accepted formats: PNG, JPG, JPEG, GIF, MP4
          </p>
          {hint && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_BRAND_FILES}
            className="hidden"
            onChange={handleFile}
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="btn-secondary text-sm py-2 px-4 disabled:opacity-50"
          >
            {isUploading ? 'Uploading…' : previewUrl ? 'Replace Image' : 'Upload Image'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [brandAssets, setBrandAssets] = useState({
    headerLogo: null,
    footerLogo: null,
    favicon: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);

  useEffect(() => {
    settingService.getAll()
      .then(({ data }) => {
        const loaded = data.data || {};
        setSettings(loaded);
        setBrandAssets({
          headerLogo: loaded.headerLogo || null,
          footerLogo: loaded.footerLogo || null,
          favicon: loaded.favicon || null,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleBrandUploaded = (key, asset) => {
    setBrandAssets((prev) => ({ ...prev, [key]: asset }));
    setSettings((prev) => ({ ...prev, [key]: asset }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...settings };
      delete payload.headerLogo;
      delete payload.footerLogo;
      delete payload.favicon;
      delete payload.logo;
      await settingService.update(payload);
      toast.success('Settings saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminPageHeader title="Settings" subtitle="Site configuration" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const sections = [
    {
      title: 'General',
      fields: [
        { key: 'siteName', label: 'Site Name (English)' },
        { key: 'siteNameTamil', label: 'Site Name (Tamil)' },
        { key: 'contactEmail', label: 'Contact Email' },
        { key: 'contactPhone', label: 'Contact Phone' },
        { key: 'footerText', label: 'Footer Text' },
      ],
    },
    {
      title: 'SEO',
      fields: [
        { key: 'defaultSeoTitle', label: 'Default SEO Title' },
        { key: 'defaultMetaDescription', label: 'Default Meta Description', type: 'textarea' },
      ],
    },
    {
      title: 'Social Media',
      fields: [
        { key: 'socialFacebook', label: 'Facebook URL' },
        { key: 'socialTwitter', label: 'Twitter/X URL' },
        { key: 'socialYoutube', label: 'YouTube URL' },
        { key: 'socialInstagram', label: 'Instagram URL' },
        { key: 'socialTelegram', label: 'Telegram URL' },
        {
          key: 'whatsapp_group_link',
          label: 'WhatsApp Group / Channel Link',
          placeholder: 'https://chat.whatsapp.com/XXXX or https://whatsapp.com/channel/XXXX',
        },
      ],
    },
  ];

  return (
    <div>
      <AdminPageHeader title="Settings" subtitle="Site configuration and integrations" />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="admin-card">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
            Branding
          </h2>
          <div className="space-y-4">
            {BRAND_FIELDS.map(({ key, label, hint }) => (
              <BrandUploadField
                key={key}
                fieldKey={key}
                label={label}
                hint={hint}
                asset={brandAssets[key]}
                onUploaded={handleBrandUploaded}
                uploadingKey={uploadingKey}
                setUploadingKey={setUploadingKey}
              />
            ))}
          </div>
        </div>

        {sections.map(({ title, fields }) => (
          <div key={title} className="admin-card">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">{title}</h2>
            <div className="space-y-4">
              {fields.map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
                  {type === 'textarea' ? (
                    <textarea
                      value={settings[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      rows={3}
                      className="admin-input"
                      placeholder={placeholder}
                    />
                  ) : (
                    <input
                      value={settings[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="admin-input"
                      placeholder={placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="admin-card">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Google Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Measurement ID and Tag Manager are managed in a dedicated admin page.
          </p>
          <Link to="/admin/google-analytics" className="btn-secondary text-sm inline-flex">
            Open Google Analytics settings →
          </Link>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
