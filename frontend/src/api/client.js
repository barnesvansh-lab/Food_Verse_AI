import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const updateConfig = async (config) => {
  const res = await api.post('/config', config);
  return res.data;
};

export const analyzeNutrition = async (formData) => {
  const res = await api.post('/nutrition/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const analyzeFreshness = async (formData) => {
  const res = await api.post('/freshness/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const analyzeHygiene = async (formData) => {
  const res = await api.post('/hygiene/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const generateRecipe = async (payload) => {
  const res = await api.post('/recipe/generate', payload);
  return res.data;
};

export const generateMealPlan = async (payload) => {
  const res = await api.post('/meal-plan/generate', payload);
  return res.data;
};

export default api;
