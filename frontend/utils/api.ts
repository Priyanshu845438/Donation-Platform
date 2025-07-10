import { API_BASE_URL } from './constants';

interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: any;
}

export const apiFetch = async <T,>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const { method = 'GET', body } = options;
    
    const token = localStorage.getItem('token');
    
    const isFormData = body instanceof FormData;

    const headers: Record<string, string> = { ...options.headers };
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method,
        headers,
    };

    if (body) {
        config.body = isFormData ? body : JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        const text = await response.text();
        const json = text ? JSON.parse(text) : {};

        if (!response.ok) {
            throw new Error(json.message || `HTTP error! status: ${response.status}`);
        }
        
        // The backend consistently wraps successful data payloads in a 'data' property.
        // We unwrap it here for convenience across the app.
        if (json.data !== undefined) {
            return json.data as T;
        }

        // Handle successful responses that might not have a 'data' wrapper (e.g. older endpoints)
        // or responses with no body (e.g. 204 No Content).
        return json as T;

    } catch (error: any) {
        console.error('API Fetch Error:', error.message, 'on endpoint:', endpoint);
        if (error.message.includes('JSON.parse')) {
             throw new Error('Received an invalid response from the server.');
        }
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Network error: Could not connect to the API server. Please ensure the backend is running and CORS is configured.');
        }
        throw error;
    }
};