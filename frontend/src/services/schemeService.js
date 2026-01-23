import api from './api';

const schemeService = {
  createScheme: async (schemeData) => {
    const response = await api.post('/schemes', schemeData);
    return response.data;
  },

  getAllSchemes: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/schemes?${params}`);
    return response.data;
  },

  getSchemeById: async (schemeId, language = 'en') => {
    const response = await api.get(`/schemes/${schemeId}?language=${language}`);
    return response.data;
  },

  updateScheme: async (schemeId, schemeData) => {
    const response = await api.put(`/schemes/${schemeId}`, schemeData);
    return response.data;
  },

  deleteScheme: async (schemeId) => {
    const response = await api.delete(`/schemes/${schemeId}`);
    return response.data;
  },
};

export default schemeService;