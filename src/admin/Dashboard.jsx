import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articleService } from '../services/articleService';

const StatCard = ({ label, value, color = 'brand' }) => (
  <div className="bg-white rounded-xl shadow-sm p-5">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`text-3xl font-bold text-${color}-600 mt-1`}>{value?.toLocaleString?.() ?? value ?? 0}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articleService
      .getDashboardStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Today's News" value={stats?.todayCount} />
        <StatCard label="Published" value={stats?.published} />
        <StatCard label="Drafts" value={stats?.drafts} />
        <StatCard label="Pending" value={stats?.pending} />
        <StatCard label="Scheduled" value={stats?.scheduled} />
        <StatCard label="Total Views" value={stats?.totalViews} />
        <StatCard label="Breaking News" value={stats?.breakingCount} />
        <StatCard label="Authors" value={stats?.authorCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Top Articles</h2>
          {stats?.topArticles?.length > 0 ? (
            <div className="space-y-3">
              {stats.topArticles.map((article, i) => (
                <div key={article._id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-brand-600 w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <Link to={`/news/${article.slug}`} className="text-sm font-medium hover:text-brand-600 line-clamp-1">
                      {article.title}
                    </Link>
                    <p className="text-xs text-gray-400">{article.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No data yet</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/articles/create" className="btn-primary text-center text-sm py-3">
              + New Article
            </Link>
            <Link to="/admin/breaking-news" className="btn-secondary text-center text-sm py-3">
              Breaking News
            </Link>
            <Link to="/admin/media" className="btn-secondary text-center text-sm py-3">
              Media Library
            </Link>
            <Link to="/admin/categories" className="btn-secondary text-center text-sm py-3">
              Categories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
