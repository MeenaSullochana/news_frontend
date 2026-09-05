import api from './api';

export const articleService = {
  getLatest: (limit = 10) => api.get(`/articles/latest?limit=${limit}`),
  getFeatured: () => api.get('/articles/featured'),
  getMustWatch: (limit = 8) => api.get(`/articles/must-watch?limit=${limit}`),
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
  uploadAudio: (formData) =>
    api.post('/media/upload-audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => api.put(`/media/${id}`, data),
  delete: (id) => api.delete(`/media/${id}`),
};

export const settingService = {
  getPublic: () => api.get('/settings/public'),
  getAll: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  uploadBrand: (type, file) => {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);
    return api.post(`/settings/upload-brand?type=${encodeURIComponent(type)}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
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
  getMyPermissions: () => api.get('/users/permissions/me'),
  getPermissionConfig: () => api.get('/users/permissions'),
  updateRolePermissions: (role, pages) =>
    api.put(`/users/permissions/${role}`, { pages }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const featureService = {
  getHub: () => api.get('/features/hub'),
  getByKey: (key) => api.get(`/features/key/${key}`),
  getWeatherLive: (params) => api.get('/features/weather/live', { params }),
  getGoldLive: () => api.get('/features/gold/live'),
  getFuelLive: (params) => api.get('/features/fuel/live', { params }),
  getFuelDistricts: () => api.get('/features/fuel/districts'),
  getWeatherDistricts: () => api.get('/features/weather/districts'),
  getWeatherDistrict: (district) => api.get(`/features/weather/districts/${district}`),
  getAll: () => api.get('/features'),
  create: (data) => api.post('/features', data),
  update: (id, data) => api.put(`/features/${id}`, data),
  delete: (id) => api.delete(`/features/${id}`),
  syncDefaults: () => api.post('/features/sync'),
  getItems: (params = {}) => api.get('/features/items', { params }),
  createItem: (data) => api.post('/features/items', data),
  updateItem: (id, data) => api.put(`/features/items/${id}`, data),
  deleteItem: (id) => api.delete(`/features/items/${id}`),
};

export const marketplaceService = {
  getProducts: (params = {}) => api.get('/marketplace/products', { params }),
  getHubProducts: (limit = 3) => api.get('/marketplace/products/hub', { params: { limit } }),
  getProduct: (id) => api.get(`/marketplace/products/${id}`),
  sendEnquiry: (id, data) => api.post(`/marketplace/products/${id}/enquiries`, data),
  registerSeller: (data) => api.post('/marketplace/seller/register', data),
  getSellerStats: () => api.get('/marketplace/seller/stats'),
  getMyProducts: () => api.get('/marketplace/seller/products'),
  createProduct: (data) => api.post('/marketplace/seller/products', data),
  updateProduct: (id, data) => api.put(`/marketplace/seller/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/marketplace/seller/products/${id}`),
  getMyEnquiries: () => api.get('/marketplace/seller/enquiries'),
  updateEnquiry: (id, data) => api.put(`/marketplace/seller/enquiries/${id}`, data),
  getAdminProducts: (params = {}) => api.get('/marketplace/admin/products', { params }),
  reviewProduct: (id, data) => api.put(`/marketplace/admin/products/${id}/review`, data),
  getAdminEnquiries: () => api.get('/marketplace/admin/enquiries'),
};

export const youtubeService = {
  getPublic: () => api.get('/youtube/public'),
  getAdmin: () => api.get('/youtube/admin'),
  updateChannel: (data) => api.put('/youtube/channel', data),
  syncNow: () => api.post('/youtube/sync'),
  getVideos: () => api.get('/youtube/videos'),
  createVideo: (data) => api.post('/youtube/videos', data),
  updateVideo: (id, data) => api.put(`/youtube/videos/${id}`, data),
  deleteVideo: (id) => api.delete(`/youtube/videos/${id}`),
  reorderVideos: (orderedIds) => api.put('/youtube/videos/reorder', { orderedIds }),
};

export const instagramPostService = {
  getPublic: () => api.get('/instagram-posts/public'),
  getConfig: () => api.get('/instagram-posts/config'),
  updateConfig: (data) => api.put('/instagram-posts/config', data),
  fetchPreview: (url) => api.post('/instagram-posts/fetch', { url }),
  getAll: () => api.get('/instagram-posts'),
  create: (data) => api.post('/instagram-posts', data),
  update: (id, data) => api.put(`/instagram-posts/${id}`, data),
  delete: (id) => api.delete(`/instagram-posts/${id}`),
  reorder: (orderedIds) => api.put('/instagram-posts/reorder', { orderedIds }),
  syncPost: (id, data = {}) => api.put(`/instagram-posts/${id}/sync`, data),
  syncAll: () => api.post('/instagram-posts/sync-all'),
};

export const googleNewsService = {
  getPublic: (limit = 12) => api.get(`/google-news/public?limit=${limit}`),
  getPublicList: (params = {}) => api.get('/google-news/public/list', { params }),
  getBySlug: (slug) => api.get(`/google-news/public/slug/${slug}`),
  getRelated: (slug, limit = 6) => api.get(`/google-news/public/slug/${slug}/related`, { params: { limit } }),
  getConfig: () => api.get('/google-news/config'),
  updateConfig: (data) => api.put('/google-news/config', data),
  fetchNow: () => api.post('/google-news/fetch'),
  enrichExisting: (limit = 30) => api.post('/google-news/enrich', { limit }),
  getFilters: () => api.get('/google-news/filters'),
  getItems: (params = {}) => api.get('/google-news/items', { params }),
  getItem: (id) => api.get(`/google-news/items/${id}`),
  createItem: (data) => api.post('/google-news/items', data),
  updateItem: (id, data) => api.put(`/google-news/items/${id}`, data),
  bulkStatus: (ids, status) => api.put('/google-news/items/bulk-status', { ids, status }),
  deleteItem: (id) => api.delete(`/google-news/items/${id}`),
};

export const adSenseService = {
  getPublic: (params = {}) => api.get('/adsense/public', { params }),
  getMeta: () => api.get('/adsense/meta'),
  getAll: (params = {}) => api.get('/adsense', { params }),
  getById: (id) => api.get(`/adsense/${id}`),
  create: (data) => api.post('/adsense', data),
  update: (id, data) => api.put(`/adsense/${id}`, data),
  toggle: (id, isActive) => api.put(`/adsense/${id}/toggle`, { isActive }),
  delete: (id) => api.delete(`/adsense/${id}`),
};

export const travelNotificationService = {
  getPublic: (params = {}) => api.get('/travel-notifications/public', { params }),
  getPublicList: (params = {}) => api.get('/travel-notifications/public/list', { params }),
  getConfig: () => api.get('/travel-notifications/config'),
  getStatus: () => api.get('/travel-notifications/status'),
  getFetchLogs: (params = {}) => api.get('/travel-notifications/fetch-logs', { params }),
  updateConfig: (data) => api.put('/travel-notifications/config', data),
  fetchNow: (modes) => api.post('/travel-notifications/fetch', { modes }),
  getUpdates: (params = {}) => api.get('/travel-notifications/updates', { params }),
  updateItem: (id, data) => api.put(`/travel-notifications/updates/${id}`, data),
  deleteItem: (id) => api.delete(`/travel-notifications/updates/${id}`),
};

export const sportsService = {
  getPublic: (params = {}) => api.get('/sports/public', { params }),
  getPublicList: (params = {}) => api.get('/sports/public/list', { params }),
  getPublicMatch: (id) => api.get(`/sports/public/matches/${id}`),
  getPublicMatchPlayer: (id, playerKey) =>
    api.get(`/sports/public/matches/${id}/players/${encodeURIComponent(playerKey)}`),
  getConfig: () => api.get('/sports/config'),
  getStatus: () => api.get('/sports/status'),
  updateConfig: (data) => api.put('/sports/config', data),
  fetchNow: (sports) => api.post('/sports/fetch', { sports }, { timeout: 90000 }),
  getMatches: (params = {}) => api.get('/sports/matches', { params }),
  updateMatch: (id, data) => api.put(`/sports/matches/${id}`, data),
  deleteMatch: (id) => api.delete(`/sports/matches/${id}`),
  getStandings: (params = {}) => api.get('/sports/standings', { params }),
  deleteStanding: (id) => api.delete(`/sports/standings/${id}`),
};

export const governmentNotificationService = {
  getPublic: (params = {}) => api.get('/government-notifications/public', { params }),
  getHub: (limit = 6) => api.get('/government-notifications/public/hub', { params: { limit } }),
  getPublicList: (params = {}) => api.get('/government-notifications/public/list', { params }),
  getConfig: () => api.get('/government-notifications/config'),
  updateConfig: (data) => api.put('/government-notifications/config', data),
  fetchNow: () => api.post('/government-notifications/fetch'),
  getNotifications: (params = {}) => api.get('/government-notifications/notifications', { params }),
  updateNotification: (id, data) => api.put(`/government-notifications/notifications/${id}`, data),
  bulkStatus: (ids, status) =>
    api.put('/government-notifications/notifications/bulk-status', { ids, status }),
  bulkDelete: (ids) =>
    api.post('/government-notifications/notifications/bulk-delete', { ids }),
  publishAll: () => api.post('/government-notifications/notifications/publish-all'),
  deleteNotification: (id) => api.delete(`/government-notifications/notifications/${id}`),
};

export const matrimonyService = {
  getPublic: (params = {}) => api.get('/matrimony/public', { params }),
  getHub: (limit = 3) => api.get('/matrimony/public/hub', { params: { limit } }),
  getPublicProfile: (id) => api.get(`/matrimony/public/${id}`),
  getPublicCategories: () => api.get('/matrimony/public/categories'),
  getDashboard: () => api.get('/matrimony/admin/dashboard'),
  getConfig: () => api.get('/matrimony/admin/config'),
  updateConfig: (data) => api.put('/matrimony/admin/config', data),
  getCategories: (params = {}) => api.get('/matrimony/admin/categories', { params }),
  createCategory: (data) => api.post('/matrimony/admin/categories', data),
  updateCategory: (id, data) => api.put(`/matrimony/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/matrimony/admin/categories/${id}`),
  getProfiles: (params = {}) => api.get('/matrimony/admin/profiles', { params }),
  getProfile: (id) => api.get(`/matrimony/admin/profiles/${id}`),
  createProfile: (data) => api.post('/matrimony/admin/profiles', data),
  updateProfile: (id, data) => api.put(`/matrimony/admin/profiles/${id}`, data),
  deleteProfile: (id) => api.delete(`/matrimony/admin/profiles/${id}`),
  reviewProfile: (id, data) => api.put(`/matrimony/admin/profiles/${id}/review`, data),
  toggleFlags: (id, data) => api.put(`/matrimony/admin/profiles/${id}/flags`, data),
  uploadPhoto: (formData) =>
    api.post('/matrimony/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadDocument: (formData) =>
    api.post('/matrimony/admin/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  registerMember: (data) => api.post('/matrimony/member/register', data),
  getMemberProfile: () => api.get('/matrimony/member/profile'),
  createMemberProfile: (data) => api.post('/matrimony/member/profile', data),
  updateMemberProfile: (data) => api.put('/matrimony/member/profile', data),
  deleteMemberProfile: () => api.delete('/matrimony/member/profile'),
  uploadMemberPhoto: (formData) =>
    api.post('/matrimony/member/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadMemberDocument: (formData) =>
    api.post('/matrimony/member/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  sendEnquiry: (profileId, data) => api.post(`/matrimony/public/${profileId}/enquiries`, data),
  getMyEnquiries: () => api.get('/matrimony/member/enquiries'),
  getReceivedEnquiries: () => api.get('/matrimony/member/enquiries/received'),
  updateEnquiry: (id, data) => api.put(`/matrimony/member/enquiries/${id}`, data),
  getProfileEnquiries: (profileId) => api.get(`/matrimony/admin/profiles/${profileId}/enquiries`),
  updateProfileEnquiry: (profileId, enquiryId, data) =>
    api.put(`/matrimony/admin/profiles/${profileId}/enquiries/${enquiryId}`, data),
};

export const aeoService = {
  getDashboard: () => api.get('/aeo/dashboard'),
  getConfig: () => api.get('/aeo/config'),
  updateConfig: (data) => api.put('/aeo/config', data),
  getFaqs: () => api.get('/aeo/faqs'),
  createFaq: (data) => api.post('/aeo/faqs', data),
  updateFaq: (id, data) => api.put(`/aeo/faqs/${id}`, data),
  deleteFaq: (id) => api.delete(`/aeo/faqs/${id}`),
  getEntities: () => api.get('/aeo/entities'),
  createEntity: (data) => api.post('/aeo/entities', data),
  updateEntity: (id, data) => api.put(`/aeo/entities/${id}`, data),
  deleteEntity: (id) => api.delete(`/aeo/entities/${id}`),
  getPages: () => api.get('/aeo/pages'),
  createPage: (data) => api.post('/aeo/pages', data),
  updatePage: (id, data) => api.put(`/aeo/pages/${id}`, data),
  deletePage: (id) => api.delete(`/aeo/pages/${id}`),
  scorePreview: (data) => api.post('/aeo/pages/score-preview', data),
  getSchemaPreview: () => api.get('/aeo/schema/preview'),
  getRssPreview: (params) => api.get('/aeo/rss/preview', { params }),
  getReport: () => api.get('/aeo/report'),
  getGeminiStatus: () => api.get('/aeo/gemini/status'),
  testGemini: () => api.post('/aeo/gemini/test'),
  generateGemini: (data, config = {}) =>
    api.post('/aeo/gemini/generate', data, { timeout: config.timeout ?? 125000 }),
  applyGeminiPage: (data) => api.post('/aeo/gemini/apply-page', data),
  applyGeminiArticle: (data) => api.post('/aeo/gemini/apply-article', data),
  getGeminiUsage: (params = {}) => api.get('/aeo/gemini/usage', { params }),
};

export const pageContentService = {
  getPublicAbout: () => api.get('/pages/public/about'),
  getAll: () => api.get('/pages'),
  getAboutAdmin: () => api.get('/pages/about'),
  saveAbout: (data) => api.put('/pages/about', data),
};
