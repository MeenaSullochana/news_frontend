import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminPageHeader from './AdminPageHeader';
import { pageContentService } from '../services/articleService';

const EMPTY_ABOUT = {
  hero: { label: '', heading: '', description: '' },
  cards: [
    { title: '', content: '', footerLabel: '' },
    { title: '', content: '', footerLabel: '' },
  ],
  founder: {
    sectionTitle: '',
    subtitle: '',
    name: '',
    designation: '',
    description: '',
    initials: '',
  },
  bureauOverview: {
    title: '',
    stats: [{ label: '', value: '', icon: 'calendar' }],
  },
  meta: { pageTitle: 'About Us', metaDescription: '' },
};

const STAT_ICON_OPTIONS = [
  { value: 'calendar', label: 'Calendar' },
  { value: 'pin', label: 'Location' },
  { value: 'reach', label: 'Reach' },
  { value: 'network', label: 'Network' },
];

const Field = ({ label, value, onChange, type = 'text', rows, required }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows || 4}
        className="admin-input w-full"
        required={required}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="admin-input w-full"
        required={required}
      />
    )}
  </div>
);

const AboutPageEditor = () => {
  const [form, setForm] = useState(EMPTY_ABOUT);
  const [pageTitle, setPageTitle] = useState('About Us');
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    pageContentService
      .getAboutAdmin()
      .then(({ data }) => {
        const page = data.data;
        setForm(page.content || EMPTY_ABOUT);
        setPageTitle(page.title || 'About Us');
        setIsPublished(page.isPublished !== false);
      })
      .catch(() => toast.error('Failed to load About Us content'))
      .finally(() => setLoading(false));
  }, []);

  const updateHero = (key, value) => {
    setForm((prev) => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
  };

  const updateCard = (index, key, value) => {
    setForm((prev) => {
      const cards = [...prev.cards];
      cards[index] = { ...cards[index], [key]: value };
      return { ...prev, cards };
    });
  };

  const updateFounder = (key, value) => {
    setForm((prev) => ({ ...prev, founder: { ...prev.founder, [key]: value } }));
  };

  const updateMeta = (key, value) => {
    setForm((prev) => ({ ...prev, meta: { ...prev.meta, [key]: value } }));
  };

  const updateStat = (index, key, value) => {
    setForm((prev) => {
      const stats = [...prev.bureauOverview.stats];
      stats[index] = { ...stats[index], [key]: value };
      return {
        ...prev,
        bureauOverview: { ...prev.bureauOverview, stats },
      };
    });
  };

  const addStat = () => {
    setForm((prev) => ({
      ...prev,
      bureauOverview: {
        ...prev.bureauOverview,
        stats: [...prev.bureauOverview.stats, { label: '', value: '', icon: 'calendar' }],
      },
    }));
  };

  const removeStat = (index) => {
    setForm((prev) => ({
      ...prev,
      bureauOverview: {
        ...prev.bureauOverview,
        stats: prev.bureauOverview.stats.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await pageContentService.saveAbout({
        title: pageTitle,
        content: form,
        isPublished,
      });
      setForm(data.data.content);
      setPageTitle(data.data.title);
      toast.success('About Us page saved');
    } catch (err) {
      const msg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || 'Save failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="skeleton h-96 rounded-2xl" />;
  }

  return (
    <div>
      <AdminPageHeader
        title="About Us"
        subtitle="Edit hero, mission cards, founder profile, and bureau statistics"
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="admin-card space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-700">
            Page Settings
          </h2>
          <Field label="Page Title" value={pageTitle} onChange={setPageTitle} required />
          <Field
            label="Meta Description"
            value={form.meta.metaDescription}
            onChange={(v) => updateMeta('metaDescription', v)}
            type="textarea"
            rows={2}
          />
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded border-slate-300"
            />
            Published (visible on public site)
          </label>
        </div>

        <div className="admin-card space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-700">
            1. Hero / Introduction
          </h2>
          <Field label="Section Label" value={form.hero.label} onChange={(v) => updateHero('label', v)} required />
          <Field label="Main Heading" value={form.hero.heading} onChange={(v) => updateHero('heading', v)} required />
          <Field
            label="Description"
            value={form.hero.description}
            onChange={(v) => updateHero('description', v)}
            type="textarea"
            required
          />
        </div>

        {[0, 1].map((index) => (
          <div key={index} className="admin-card space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-700">
              2. Information Card {index + 1}
            </h2>
            <Field
              label="Title"
              value={form.cards[index]?.title || ''}
              onChange={(v) => updateCard(index, 'title', v)}
              required
            />
            <Field
              label="Content"
              value={form.cards[index]?.content || ''}
              onChange={(v) => updateCard(index, 'content', v)}
              type="textarea"
              required
            />
            <Field
              label="Bottom Label"
              value={form.cards[index]?.footerLabel || ''}
              onChange={(v) => updateCard(index, 'footerLabel', v)}
            />
          </div>
        ))}

        <div className="admin-card space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-700">
            3. Founder / Leadership
          </h2>
          <Field
            label="Section Title"
            value={form.founder.sectionTitle}
            onChange={(v) => updateFounder('sectionTitle', v)}
            required
          />
          <Field
            label="Subtitle"
            value={form.founder.subtitle}
            onChange={(v) => updateFounder('subtitle', v)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Founder Name" value={form.founder.name} onChange={(v) => updateFounder('name', v)} required />
            <Field
              label="Designation"
              value={form.founder.designation}
              onChange={(v) => updateFounder('designation', v)}
              required
            />
          </div>
          <Field
            label="Avatar Initials (optional)"
            value={form.founder.initials}
            onChange={(v) => updateFounder('initials', v)}
          />
          <Field
            label="Founder Description"
            value={form.founder.description}
            onChange={(v) => updateFounder('description', v)}
            type="textarea"
            rows={6}
            required
          />
        </div>

        <div className="admin-card space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-700">
            4. Bureau Overview
          </h2>
          <Field
            label="Section Title"
            value={form.bureauOverview.title}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                bureauOverview: { ...prev.bureauOverview, title: v },
              }))
            }
            required
          />

          <div className="space-y-4">
            {form.bureauOverview.stats.map((stat, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
              >
                <Field label="Label" value={stat.label} onChange={(v) => updateStat(index, 'label', v)} required />
                <Field label="Value" value={stat.value} onChange={(v) => updateStat(index, 'value', v)} required />
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Icon
                  </label>
                  <select
                    value={stat.icon || 'calendar'}
                    onChange={(e) => updateStat(index, 'icon', e.target.value)}
                    className="admin-input w-full"
                  >
                    {STAT_ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  {form.bureauOverview.stats.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStat(index)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addStat} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            + Add Statistic
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5">
            {saving ? 'Saving…' : 'Save About Us Page'}
          </button>
          <a href="/about" target="_blank" rel="noopener noreferrer" className="btn-secondary px-6 py-2.5">
            Preview Public Page
          </a>
        </div>
      </form>
    </div>
  );
};

export default AboutPageEditor;
