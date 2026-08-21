import { useEffect, useState } from 'react';
import { settingService } from '../services/articleService';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingService.getAll()
      .then(({ data }) => setSettings(data.data || {}))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingService.update(settings);
      toast.success('Settings saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="skeleton h-64 rounded-xl" />;

  const fields = [
    { key: 'siteName', label: 'Site Name (English)' },
    { key: 'siteNameTamil', label: 'Site Name (Tamil)' },
    { key: 'contactEmail', label: 'Contact Email' },
    { key: 'contactPhone', label: 'Contact Phone' },
    { key: 'footerText', label: 'Footer Text' },
    { key: 'defaultSeoTitle', label: 'Default SEO Title' },
    { key: 'defaultMetaDescription', label: 'Default Meta Description', type: 'textarea' },
    { key: 'googleAnalyticsId', label: 'Google Analytics ID' },
    { key: 'googleTagManagerId', label: 'Google Tag Manager ID' },
    { key: 'socialFacebook', label: 'Facebook URL' },
    { key: 'socialTwitter', label: 'Twitter/X URL' },
    { key: 'socialYoutube', label: 'YouTube URL' },
    { key: 'socialInstagram', label: 'Instagram URL' },
    { key: 'socialTelegram', label: 'Telegram URL' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4 max-w-2xl">
        {fields.map(({ key, label, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {type === 'textarea' ? (
              <textarea
                value={settings[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            ) : (
              <input
                value={settings[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            )}
          </div>
        ))}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
