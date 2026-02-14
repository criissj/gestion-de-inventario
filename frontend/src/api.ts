import axios from 'axios';

// Create an axios instance
// In development with Vite proxy, '/api' commands will be forwarded to the backend
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
