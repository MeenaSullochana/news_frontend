import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { matrimonyService } from '../../services/articleService';
import AdminPageHeader from '../AdminPageHeader';
import MatrimonyNav from './MatrimonyNav';

const Toggle = ({ label, hint, checked, onChange }) => (
  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
    <input type="checkbox" className="mt-1" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span>
      <span className="block text-sm font-medium text-slate-900">{label}</span>
      {hint && <span className="block text-xs text-slate-500 mt-0.5">{hint}</span>}
    </span>
  </label>
);

const MatrimonySettings = () => {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    matrimonyService
      .getConfig()
      .then(({ data }) => setForm(data.data))
      .catch(() => toast.error('Failed to load settings'));
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await matrimonyService.updateConfig(form);
      toast.success('Settings saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return (
      <div>
        <AdminPageHeader title="Matrimony Settings" />
        <MatrimonyNav />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader title="Matrimony Settings" subtitle="Visibility, privacy and listing options" />
      <MatrimonyNav />

      <form onSubmit={save} className="space-y-4 max-w-2xl">
        <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">General</h2>
          <Toggle label="Enable Matrimony module" checked={form.enabled} onChange={(v) => set('enabled', v)} />
          <Toggle label="Show on Explore hub" checked={form.showOnExplore} onChange={(v) => set('showOnExplore', v)} />
          <Toggle label="Require admin approval for new profiles" checked={form.requireApproval} onChange={(v) => set('requireApproval', v)} />
          <Toggle label="Auto-generate Profile ID" checked={form.autoGenerateProfileId} onChange={(v) => set('autoGenerateProfileId', v)} />
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">Homepage title (EN)</span>
            <input className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" value={form.homepageTitle || ''} onChange={(e) => set('homepageTitle', e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">Homepage title (TA)</span>
            <input className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" value={form.homepageTitleTa || ''} onChange={(e) => set('homepageTitleTa', e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">Profile ID prefix</span>
            <input className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" value={form.profileIdPrefix || ''} onChange={(e) => set('profileIdPrefix', e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600 font-medium">Max profiles per page</span>
            <input type="number" min="6" max="48" className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" value={form.maxProfilesPerPage || 18} onChange={(e) => set('maxProfilesPerPage', Number(e.target.value))} />
          </label>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Public contact privacy</h2>
          <p className="text-xs text-slate-500">By default mobile, email and full address are hidden from public users.</p>
          <Toggle label="Show mobile number publicly" hint="Off by default" checked={form.showMobilePublic} onChange={(v) => set('showMobilePublic', v)} />
          <Toggle label="Show alternate mobile publicly" checked={form.showAlternateMobilePublic} onChange={(v) => set('showAlternateMobilePublic', v)} />
          <Toggle label="Show email publicly" checked={form.showEmailPublic} onChange={(v) => set('showEmailPublic', v)} />
          <Toggle label="Show full address publicly" checked={form.showAddressPublic} onChange={(v) => set('showAddressPublic', v)} />
          <Toggle label="Allow public horoscope download" checked={form.allowHoroscopeDownload} onChange={(v) => set('allowHoroscopeDownload', v)} />
        </section>

        <button type="submit" disabled={saving} className="btn-primary text-sm py-2.5 px-5 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default MatrimonySettings;
