import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminThemeToggle from './AdminThemeToggle';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    if (user.role === 'SELLER') return <Navigate to="/seller" replace />;
    if (user.role === 'MATRIMONY') return <Navigate to="/matrimony/member" replace />;
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success('Login successful');
      navigate(
        data.user?.role === 'SELLER'
          ? '/seller'
          : data.user?.role === 'MATRIMONY'
            ? '/matrimony/member'
            : '/admin'
      );
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? 'Cannot reach the server. Make sure the backend is running on port 5000.'
          : 'Login failed');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row">
      {/* Brand panel — hidden on small mobile */}
      <div className="hidden sm:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-800 to-news-dark p-8 lg:p-12 flex-col justify-between">
        <div>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">G</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white font-headline leading-tight">
            The Great India News
          </h1>
          <p className="text-brand-200 mt-2 text-lg">தி கிரேட் இந்தியா நியூஸ்</p>
        </div>
        <p className="text-slate-400 text-sm">
          Professional news management system for editors and administrators.
        </p>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative admin-page-bg">
        <div className="absolute top-4 right-4">
          <AdminThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="sm:hidden text-center mb-8">
            <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">G</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Login</h1>
          </div>

          <div className="admin-card shadow-xl p-6 sm:p-8">
            <h2 className="hidden sm:block text-2xl font-bold text-slate-900 mb-1">Sign in</h2>
            <p className="hidden sm:block text-slate-500 text-sm mb-6">Enter your admin credentials</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="admin-input"
                  placeholder="admin@thegreatindianews.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="admin-input"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <Link to="/" className="block text-center text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 mt-6">
              ← Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
