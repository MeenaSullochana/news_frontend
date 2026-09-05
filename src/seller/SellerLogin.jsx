import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SellerLogin = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'SELLER' ? '/seller' : '/admin'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user?.role !== 'SELLER') {
        await logout();
        toast.error('This login is for sellers only. Use Admin login for staff.');
        navigate('/admin/login');
        return;
      }
      toast.success('Welcome back');
      navigate('/seller');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-stone-200 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 font-headline">Seller Login</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your Marketplace listings and enquiries</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-slate-600">Email</span>
            <input required type="email" className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2.5" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="text-slate-600">Password</span>
            <input required type="password" className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2.5" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="text-sm text-slate-500 mt-4 text-center">
          New seller? <Link to="/seller/register" className="text-teal-700 font-semibold">Register</Link>
        </p>
        <p className="text-xs text-center mt-3">
          <Link to="/marketplace" className="text-slate-400 hover:text-slate-600">← Back to Marketplace</Link>
        </p>
      </div>
    </div>
  );
};

export default SellerLogin;
