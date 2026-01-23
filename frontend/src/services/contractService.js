import api from './api';

const contractService = {
  createContract: async (formData) => {
    const response = await api.post('/contracts', formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  getAllContracts: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/contracts?${params}`);
    return response.data;
  },

  getContractById: async (contractId) => {
    const response = await api.get(`/contracts/${contractId}`);
    return response.data;
  },

  getCompanyContracts: async () => {
    const response = await api.get('/contracts/my-contracts');
    return response.data;
  },

  applyToContract: async (contractId, applicationData) => {
    const response = await api.post(`/contracts/${contractId}/apply`, applicationData);
    return response.data;
  },

  getContractApplications: async (contractId) => {
    const response = await api.get(`/contracts/${contractId}/applications`);
    return response.data;
  },

  getFarmerApplications: async () => {
    const response = await api.get('/contracts/applications/my-applications');
    return response.data;
  },

  updateApplicationStatus: async (applicationId, statusData) => {
    const response = await api.put(`/contracts/applications/${applicationId}/status`, statusData);
    return response.data;
  },

  verifyLegalContract: async (contractId, verificationData) => {
    const response = await api.put(`/contracts/${contractId}/verify-legal`, verificationData);
    return response.data;
  },

  updateContractStatus: async (contractId, statusData) => {
    const response = await api.put(`/contracts/${contractId}/status`, statusData);
    return response.data;
  },
   selectFarmer: async (contractId, applicationId) => {
    const response = await api.put(`/contracts/${contractId}/applications/${applicationId}/select`);
    return response.data;
  },

  uploadLegalContract: async (contractId, file) => {
    const formData = new FormData();
    formData.append('legalContract', file);
    
    const response = await api.post(`/contracts/${contractId}/upload-legal-contract`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updatePayment: async (contractId, paymentData) => {
    const response = await api.put(`/contracts/${contractId}/payment`, paymentData);
    return response.data;
  },

  addDelivery: async (contractId, deliveryData) => {
    const response = await api.post(`/contracts/${contractId}/delivery`, deliveryData);
    return response.data;
  },

  markAsInProgress: async (contractId) => {
    const response = await api.put(`/contracts/${contractId}/mark-in-progress`);
    return response.data;
  },

  markAsCompleted: async (contractId) => {
    const response = await api.put(`/contracts/${contractId}/mark-completed`);
    return response.data;
  },

  cancelContract: async (contractId, reason) => {
    const response = await api.put(`/contracts/${contractId}/cancel`, { reason });
    return response.data;
  },
};

export default contractService;