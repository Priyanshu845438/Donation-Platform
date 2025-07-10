const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
export const api = {
  baseURL: API_BASE_URL,
  
  // Helper function to get auth headers
  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Generic request function
  request: async (method: string, endpoint: string, data?: any, headers?: any) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...api.getAuthHeaders(),
        ...headers,
      },
      credentials: 'include',
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API ${method} ${endpoint} failed:`, error);
      throw error;
    }
  },

  // Convenience methods
  get: (endpoint: string, headers?: any) => api.request('GET', endpoint, undefined, headers),
  post: (endpoint: string, data?: any, headers?: any) => api.request('POST', endpoint, data, headers),
  put: (endpoint: string, data?: any, headers?: any) => api.request('PUT', endpoint, data, headers),
  patch: (endpoint: string, data?: any, headers?: any) => api.request('PATCH', endpoint, data, headers),
  delete: (endpoint: string, headers?: any) => api.request('DELETE', endpoint, undefined, headers),
};

export default api;
