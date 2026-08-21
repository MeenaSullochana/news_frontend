import { useEffect, useState, useRef } from 'react';
import { mediaService } from '../services/articleService';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/helpers';

const Media = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef();

  const fetchMedia = () => {
    setLoading(true);
    mediaService.getAll({ limit: 50 })
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" id="media-upload" />
          <label htmlFor="media-upload" className="btn-primary cursor-pointer">Upload Image</label>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-32 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
              <div className="aspect-square">
                <img src={getImageUrl(item.thumbnailUrl || item.url)} alt={item.alt} className="w-full h-full object-cover" />
              </div>
              <div className="p-2">
                <p className="text-xs truncate">{item.originalName}</p>
                <p className="text-[10px] text-gray-400">{(item.size / 1024).toFixed(1)} KB</p>
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => { navigator.clipboard.writeText(item.url); toast.success('URL copied'); }}
                    className="text-[10px] text-brand-600"
                  >
                    Copy URL
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="text-[10px] text-red-500">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Media;
