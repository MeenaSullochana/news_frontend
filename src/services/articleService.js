import api from './api';

export const articleService = {
  getLatest: (limit = 10) => api.get(`/articles/latest?limit=${limit}`),
  getFeatured: () => api.get('/articles/featured'),
  getPopular: (limit = 10) => api.get(`/articles/popular?limit=${limit}`),
  getByCategory: (slug, page = 1, limit = 10) =>
    api.get(`/articles/category/${slug}?page=${page}&limit=${limit}`),
  getByDistrict: (district, page = 1, limit = 10) =>
    api.get(`/articles/district/${district}?page=${page}&limit=${limit}`),
  getBySlug: (slug) => api.get(`/articles/slug/${slug}`),
  getRelated: (slug) => api.get(`/articles/${slug}/related`),
  search: (q, page = 1, limit = 10) =>
    api.get(`/articles/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`),
  getAll: (params = {}) => api.get('/articles', { params }),
  getById: (id) => api.get(`/articles/${id}`),
  create: (data) => api.post('/articles', data),
  update: (id, data) => api.put(`/articles/${id}`, data),
  delete: (id, permanent = false) =>
    api.delete(`/articles/${id}${permanent ? '?permanent=true' : ''}`),
  addLiveUpdate: (id, data) => api.post(`/articles/${id}/live-updates`, data),
  getDashboardStats: () => api.get('/articles/dashboard/stats'),
};

export const categoryService = {
  getAll: (params = {}) => api.get('/categories', { params }),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const authorService = {
  getAll: () => api.get('/authors'),
  getAllAdmin: () => api.get('/authors/all'),
  getBySlug: (slug, page = 1) => api.get(`/authors/${slug}?page=${page}`),
  create: (data) => api.post('/authors', data),
  update: (id, data) => api.put(`/authors/${id}`, data),
  delete: (id) => api.delete(`/authors/${id}`),
};

export const breakingNewsService = {
  getActive: () => api.get('/breaking-news/active'),
  getAll: () => api.get('/breaking-news'),
  create: (data) => api.post('/breaking-news', data),
  update: (id, data) => api.put(`/breaking-news/${id}`, data),
  delete: (id) => api.delete(`/breaking-news/${id}`),
};

export const adService = {
  getByPosition: (position) => api.get(`/advertisements/position/${position}`),
  getAll: () => api.get('/advertisements'),
  create: (data) => api.post('/advertisements', data),
  update: (id, data) => api.put(`/advertisements/${id}`, data),
  delete: (id) => api.delete(`/advertisements/${id}`),
};

export const mediaService = {
  getAll: (params = {}) => api.get('/media', { params }),
  upload: (formData) =>
    api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => api.put(`/media/${id}`, data),
  delete: (id) => api.delete(`/media/${id}`),
};

export const settingService = {
  getPublic: () => api.get('/settings/public'),
  getAll: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const commentService = {
  getByArticle: (articleId) => api.get(`/comments/article/${articleId}`),
  create: (data) => api.post('/comments', data),
  getAll: (params = {}) => api.get('/comments', { params }),
  updateStatus: (id, status) => api.put(`/comments/${id}/status`, { status }),
};

export const newsletterService = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }),
};

export const userService = {
  getAll: () => api.get('/users'),
  getRoles: () => api.get('/users/roles'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};
