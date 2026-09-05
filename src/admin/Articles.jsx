import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { articleService } from '../services/articleService';
import toast from 'react-hot-toast';
import { formatDateTime } from '../utils/helpers';
import AdminPageHeader, { StatusBadge } from './AdminPageHeader';
import DataTable from './DataTable';

const STATUS_TABS = ['', 'PUBLISHED', 'DRAFT', 'PENDING', 'SCHEDULED', 'TRASH'];

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const fetchArticles = () => {
    setLoading(true);
    const params = status ? { status } : {};
    articleService
      .getAll(params)
      .then(({ data }) => setArticles(data.data || []))
      .catch(() => toast.error('Failed to load articles'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, [status]);

  const handleDelete = async (id) => {
    if (!confirm('Move to trash?')) return;
    try {
      await articleService.delete(id);
      toast.success('Article moved to trash');
      fetchArticles();
    } catch {
      toast.error('Delete failed');
    }
  };

  const columns = useMemo(() => [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      cellClassName: 'max-w-xs sm:max-w-md',
      render: (row) => (
        <p className="font-medium text-slate-900 line-clamp-2 leading-snug">{row.title}</p>
      ),
    },
    {
      key: 'category.nameTamil',
      header: 'Category',
      sortable: true,
      sortValue: (row) => row.category?.nameTamil || row.category?.name || '',
      render: (row) => (
        <span className="text-slate-600 whitespace-nowrap">
          {row.category?.nameTamil || row.category?.name || '-'}
        </span>
      ),
    },
    {
      key: 'author.name',
      header: 'Author',
      sortable: true,
      sortValue: (row) => row.author?.name || '',
      render: (row) => row.author?.name || '-',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'publishedAt',
      header: 'Published',
      sortable: true,
      sortValue: (row) => row.publishedAt ? new Date(row.publishedAt).getTime() : 0,
      render: (row) => (
        <span className="text-slate-500 whitespace-nowrap text-xs sm:text-sm">
          {row.publishedAt ? formatDateTime(row.publishedAt) : '-'}
        </span>
      ),
    },
    {
      key: 'views',
      header: 'Views',
      sortable: true,
      sortValue: (row) => row.views || 0,
      render: (row) => (
        <span className="font-medium tabular-nums">{row.views?.toLocaleString('en-IN') || 0}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="data-table-actions">
          <Link to={`/admin/articles/edit/${row._id}`} className="data-table-action data-table-action-edit">
            Edit
          </Link>
          <button type="button" onClick={() => handleDelete(row._id)} className="data-table-action data-table-action-delete">
            Delete
          </button>
        </div>
      ),
    },
  ], []);

  const statusToolbar = (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide max-w-full">
      {STATUS_TABS.map((s) => (
        <button
          key={s || 'all'}
          type="button"
          onClick={() => setStatus(s)}
          className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
            status === s
              ? 'bg-brand-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {s || 'All'}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <AdminPageHeader
        title="Articles"
        subtitle="Manage all news articles"
        actionLabel="+ Add Article"
        actionTo="/admin/articles/create"
      />

      <DataTable
        columns={columns}
        data={articles}
        loading={loading}
        searchPlaceholder="Search articles..."
        searchKeys={['title', 'author.name', 'category.nameTamil', 'category.name', 'status']}
        emptyMessage="No articles found"
        emptyAction={
          <Link to="/admin/articles/create" className="btn-primary mt-4 inline-flex text-sm">
            Create first article
          </Link>
        }
        toolbar={statusToolbar}
        pageSize={10}
      />
    </div>
  );
};

export default Articles;
