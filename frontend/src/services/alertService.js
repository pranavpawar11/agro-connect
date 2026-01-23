import api from './api';

const alertService = {
  createWeatherAlert: async (alertData) => {
    const response = await api.post('/alerts/weather', alertData);
    return response.data;
  },

  createMandiPrice: async (priceData) => {
    const response = await api.post('/alerts/mandi-price', priceData);
    return response.data;
  },

  createNotification: async (notificationData) => {
    const response = await api.post('/alerts/notification', notificationData);
    return response.data;
  },

  getWeatherAlerts: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/alerts/weather?${params}`);
    return response.data;
  },

  getMandiPrices: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/alerts/mandi-prices?${params}`);
    return response.data;
  },

  getMyNotifications: async () => {
    const response = await api.get('/alerts/notifications');
    return response.data;
  },

  deleteAlert: async (alertId) => {
    const response = await api.delete(`/alerts/${alertId}`);
    return response.data;
  },
};

export default alertService;