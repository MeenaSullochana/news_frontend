import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MatrimonyLogin = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'MATRIMONY' ? '/matrimony/member' : '/admin'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user?.role !== 'MATRIMONY') {
        await logout();
        toast.error('This login is for matrimony members only.');
        return;
      }
      toast.success('Welcome back');
      navigate('/matrimony/member');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg === 'Invalid credentials' ? 'Invalid email or password. Register first if you have no account.' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-stone-200 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 font-headline">Matrimony Login</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in to manage your matrimony profile</p>
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
          New member? <Link to="/matrimony/register" className="text-teal-700 font-semibold">Register</Link>
        </p>
        <p className="text-xs text-center mt-3">
          <Link to="/matrimony" className="text-slate-400 hover:text-slate-600">← Back to Matrimony Profiles</Link>
        </p>
      </div>
    </div>
  );
};

export default MatrimonyLogin;
