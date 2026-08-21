import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articleService } from '../services/articleService';
import toast from 'react-hot-toast';
import { formatDateTime } from '../utils/helpers';

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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Link to="/admin/articles/create" className="btn-primary">+ Add Article</Link>
      </div>

      <div className="flex gap-2 overflow-x-auto mb-4 pb-2">
        {STATUS_TABS.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${
              status === s ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Status</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Published</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Views</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {articles.map((article) => (
                  <tr key={article._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium line-clamp-1">{article.title}</p>
                      <p className="text-xs text-gray-400 md:hidden">{article.status}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        article.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                        article.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
                        article.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {article.publishedAt ? formatDateTime(article.publishedAt) : '-'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">{article.views || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/articles/edit/${article._id}`}
                          className="text-brand-600 hover:underline text-xs"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(article._id)}
                          className="text-red-500 hover:underline text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {articles.length === 0 && (
            <p className="text-center py-8 text-gray-500">No articles found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Articles;
