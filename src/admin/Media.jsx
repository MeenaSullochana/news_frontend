import { useEffect, useState, useRef, useMemo } from 'react';
import { mediaService } from '../services/articleService';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/helpers';
import AdminPageHeader from './AdminPageHeader';
import DataTable from './DataTable';

const Media = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef();

  const fetchMedia = () => {
    setLoading(true);
    mediaService.getAll({ limit: 100 })
      .then(({ data }) => setMedia(data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await mediaService.upload(formData);
      toast.success('Uploaded');
      fetchMedia();
    } catch {
      toast.error('Upload failed');
    }
    fileRef.current.value = '';
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this file?')) return;
    try {
      await mediaService.delete(id);
      toast.success('Deleted');
      fetchMedia();
    } catch {
      toast.error('Delete failed');
    }
  };

  const columns = useMemo(() => [
    {
      key: 'thumbnail',
      header: 'Preview',
      render: (row) => (
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
          <img src={getImageUrl(row.thumbnailUrl || row.url)} alt={row.alt || row.originalName} className="w-full h-full object-cover" />
        </div>
      ),
    },
    {
      key: 'originalName',
      header: 'File Name',
      sortable: true,
      render: (row) => <span className="font-medium text-slate-900">{row.originalName}</span>,
    },
    {
      key: 'mimetype',
      header: 'Type',
      sortable: true,
      render: (row) => <span className="text-xs text-slate-500 uppercase">{row.mimetype?.split('/')[1] || 'image'}</span>,
    },
    {
      key: 'size',
      header: 'Size',
      sortable: true,
      sortValue: (row) => row.size || 0,
      render: (row) => <span className="tabular-nums text-slate-600">{(row.size / 1024).toFixed(1)} KB</span>,
    },
    {
      key: 'createdAt',
      header: 'Uploaded',
      sortable: true,
      sortValue: (row) => row.createdAt ? new Date(row.createdAt).getTime() : 0,
      render: (row) => (
        <span className="text-slate-500 text-xs whitespace-nowrap">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="data-table-actions">
          <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(row.url); toast.success('URL copied'); }}
            className="data-table-action data-table-action-edit"
          >
            Copy URL
          </button>
          <button type="button" onClick={() => handleDelete(row._id)} className="data-table-action data-table-action-delete">
            Delete
          </button>
        </div>
      ),
    },
  ], []);

  return (
    <div>
      <AdminPageHeader title="Media Library" subtitle="Upload and manage images">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" id="media-upload" />
        <label htmlFor="media-upload" className="btn-primary cursor-pointer text-sm py-2.5 px-4 w-full sm:w-auto text-center">
          Upload Image
        </label>
      </AdminPageHeader>

      <DataTable
        columns={columns}
        data={media}
        loading={loading}
        searchPlaceholder="Search media files..."
        searchKeys={['originalName', 'alt', 'mimetype']}
        emptyMessage="No media files yet"
        emptyAction={
          <label htmlFor="media-upload" className="btn-primary mt-4 inline-flex cursor-pointer text-sm">
            Upload first image
          </label>
        }
        pageSize={10}
      />
    </div>
  );
};

export default Media;
