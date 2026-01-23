import api from './api';

const disputeService = {
  raiseDispute: async (disputeData) => {
    const response = await api.post('/disputes', disputeData);
    return response.data;
  },

  getMyDisputes: async () => {
    const response = await api.get('/disputes/my-disputes');
    return response.data;
  },

  getAllDisputes: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/disputes?${params}`);
    return response.data;
  },

  getDisputeById: async (disputeId) => {
    const response = await api.get(`/disputes/${disputeId}`);
    return response.data;
  },

  updateDisputeStatus: async (disputeId, statusData) => {
    const response = await api.put(`/disputes/${disputeId}/status`, statusData);
    return response.data;
  },
};

export default disputeService;