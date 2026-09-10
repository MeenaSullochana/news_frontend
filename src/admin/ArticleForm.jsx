import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';
import {
  articleService,
  categoryService,
  authorService,
  mediaService,
} from '../services/articleService';
import { getMediaUrl } from '../utils/images';
import ImageUploadField from '../components/ImageUploadField';
import GeminiGeneratePanel from './GeminiGeneratePanel';

const STATUS_OPTIONS = ['DRAFT', 'PENDING', 'PUBLISHED', 'SCHEDULED'];

const slugFromPath = (path = '') => {
  const cleaned = String(path).replace(/^https?:\/\/[^/]+/i, '').trim();
  const segment = cleaned.split('/').filter(Boolean).pop() || '';
  return segment
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const buildArticleContentFallback = (preview = {}) => {
  if (preview.content?.trim()) return preview.content;
  const parts = [];
  if (preview.directAnswer) parts.push(`<p><strong>${preview.directAnswer}</strong></p>`);
  if (preview.aiSummary) parts.push(`<p>${preview.aiSummary}</p>`);
  (preview.headings || []).forEach((heading) => {
    parts.push(`<h2>${heading}</h2><p></p>`);
  });
  (preview.faqs || []).forEach((faq) => {
    if (faq?.question && faq?.answer) {
      parts.push(`<h3>${faq.question}</h3><p>${faq.answer}</p>`);
    }
  });
  return parts.join('\n');
};

const applyGeminiPreviewToForm = (preview, prev) => {
  const ogTitle = preview.ogTitle || preview.metaTitle || prev.ogTitle;
  const ogDescription = preview.ogDescription || preview.metaDescription || prev.ogDescription;
  const jsonLdStr =
    preview.customJsonLd || (preview.jsonLd ? JSON.stringify(preview.jsonLd, null, 2) : prev.customJsonLd);
  const tagsArr = preview.tags?.length
    ? preview.tags
    : [preview.focusKeyword, ...(preview.secondaryKeywords || [])].filter(Boolean);

  return {
    ...prev,
    title: preview.h1 || prev.title,
    slug: preview.slugSuggestion || slugFromPath(preview.canonicalSuggestion) || prev.slug,
    excerpt: preview.excerpt || preview.metaDescription || prev.excerpt,
    content: buildArticleContentFallback(preview) || prev.content,
    seoTitle: preview.metaTitle || prev.seoTitle,
    metaDescription: preview.metaDescription || prev.metaDescription,
    focusKeyword: preview.focusKeyword || prev.focusKeyword,
    secondaryKeywords: (preview.secondaryKeywords || []).join(', '),
    canonicalUrl: preview.canonicalSuggestion || prev.canonicalUrl,
    ogTitle,
    ogDescription,
    twitterTitle: preview.twitterTitle || ogTitle || prev.twitterTitle,
    twitterDescription: preview.twitterDescription || ogDescription || prev.twitterDescription,
    directAnswer: preview.directAnswer || prev.directAnswer,
    aiSummary: preview.aiSummary || prev.aiSummary,
    entities: (preview.entities || []).join(', '),
    aeoHeadings: (preview.headings || []).join(', '),
    faqs: preview.faqs?.length ? preview.faqs : prev.faqs,
    robots: preview.robots || prev.robots,
    customJsonLd: jsonLdStr,
    tags: tagsArr.length ? tagsArr.join(', ') : prev.tags,
  };
};

const ArticleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    imageAlt: '',
    imageCaption: '',
    category: '',
    district: '',
    author: '',
    tags: '',
    status: 'DRAFT',
    publishedAt: '',
    scheduledAt: '',
    seoTitle: '',
    metaDescription: '',
    focusKeyword: '',
    secondaryKeywords: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    directAnswer: '',
    aiSummary: '',
    entities: '',
    aeoHeadings: '',
    faqs: [],
    robots: 'index,follow',
    customJsonLd: '',
    isFeatured: false,
    isBreaking: false,
    isLive: false,
    isMustWatch: false,
    audioReader: '',
    youtubeVideoLink: '',
  });

  useEffect(() => {
    Promise.all([
      categoryService.getAll({ districts: 'false' }),
      categoryService.getAll({ districts: 'true' }),
      authorService.getAllAdmin ? authorService.getAllAdmin() : authorService.getAll(),
    ]).then(([catRes, distRes, authRes]) => {
      setCategories(catRes.data.data || []);
      setDistricts(distRes.data.data || []);
      setAuthors(authRes.data.data || []);
    });
  }, []);

  useEffect(() => {
    if (isEdit) {
      articleService.getById(id).then(({ data }) => {
        const a = data.data;
        setForm({
          title: a.title || '',
          slug: a.slug || '',
          excerpt: a.excerpt || '',
          content: a.content || '',
          featuredImage: a.featuredImage || '',
          imageAlt: a.imageAlt || '',
          imageCaption: a.imageCaption || '',
          category: a.category?._id || a.category || '',
          district: a.district?._id || a.district || '',
          author: a.author?._id || a.author || '',
          tags: (a.tags || []).join(', '),
          status: a.status || 'DRAFT',
          publishedAt: a.publishedAt ? a.publishedAt.slice(0, 16) : '',
          scheduledAt: a.scheduledAt ? a.scheduledAt.slice(0, 16) : '',
          seoTitle: a.seoTitle || '',
          metaDescription: a.metaDescription || '',
          focusKeyword: a.focusKeyword || '',
          secondaryKeywords: (a.secondaryKeywords || []).join(', '),
          canonicalUrl: a.canonicalUrl || '',
          ogTitle: a.ogTitle || '',
          ogDescription: a.ogDescription || '',
          ogImage: a.ogImage || '',
          twitterTitle: a.twitterTitle || '',
          twitterDescription: a.twitterDescription || '',
          twitterImage: a.twitterImage || '',
          directAnswer: a.directAnswer || '',
          aiSummary: a.aiSummary || '',
          entities: (a.entities || []).join(', '),
          aeoHeadings: (a.aeoHeadings || []).join(', '),
          faqs: a.faqs || [],
          robots: a.robots || 'index,follow',
          customJsonLd: a.customJsonLd || '',
          isFeatured: a.isFeatured || false,
          isBreaking: a.isBreaking || false,
          isLive: a.isLive || false,
          isMustWatch: a.isMustWatch || false,
          audioReader: a.audioReader || '',
          youtubeVideoLink: a.youtubeVideoLink || '',
        });
      });
    }
  }, [id, isEdit]);

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ script: 'sub' }, { script: 'super' }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean'],
      ],
    }),
    []
  );

  const quillFormats = useMemo(
    () => [
      'header',
      'font',
      'size',
      'bold',
      'italic',
      'underline',
      'strike',
      'script',
      'color',
      'background',
      'align',
      'direction',
      'list',
      'indent',
      'blockquote',
      'code-block',
      'link',
      'image',
      'video',
    ],
    []
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setAudioUploading(true);
    try {
      const { data } = await mediaService.uploadAudio(formData);
      setForm((prev) => ({ ...prev, audioReader: data.data?.url || '' }));
      toast.success('Audio uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Audio upload failed');
    } finally {
      setAudioUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e, overrideStatus) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      status: overrideStatus || form.status,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      secondaryKeywords: (form.secondaryKeywords || '').split(',').map((t) => t.trim()).filter(Boolean),
      entities: (form.entities || '').split(',').map((t) => t.trim()).filter(Boolean),
      aeoHeadings: (form.aeoHeadings || '').split(',').map((t) => t.trim()).filter(Boolean),
      faqs: (form.faqs || []).filter((f) => f.question && f.answer),
      category: form.category || undefined,
      district: form.district || undefined,
      author: form.author || undefined,
    };

    try {
      if (isEdit) {
        await articleService.update(id, payload);
        toast.success('Article updated');
      } else {
        await articleService.create(payload);
        toast.success('Article created');
      }
      navigate('/admin/articles');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{isEdit ? 'Edit Article' : 'Add Article'}</h1>
        <p className="text-sm text-slate-500 mt-1">Write and publish news content</p>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <div className="admin-card space-y-4">
              <div>
                <label className={labelClass}>Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required className="admin-input" />
              </div>
              <div>
                <label className={labelClass}>Slug</label>
                <input name="slug" value={form.slug} onChange={handleChange} className="admin-input" placeholder="auto-generated" />
              </div>
              <div>
                <label className={labelClass}>Short Description</label>
                <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} className="admin-input" />
              </div>
            </div>
            <div className="admin-card">
              <label className={labelClass}>Content *</label>
              <div className="article-editor">
                <ReactQuill
                  theme="snow"
                  value={form.content}
                  onChange={(val) => setForm((p) => ({ ...p, content: val }))}
                  modules={quillModules}
                  formats={quillFormats}
                />
              </div>
            </div>

            <GeminiGeneratePanel
              mode="article"
              compact
              initialTopic={form.title}
              articleId={id || null}
              excerpt={form.excerpt}
              content={form.content}
              pageType="article"
              onApplied={(preview) => {
                setForm((p) => applyGeminiPreviewToForm(preview, p));
              }}
            />

            <div className="admin-card space-y-3">
              <h3 className="font-semibold text-slate-900">AEO / GEO fields</h3>
              <textarea name="directAnswer" value={form.directAnswer} onChange={handleChange} rows={2} className="admin-input" placeholder="Direct answer (AEO)" />
              <textarea name="aiSummary" value={form.aiSummary} onChange={handleChange} rows={2} className="admin-input" placeholder="AI summary (GEO)" />
              <input name="entities" value={form.entities} onChange={handleChange} className="admin-input" placeholder="Entities (comma-separated)" />
              <input name="aeoHeadings" value={form.aeoHeadings} onChange={handleChange} className="admin-input" placeholder="Question headings (comma-separated)" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="admin-card space-y-4">
              <h3 className="font-semibold text-slate-900">Publish</h3>
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="admin-input">
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Category *</label>
                <select name="category" value={form.category} onChange={handleChange} required className="admin-input">
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.nameTamil || c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>District</label>
                <select name="district" value={form.district} onChange={handleChange} className="admin-input">
                  <option value="">None</option>
                  {districts.map((d) => (
                    <option key={d._id} value={d._id}>{d.nameTamil || d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Author *</label>
                <select name="author" value={form.author} onChange={handleChange} required className="admin-input">
                  <option value="">Select</option>
                  {authors.map((a) => (
                    <option key={a._id} value={a._id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input name="tags" value={form.tags} onChange={handleChange} className="admin-input" />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="rounded border-slate-300 text-brand-600" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="isBreaking" checked={form.isBreaking} onChange={handleChange} className="rounded border-slate-300 text-brand-600" />
                  Breaking
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="isLive" checked={form.isLive} onChange={handleChange} className="rounded border-slate-300 text-brand-600" />
                  Live
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="isMustWatch" checked={form.isMustWatch} onChange={handleChange} className="rounded border-slate-300 text-brand-600" />
                  Must Watch
                </label>
              </div>
            </div>

            <div className="admin-card space-y-3">
              <h3 className="font-semibold text-slate-900">Audio Reader</h3>
              <input
                name="audioReader"
                value={form.audioReader}
                onChange={handleChange}
                className="admin-input"
                placeholder="Audio URL (upload or paste link)"
              />
              <div className="flex flex-wrap items-center gap-2">
                <label className="btn-secondary text-sm py-2 px-3 cursor-pointer">
                  {audioUploading ? 'Uploading…' : 'Upload audio file'}
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                    className="hidden"
                    disabled={audioUploading}
                    onChange={handleAudioUpload}
                  />
                </label>
                {form.audioReader && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, audioReader: '' }))}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove audio
                  </button>
                )}
              </div>
              {form.audioReader && (
                <audio controls preload="metadata" className="w-full" src={getMediaUrl(form.audioReader)}>
                  Your browser does not support audio playback.
                </audio>
              )}
            </div>

            <div className="admin-card space-y-3">
              <h3 className="font-semibold text-slate-900">YouTube Video</h3>
              <input
                name="youtubeVideoLink"
                value={form.youtubeVideoLink}
                onChange={handleChange}
                className="admin-input"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-slate-500">Paste a YouTube watch, embed, or youtu.be link.</p>
            </div>

            <div className="admin-card space-y-3">
              <h3 className="font-semibold text-slate-900">Featured Image</h3>
              <ImageUploadField
                value={form.featuredImage}
                onChange={(url) => setForm((prev) => ({ ...prev, featuredImage: url }))}
                placeholder="Image URL"
                seed={form.slug || id || 'featured'}
              />
              <input name="imageAlt" value={form.imageAlt} onChange={handleChange} className="admin-input" placeholder="Alt text" />
              <input name="imageCaption" value={form.imageCaption} onChange={handleChange} className="admin-input" placeholder="Caption" />
            </div>

            <div className="admin-card space-y-3">
              <h3 className="font-semibold text-slate-900">SEO</h3>
              <input name="seoTitle" value={form.seoTitle} onChange={handleChange} className="admin-input" placeholder="SEO Title" />
              <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} rows={2} className="admin-input" placeholder="Meta Description" />
              <input name="focusKeyword" value={form.focusKeyword} onChange={handleChange} className="admin-input" placeholder="Focus Keyword" />
              <input name="secondaryKeywords" value={form.secondaryKeywords} onChange={handleChange} className="admin-input" placeholder="Secondary keywords" />
              <input name="canonicalUrl" value={form.canonicalUrl} onChange={handleChange} className="admin-input" placeholder="Canonical URL" />
              <input name="ogTitle" value={form.ogTitle} onChange={handleChange} className="admin-input" placeholder="OG Title" />
              <textarea name="ogDescription" value={form.ogDescription} onChange={handleChange} rows={2} className="admin-input" placeholder="OG Description" />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-white/95 backdrop-blur border-t border-slate-200 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
          <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, 'DRAFT')} disabled={loading} className="btn-secondary w-full sm:w-auto">
            Save Draft
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, 'PENDING')} disabled={loading} className="btn-secondary w-full sm:w-auto">
            Submit for Review
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, 'PUBLISHED')} disabled={loading} className="btn-primary w-full sm:w-auto">
            Publish
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;
