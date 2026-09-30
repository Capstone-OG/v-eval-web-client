import apiClient, { tokenStorage } from './apiClient';

/**
 * Authentication and User Identity Service
 * Routed through V-Eval API Gateway (:5212) -> Identity Service (:5155)
 */
export const authService = {
  /**
   * Đăng nhập tài khoản (UC 03)
   * @param {Object} credentials - { email, password }
   */
  async login({ email, password }) {
    try {
      const res = await apiClient.post('/api/auth/login', { email, password });
      if (res.data?.accessToken) {
        tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken, res.data.user);
      }
      return res.data;
    } catch (err) {
      // Fallback with prefix if gateway route requires it
      if (err.status === 404) {
        const res = await apiClient.post('/api/v1/identity/auth/login', { email, password });
        if (res.data?.accessToken) {
          tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken, res.data.user);
        }
        return res.data;
      }
      throw err;
    }
  },

  /**
   * Đăng ký tài khoản học sinh mới (UC 01)
   * @param {Object} userData - { email, password, fullName, phone, campusId }
   */
  async register(userData) {
    try {
      const res = await apiClient.post('/api/auth/register', userData);
      return res.data;
    } catch (err) {
      if (err.status === 404) {
        const res = await apiClient.post('/api/v1/identity/auth/register', userData);
        return res.data;
      }
      throw err;
    }
  },

  /**
   * Xác thực mã OTP 6 số kích hoạt tài khoản (UC 02)
   * @param {string} email
   * @param {string} otpCode
   */
  async verifyOtp(email, otpCode) {
    const payload = { email, otpCode, type: 'ACCOUNT_ACTIVATION' };
    try {
      const res = await apiClient.post('/api/auth/verify', payload);
      return res.data;
    } catch (err) {
      if (err.status === 404) {
        const res = await apiClient.post('/api/v1/identity/auth/verify', payload);
        return res.data;
      }
      throw err;
    }
  },

  /**
   * Yêu cầu gửi mã OTP đặt lại mật khẩu (UC 05)
   * @param {string} email
   */
  async forgotPassword(email) {
    return (await apiClient.post('/api/auth/forgot-password', { email })).data;
  },

  /**
   * Đặt lại mật khẩu mới bằng mã OTP (UC 06)
   * @param {Object} data - { email, otpCode, newPassword }
   */
  async resetPassword(data) {
    return (await apiClient.post('/api/auth/reset-password', data)).data;
  },

  /**
   * Đăng xuất và thu hồi Refresh Token (UC 07)
   */
  async logout() {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await apiClient.post('/api/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.warn('[authService] Logout API error:', err.message);
    } finally {
      tokenStorage.clearTokens();
    }
  },

  /**
   * Lấy thông tin hồ sơ người dùng hiện tại (UC 04)
   */
  async getCurrentUser() {
    try {
      const res = await apiClient.get('/api/v1/users/me');
      return res.data;
    } catch (err) {
      if (err.status === 404) {
        const res = await apiClient.get('/api/v1/identity/users/me');
        return res.data;
      }
      throw err;
    }
  },

  /**
   * Cập nhật hồ sơ học sinh (thang điểm 1200, giờ học, trường THPT)
   * @param {Object} profileData
   */
  async updateProfile(profileData) {
    try {
      const res = await apiClient.put('/api/v1/users/profile', profileData);
      return res.data;
    } catch (err) {
      if (err.status === 404) {
        const res = await apiClient.put('/api/v1/identity/users/profile', profileData);
        return res.data;
      }
      throw err;
    }
  },

  /**
   * Đổi mật khẩu cá nhân
   * @param {Object} passwordData - { currentPassword, newPassword }
   */
  async changePassword(passwordData) {
    return (await apiClient.put('/api/v1/users/change-password', passwordData)).data;
  },

  /**
   * Lấy danh sách cơ sở đào tạo (UC 10 & UC 40)
   */
  async getCampuses() {
    try {
      const res = await apiClient.get('/api/v1/campuses');
      return res.data;
    } catch (err) {
      if (err.status === 404) {
        const res = await apiClient.get('/api/v1/identity/campuses');
        return res.data;
      }
      throw err;
    }
  }
};

export default authService;
