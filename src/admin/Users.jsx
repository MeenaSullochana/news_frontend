import { useEffect, useState } from 'react';
import { userService } from '../services/articleService';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'REPORTER', status: 'active' });

  useEffect(() => {
    userService.getAll().then(({ data }) => setUsers(data.data || []));
    userService.getRoles().then(({ data }) => setRoles(data.data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.create(form);
      toast.success('User created');
      setShowForm(false);
      const { data } = await userService.getAll();
      setUsers(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Add User</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="px-3 py-2 border rounded-md text-sm" />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="px-3 py-2 border rounded-md text-sm" />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="px-3 py-2 border rounded-md text-sm" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="px-3 py-2 border rounded-md text-sm">
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="btn-primary text-sm">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3"><span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded">{user.role}</span></td>
                <td className="px-4 py-3">{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
