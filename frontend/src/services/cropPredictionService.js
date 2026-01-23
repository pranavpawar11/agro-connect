import api from './api';

const cropPredictionService = {
  predictCrop: async (predictionData) => {
    const response = await api.post('/crop-prediction/predict', predictionData);
    return response.data;
  },

  getPredictionHistory: async (page = 1, limit = 10) => {
    const response = await api.get(`/crop-prediction/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  getPredictionById: async (predictionId) => {
    const response = await api.get(`/crop-prediction/${predictionId}`);
    return response.data;
  },
};

export default cropPredictionService;