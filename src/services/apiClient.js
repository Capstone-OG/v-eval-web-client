/**
 * V-Eval API Gateway Client
 * 
 * Provides unified HTTP communication connecting the Web Client to the V-Eval YARP API Gateway (Port 5212).
 * Supports automatic JWT injection, Gateway header handling (e.g. X-Token-Refresh-Required),
 * token refresh on 401, and standardized response formatting.
 */

const BASE_URL = import.meta.env?.VITE_API_GATEWAY_URL || 'http://localhost:5212';

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
  let url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  if (options.params && typeof options.params === 'object') {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

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

    // 3. Handle 502 Bad Gateway transient connection refused during backend startup
    if (response.status === 502 && !isRetry && !options.noRetry502) {
      await new Promise((res) => setTimeout(res, 2000));
      return request(endpoint, options, true);
    }

    // Parse JSON or return text / empty object
    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('json') || contentType.includes('+json')) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      const text = await response.text();
      const trimmed = text.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          data = JSON.parse(trimmed);
        } catch {
          data = text;
        }
      } else {
        data = text;
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      if (typeof data === 'object' && data !== null) {
        const rawErr = data.error;
        const errDesc =
          typeof rawErr === 'object' && rawErr !== null
            ? rawErr.description || rawErr.message || rawErr.code
            : rawErr;

        let errorsDetail = null;
        if (data.errors) {
          if (Array.isArray(data.errors)) {
            errorsDetail = data.errors[0]?.description || data.errors[0]?.message || String(data.errors[0]);
          } else if (typeof data.errors === 'object') {
            const firstKey = Object.keys(data.errors)[0];
            const val = data.errors[firstKey];
            errorsDetail = Array.isArray(val) ? val[0] : String(val);
          }
        }

        const meaningfulTitle =
          data.title && data.title !== 'An error occurred while processing your request.'
            ? data.title
            : null;

        errorMessage =
          errDesc ||
          data.detail ||
          data.message ||
          errorsDetail ||
          meaningfulTitle ||
          errorMessage;
      } else if (typeof data === 'string' && data.trim()) {
        const trimmed = data.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const parsed = JSON.parse(trimmed);
            errorMessage = parsed.detail || parsed.message || parsed.title || trimmed;
          } catch {
            errorMessage = trimmed;
          }
        } else {
          errorMessage = trimmed;
        }
      }

      if (response.status === 502 && (errorMessage.startsWith('HTTP Error 502') || errorMessage.toLowerCase().includes('bad gateway'))) {
        errorMessage = `Cổng Gateway (${BASE_URL}) không thể kết nối tới microservice backend (HTTP 502 Bad Gateway). Dịch vụ có thể đang trong quá trình khởi động hoặc bị gián đoạn kết nối.`;
      } else if (response.status === 503 && errorMessage.startsWith('HTTP Error 503')) {
        errorMessage = `Dịch vụ backend tạm thời không khả dụng hoặc đang quá tải (HTTP 503 Service Unavailable). Vui lòng thử lại sau giây lát.`;
      } else if (response.status === 504 && errorMessage.startsWith('HTTP Error 504')) {
        errorMessage = `Hết thời gian chờ phản hồi từ microservice backend (HTTP 504 Gateway Timeout). Vui lòng thử lại hoặc giảm bớt dung lượng tài liệu.`;
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      error.response = {
        data,
        status: response.status,
        headers: response.headers
      };
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

  patch: (endpoint, body = null, options = {}) => 
    request(endpoint, {
      method: 'PATCH',
      ...(body !== null && body !== undefined
        ? { body: body instanceof FormData ? body : JSON.stringify(body) }
        : {}),
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
