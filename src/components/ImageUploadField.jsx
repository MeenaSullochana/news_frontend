import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { mediaService } from '../services/articleService';
import { getImageUrl } from '../utils/images';

/**
 * Image URL field with file upload + optional preview.
 * Uploads via POST /media/upload and writes the returned URL into `value`.
 */
const ImageUploadField = ({
  value = '',
  onChange,
  placeholder = 'Image URL',
  inputClassName = 'admin-input',
  showPreview = true,
  seed = 'upload',
  previewClassName = 'max-h-36 w-full object-contain rounded-lg bg-slate-50 border border-slate-200',
  required = false,
  label,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      e.target.value = '';
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const { data } = await mediaService.upload(fd);
      const url = data.data?.url || '';
      if (!url) throw new Error('No URL returned');
      onChange(url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-slate-700">{label}</p>}
      {showPreview && value?.trim() && (
        <div className="rounded-xl border border-slate-200 p-2 bg-slate-50">
          <img
            src={getImageUrl(value, seed)}
            alt=""
            className={previewClassName}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2 items-stretch">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`${inputClassName} flex-1 min-w-[180px]`}
        />
        <label className="btn-secondary text-sm py-2 px-3 cursor-pointer inline-flex items-center justify-center whitespace-nowrap disabled:opacity-50">
          {uploading ? 'Uploading…' : 'Upload image'}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/svg+xml,.jpg,.jpeg,.png,.gif,.webp,.avif,.svg"
            className="hidden"
            disabled={uploading}
            onChange={handleUpload}
          />
        </label>
        {value?.trim() && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-rose-600 hover:underline px-2"
          >
            Clear
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500">Upload a file from your computer, or paste an image URL.</p>
    </div>
  );
};

export default ImageUploadField;
