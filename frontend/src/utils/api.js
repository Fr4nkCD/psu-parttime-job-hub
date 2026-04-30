// src/utils/api.js
const BASE_URL = 'http://127.0.0.1:8000/api';

const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('access_token');
    
    // Merge headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Automatically inject JWT if available
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // If the backend says 401, the token is likely expired
    if (response.status === 401) {
        console.warn("Session expired. Handle refresh logic or redirect to login.");
    }

    return response;
};

export default apiRequest;