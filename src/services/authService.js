import api from './api';

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', {
      email: String(email || '').trim().toLowerCase(),
      password,
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  registerSeller: async (payload) => {
    const { data } = await api.post('/marketplace/seller/register', payload);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  registerMatrimonyMember: async (payload) => {
    const { data } = await api.post('/matrimony/member/register', {
      ...payload,
      email: String(payload.email || '').trim().toLowerCase(),
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};
