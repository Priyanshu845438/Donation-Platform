
import { API_BASE_URL } from './constants';

interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
}

export const apiFetch = async <T,>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const { method = 'GET', body } = options;
    
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        // Handle cases where response might be empty (e.g., 201 or 204 status)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json() as T;
        } else {
            return {} as T; // Return empty object for non-json responses
        }

    } catch (error: any) {
        console.error('API Fetch Error:', error);
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Network error: Could not connect to the API server. Please ensure the backend is running and CORS is configured.');
        }
        throw error;
    }
};