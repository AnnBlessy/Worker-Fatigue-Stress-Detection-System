import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  // Analyze a single frame
  analyzeFrame: async (imageBlob) => {
    const formData = new FormData();
    formData.append('file', imageBlob, 'frame.jpg');
    
    const response = await axios.post(`${API_BASE_URL}/analyze-frame`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  // Get analytics summary
  getAnalyticsSummary: async () => {
    const response = await axios.get(`${API_BASE_URL}/analytics/summary`);
    return response.data;
  },
  
  // Get prediction history
  getPredictionHistory: async (limit = 100) => {
    const response = await axios.get(`${API_BASE_URL}/analytics/history`, {
      params: { limit }
    });
    return response.data;
  },
  
  // Reset session
  resetSession: async () => {
    const response = await axios.post(`${API_BASE_URL}/session/reset`);
    return response.data;
  },
  
  // Health check
  healthCheck: async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  }
};

export default api;