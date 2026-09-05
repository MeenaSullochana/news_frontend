import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const empty = { name: '', email: '', password: '', phone: '', businessName: '', city: '' };

const SellerRegister = () => {
  const { user, registerSeller } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'SELLER' ? '/seller' : '/admin'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerSeller(form);
      toast.success('Account created — submit products for admin approval');
      navigate('/seller');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md border border-stone-200 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 font-headline">Seller Registration</h1>
        <p className="text-sm text-slate-500 mt-1">Create an account to list products on The Great India News Marketplace</p>
        <form onSubmit={handleSubmit} className="mt-6 grid sm:grid-cols-2 gap-4">
          {[
            ['name', 'Full name', 'text', true],
            ['email', 'Email', 'email', true],
            ['password', 'Password (min 6)', 'password', true],
            ['phone', 'Phone', 'tel', false],
            ['businessName', 'Business / shop name', 'text', false],
            ['city', 'City', 'text', false],
          ].map(([key, label, type, required]) => (
            <label key={key} className={`block text-sm ${key === 'businessName' ? 'sm:col-span-2' : ''}`}>
              <span className="text-slate-600">{label}</span>
              <input
                required={required}
                type={type}
                className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2.5"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}
          <button type="submit" disabled={loading} className="btn-primary sm:col-span-2">
            {loading ? 'Creating…' : 'Create seller account'}
          </button>
        </form>
        <p className="text-sm text-slate-500 mt-4 text-center">
          Already registered? <Link to="/seller/login" className="text-teal-700 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SellerRegister;
