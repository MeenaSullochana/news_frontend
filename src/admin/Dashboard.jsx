import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articleService } from '../services/articleService';
import { useAuth } from '../context/AuthContext';

const STAT_CONFIG = [
  { key: 'todayCount', label: "Today's News", icon: '📅', accent: 'border-blue-500', text: 'text-blue-600' },
  { key: 'published', label: 'Published', icon: '✅', accent: 'border-green-500', text: 'text-green-600' },
  { key: 'drafts', label: 'Drafts', icon: '📝', accent: 'border-slate-400', text: 'text-slate-600' },
  { key: 'pending', label: 'Pending', icon: '⏳', accent: 'border-amber-500', text: 'text-amber-600' },
  { key: 'scheduled', label: 'Scheduled', icon: '🗓️', accent: 'border-purple-500', text: 'text-purple-600' },
  { key: 'totalViews', label: 'Total Views', icon: '👁️', accent: 'border-brand-500', text: 'text-brand-600' },
  { key: 'breakingCount', label: 'Breaking News', icon: '🔴', accent: 'border-red-500', text: 'text-red-600' },
  { key: 'authorCount', label: 'Authors', icon: '👤', accent: 'border-indigo-500', text: 'text-indigo-600' },
];

const QUICK_ACTIONS = [
  { label: 'New Article', path: '/admin/articles/create', primary: true, icon: '✏️' },
  { label: 'Features Hub', path: '/admin/features', icon: '🧩' },
  { label: 'Feature Content', path: '/admin/feature-content', icon: '🗂️' },
  { label: 'Breaking News', path: '/admin/breaking-news', icon: '🔴' },
  { label: 'Media Library', path: '/admin/media', icon: '🖼️' },
  { label: 'Categories', path: '/admin/categories', icon: '📁' },
];

const StatCard = ({ label, value, icon, accent, text }) => (
  <div className={`admin-stat-card border-l-4 ${accent}`}>
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">{label}</p>
        <p className={`text-2xl sm:text-3xl font-bold mt-1 ${text}`}>
          {value?.toLocaleString?.('en-IN') ?? value ?? 0}
        </p>
      </div>
      <span className="text-xl sm:text-2xl opacity-80 flex-shrink-0">{icon}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
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
      <div className="space-y-6">
        <div className="skeleton h-24 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome banner */}
      <div className="admin-banner">
        <div className="relative z-10">
          <p className="text-brand-200 text-sm font-medium">Welcome back</p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mt-1">
            {user?.name || 'Admin'}
          </h2>
          <p className="text-slate-300 text-sm mt-2 max-w-xl">
            Manage articles, hub features, ads, users and site settings — built to scale with new modules.
          </p>
        </div>
        <div className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2 text-6xl opacity-20">
          📰
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STAT_CONFIG.map(({ key, label, icon, accent, text }) => (
          <StatCard
            key={key}
            label={label}
            value={stats?.[key]}
            icon={icon}
            accent={accent}
            text={text}
          />
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
        <div className="admin-card xl:col-span-3">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Top Articles</h2>
            <Link to="/admin/articles" className="text-sm text-brand-600 hover:underline font-medium">
              View all →
            </Link>
          </div>
          {stats?.topArticles?.length > 0 ? (
            <div className="space-y-3">
              {stats.topArticles.map((article, i) => (
                <div
                  key={article._id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-100 text-brand-700 text-xs sm:text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/news/${article.slug}`}
                      target="_blank"
                      className="text-sm sm:text-base font-medium text-slate-900 group-hover:text-brand-600 line-clamp-2 leading-snug"
                    >
                      {article.title}
                    </Link>
                    <p className="text-xs text-slate-400 mt-1">
                      {article.views?.toLocaleString('en-IN')} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm py-8 text-center">No articles yet</p>
          )}
        </div>

        <div className="admin-card xl:col-span-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-5">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  action.primary
                    ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md hover:shadow-lg'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span className="text-lg">{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
