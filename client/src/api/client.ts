import axios from 'axios';

// Centralized Axios instance
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('emp_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Retries & 401 JWT Rotation
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // Initial setup for retries count
    originalRequest._retryCount = originalRequest._retryCount || 0;

    // Handle 401 Unauthorized (Token Expiration)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('emp_refresh_token');
      if (refreshToken) {
        try {
          // Note: call raw axios to avoid interceptor recursion
          const res = await axios.post(`${client.defaults.baseURL}/api/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = res.data;
          
          localStorage.setItem('emp_access_token', accessToken);
          localStorage.setItem('emp_refresh_token', newRefreshToken);
          
          client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          processQueue(null, accessToken);
          isRefreshing = false;
          
          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          
          // Refresh token is dead - clear auth state and redirect/logout
          localStorage.removeItem('emp_access_token');
          localStorage.removeItem('emp_refresh_token');
          localStorage.removeItem('emp_username');
          localStorage.removeItem('emp_user');
          window.location.hash = '#login';
          return Promise.reject(refreshError);
        }
      }
    }

    // Auto-Retry Network Failures / 5xx Server Errors (excluding 4xx client errors)
    const isNetworkOrServerError = !error.response || (error.response.status >= 500 && error.response.status <= 599);
    
    if (isNetworkOrServerError && originalRequest._retryCount < 3) {
      originalRequest._retryCount += 1;
      console.warn(`[Axios Client] Network/Server failure. Retrying call (${originalRequest._retryCount}/3)...`);
      
      // Delay before retrying (exponential backoff)
      const delay = Math.pow(2, originalRequest._retryCount) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      
      return client(originalRequest);
    }

    return Promise.reject(error);
  }
);
