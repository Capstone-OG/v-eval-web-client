/**
 * V-Eval API Gateway Client
 * 
 * Provides unified HTTP communication connecting the Web Client to the V-Eval YARP API Gateway (Port 5212).
 * Supports automatic JWT injection, Gateway header handling (e.g. X-Token-Refresh-Required),
 * token refresh on 401, and standardized response formatting.
 */

const BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5212';

const TOKEN_KEY = 'veval_access_token';
const REFRESH_TOKEN_KEY = 'veval_refresh_token';
const USER_KEY = 'veval_user_profile';

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  getUser: () => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setTokens: (accessToken, refreshToken, user = null) => {
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

/**
 * Perform silent token refresh against Identity Service through Gateway
 */
async function silentRefreshToken() {
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => resolve(token));
    });
  }

  isRefreshing = true;
  const refreshToken = tokenStorage.getRefreshToken();
  const accessToken = tokenStorage.getAccessToken();

  if (!refreshToken) {
    isRefreshing = false;
    tokenStorage.clearTokens();
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/v1/identity/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken,
        refreshToken
      })
    });

    if (!response.ok) {
      // Fallback endpoint if not using identity prefix
      const fallbackResponse = await fetch(`${BASE_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, refreshToken })
      });

      if (!fallbackResponse.ok) {
        tokenStorage.clearTokens();
        isRefreshing = false;
        return null;
      }
      const data = await fallbackResponse.json();
      const newAccess = data.accessToken || data.token;
      const newRefresh = data.refreshToken || refreshToken;
      tokenStorage.setTokens(newAccess, newRefresh);
      isRefreshing = false;
      onTokenRefreshed(newAccess);
      return newAccess;
    }

    const data = await response.json();
    const newAccess = data.accessToken || data.token;
    const newRefresh = data.refreshToken || refreshToken;
    tokenStorage.setTokens(newAccess, newRefresh);
    isRefreshing = false;
    onTokenRefreshed(newAccess);
    return newAccess;
  } catch (err) {
    console.error('[API Gateway] Silent token refresh failed:', err);
    tokenStorage.clearTokens();
    isRefreshing = false;
    return null;
  }
}

/**
 * Core HTTP Request Dispatcher
 */
async function request(endpoint, options = {}, isRetry = false) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const token = tokenStorage.getAccessToken();

  const headers = {
    Accept: 'application/json',
    ...options.headers,
  };

  // Do not set Content-Type for FormData (browser will set multipart/form-data with boundary)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // 1. Gateway Alert Check: Check if token is nearing expiration (< 5 mins)
    if (response.headers.get('X-Token-Refresh-Required') === 'true') {
      silentRefreshToken().catch(() => {});
    }

    // 2. Handle 401 Unauthorized with token refresh and single retry
    if (response.status === 401 && !isRetry && tokenStorage.getRefreshToken()) {
      const newAccessToken = await silentRefreshToken();
      if (newAccessToken) {
        return request(endpoint, options, true);
      }
    }

    // Parse JSON or return empty object on 204 No Content
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = (typeof data === 'object' && data !== null)
        ? data.message || data.title || data.error || `HTTP Error ${response.status}`
        : data || `HTTP Error ${response.status}`;

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      error.headers = response.headers;
      throw error;
    }

    return {
      success: true,
      data,
      status: response.status,
      headers: response.headers
    };
  } catch (error) {
    if (error.status) {
      throw error;
    }
    // Network / CORS Error
    const networkError = new Error(
      error.message === 'Failed to fetch'
        ? `Không thể kết nối đến API Gateway (${BASE_URL}). Vui lòng kiểm tra xem Gateway đang chạy tại cổng 5212.`
        : error.message
    );
    networkError.status = 0;
    networkError.originalError = error;
    throw networkError;
  }
}

export const apiClient = {
  getBaseUrl: () => BASE_URL,

  get: (endpoint, options = {}) => 
    request(endpoint, { method: 'GET', ...options }),

  post: (endpoint, body = {}, options = {}) => 
    request(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options
    }),

  put: (endpoint, body = {}, options = {}) => 
    request(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options
    }),

  delete: (endpoint, options = {}) => 
    request(endpoint, { method: 'DELETE', ...options }),

  upload: (endpoint, formData, options = {}) => 
    request(endpoint, {
      method: 'POST',
      body: formData,
      ...options
    })
};

export default apiClient;
