import axios from 'axios';

// Base API URL can be configured via environment variable VITE_API_URL
// Defaults to the standalone Flask AI service running on port 5001
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
});

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export const diseaseService = {
  /**
   * Run crop disease scan
   * @param {File} imageFile - Crop leaf image file
   * @param {string} symptoms - Optional symptom description
   * @param {string} cropType - Optional crop hint
   * @param {string} farmId - Optional field/farm plot ID
   */
  predictDisease: async (imageFile, symptoms = '', cropType = '', farmId = '') => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (symptoms.trim()) {
      formData.append('symptoms', symptoms);
    }
    if (cropType) {
      formData.append('crop_type', cropType);
    }
    if (farmId) {
      formData.append('farmId', farmId);
    }

    const response = await api.post('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Fetch scan history (last scans recorded)
   */
  getScanHistory: async () => {
    const response = await api.get('/history');
    return response.data;
  },

  /**
   * Check backend health and model status
   */
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  /**
   * Fetch supported disease classes and crops
   */
  getClasses: async () => {
    const response = await api.get('/classes');
    return response.data;
  },

  /**
   * Fetch active model architecture metadata
   */
  getModelInfo: async () => {
    const response = await api.get('/model-info');
    return response.data;
  },

  /**
   * Save or link scan to a plot/tag
   */
  saveScan: async (scanId, farmId) => {
    const response = await api.post('/save', { scanId, farmId });
    return response.data;
  },

  /**
   * Fetch complete 38-class pathology library
   */
  getPathologies: async () => {
    const response = await api.get('/pathologies');
    return response.data;
  },

  /**
   * Fetch live scan analytics and telemetry stats
   */
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },

  /**
   * Fetch complete verified dataset metadata, overview, splits, distributions, and quality report
   */
  getDatasetInfo: async () => {
    const response = await api.get('/dataset-info');
    return response.data;
  },

  /**
   * Fetch curated real sample images from dataset
   */
  getDatasetSamples: async (params = {}) => {
    const response = await api.get('/dataset-samples', { params });
    return response.data;
  },

  /**
   * Fetch searchable, paginated dataset preview records
   */
  getDatasetPreview: async (params = {}) => {
    const response = await api.get('/dataset-preview', { params });
    return response.data;
  },
};

export default diseaseService;
