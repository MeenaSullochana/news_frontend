import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';
import {
  articleService,
  categoryService,
  authorService,
} from '../services/articleService';

const STATUS_OPTIONS = ['DRAFT', 'PENDING', 'PUBLISHED', 'SCHEDULED'];

const ArticleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
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
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    isFeatured: false,
    isBreaking: false,
    isLive: false,
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
          canonicalUrl: a.canonicalUrl || '',
          ogTitle: a.ogTitle || '',
          ogDescription: a.ogDescription || '',
          ogImage: a.ogImage || '',
          twitterTitle: a.twitterTitle || '',
          twitterDescription: a.twitterDescription || '',
          twitterImage: a.twitterImage || '',
          isFeatured: a.isFeatured || false,
          isBreaking: a.isBreaking || false,
          isLive: a.isLive || false,
        });
      });
    }
  }, [id, isEdit]);

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'video'],
        ['blockquote'],
        ['clean'],
      ],
    }),
    []
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e, overrideStatus) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      status: overrideStatus || form.status,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
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

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Article' : 'Add Article'}</h1>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className={labelClass}>Title *</label>
              <input name="title" value={form.title} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange} className={inputClass} placeholder="auto-generated" />
            </div>
            <div>
              <label className={labelClass}>Short Description</label>
              <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Content *</label>
              <ReactQuill theme="snow" value={form.content} onChange={(val) => setForm((p) => ({ ...p, content: val }))} modules={quillModules} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
              <h3 className="font-semibold">Publish</h3>
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Category *</label>
                <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.nameTamil || c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>District</label>
                <select name="district" value={form.district} onChange={handleChange} className={inputClass}>
                  <option value="">None</option>
                  {districts.map((d) => (
                    <option key={d._id} value={d._id}>{d.nameTamil || d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Author *</label>
                <select name="author" value={form.author} onChange={handleChange} required className={inputClass}>
                  <option value="">Select</option>
                  {authors.map((a) => (
                    <option key={a._id} value={a._id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input name="tags" value={form.tags} onChange={handleChange} className={inputClass} />
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isBreaking" checked={form.isBreaking} onChange={handleChange} />
                  Breaking
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isLive" checked={form.isLive} onChange={handleChange} />
                  Live
                </label>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
              <h3 className="font-semibold">Featured Image</h3>
              <input name="featuredImage" value={form.featuredImage} onChange={handleChange} className={inputClass} placeholder="Image URL" />
              <input name="imageAlt" value={form.imageAlt} onChange={handleChange} className={inputClass} placeholder="Alt text" />
              <input name="imageCaption" value={form.imageCaption} onChange={handleChange} className={inputClass} placeholder="Caption" />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
              <h3 className="font-semibold">SEO</h3>
              <input name="seoTitle" value={form.seoTitle} onChange={handleChange} className={inputClass} placeholder="SEO Title" />
              <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} rows={2} className={inputClass} placeholder="Meta Description" />
              <input name="focusKeyword" value={form.focusKeyword} onChange={handleChange} className={inputClass} placeholder="Focus Keyword" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, 'DRAFT')} disabled={loading} className="btn-secondary">
            Save Draft
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, 'PENDING')} disabled={loading} className="btn-secondary">
            Submit for Review
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, 'PUBLISHED')} disabled={loading} className="btn-primary">
            Publish
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;
