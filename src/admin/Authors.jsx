import { useEffect, useState, useMemo } from 'react';
import { authorService } from '../services/articleService';
import toast from 'react-hot-toast';
import AdminPageHeader from './AdminPageHeader';
import DataTable from './DataTable';
import { getImageUrl } from '../utils/helpers';
import ImageUploadField from '../components/ImageUploadField';

const emptyForm = { name: '', slug: '', designation: '', bio: '', profileImage: '', status: 'active' };

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const fetchAuthors = () => {
    setLoading(true);
    authorService.getAllAdmin()
      .then(({ data }) => setAuthors(data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAuthors(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await authorService.update(editId, form);
        toast.success('Author updated');
      } else {
        await authorService.create(form);
        toast.success('Author created');
      }
      resetForm();
      fetchAuthors();
    } catch {
      toast.error('Failed to save');
    }
  };

  const openEdit = (author) => {
    setForm({
      name: author.name,
      slug: author.slug,
      designation: author.designation || '',
      bio: author.bio || '',
      profileImage: author.profileImage || '',
      status: author.status || 'active',
    });
    setEditId(author._id);
    setShowForm(true);
  };

  const columns = useMemo(() => [
    {
      key: 'profileImage',
      header: 'Photo',
      render: (row) => (
        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
          {row.profileImage ? (
            <img src={getImageUrl(row.profileImage)} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-600 font-bold">{row.name?.charAt(0)}</div>
          )}
        </div>
      ),
    },
    { key: 'name', header: 'Name', sortable: true, render: (row) => <span className="font-medium text-slate-900">{row.name}</span> },
    { key: 'designation', header: 'Designation', sortable: true, render: (row) => <span className="text-brand-600">{row.designation || '-'}</span> },
    { key: 'slug', header: 'Slug', sortable: true, render: (row) => <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{row.slug}</code> },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button type="button" onClick={() => openEdit(row)} className="data-table-action data-table-action-edit">
          Edit
        </button>
      ),
    },
  ], []);

  return (
    <div>
      <AdminPageHeader
        title="Authors"
        subtitle="Manage reporters and writers"
        actionLabel={showForm ? undefined : '+ Add Author'}
        onAction={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">{editId ? 'Edit Author' : 'New Author'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="admin-input" />
            <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="admin-input" />
            <input placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="admin-input" />
            <div className="sm:col-span-2">
              <ImageUploadField
                value={form.profileImage}
                onChange={(url) => setForm({ ...form, profileImage: url })}
                placeholder="Profile Image URL"
                seed={editId || form.slug || 'author'}
                previewClassName="w-20 h-20 rounded-full object-cover border border-slate-200"
              />
            </div>
          </div>
          <textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="admin-input mt-4" />
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button type="submit" className="btn-primary text-sm">Save</button>
            <button type="button" onClick={resetForm} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      <DataTable
        columns={columns}
        data={authors}
        loading={loading}
        searchPlaceholder="Search authors..."
        searchKeys={['name', 'designation', 'slug']}
        emptyMessage="No authors found"
      />
    </div>
  );
};

export default Authors;
