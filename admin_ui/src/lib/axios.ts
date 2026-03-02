import axios from 'axios';

// Get API Base URL from env
let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
if (!API_BASE_URL.endsWith('/admin')) {
    API_BASE_URL = `${API_BASE_URL}/admin`;
}

// Create Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Auto send cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response Interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle Unauthorized (401) and Forbidden (403)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Clear client auth state
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            localStorage.removeItem('sinotruk_admin_name');
            localStorage.removeItem('sinotruk_admin_avatar');

            // Redirect to login page using Vite BASE_URL
            const loginPath = import.meta.env.BASE_URL ? `${import.meta.env.BASE_URL}login`.replace('//', '/') : '/secret/login';
            
            // Avoid infinite loops if already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = loginPath;
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
