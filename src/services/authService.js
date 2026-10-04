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
    const payload = {
      email: (email || '').trim().toLowerCase(),
      password: password || ''
    };

    const extractAndSaveUser = (data) => {
      const u = data.user || data;
      const roles = u.roles || data.roles || [];
      const rawRole = (roles[0] || 'student').toLowerCase();
      const primaryRole = rawRole === 'administrator' ? 'admin' : rawRole;
      const userObj = {
        id: u.userId || u.id || data.userId || data.id,
        email: u.email || data.email || payload.email,
        fullName: u.fullName || data.fullName || 'Người dùng V-Eval',
        roles: roles,
        role: primaryRole
      };
      tokenStorage.setTokens(data.accessToken, data.refreshToken, userObj);
      return { ...data, user: userObj };
    };

    try {
      const res = await apiClient.post('/api/auth/login', payload);
      if (res.data?.accessToken) {
        return extractAndSaveUser(res.data);
      }
      return res.data;
    } catch (err) {
      if (err.status === 404) {
        const res = await apiClient.post('/api/v1/identity/auth/login', payload);
        if (res.data?.accessToken) {
          return extractAndSaveUser(res.data);
        }
        return res.data;
      }
      throw err;
    }
  },

  /**
   * Đăng ký tài khoản học sinh mới (UC 01)
   * @param {Object} userData - { email, password, fullName, phone, roleName, campusId }
   */
  async register(userData) {
    const payload = {
      email: (userData.email || '').trim().toLowerCase(),
      password: userData.password || '',
      fullName: (userData.fullName || '').trim(),
      phone: (userData.phone || '').trim(),
      roleName: userData.roleName || 'STUDENT'
    };

    try {
      const res = await apiClient.post('/api/auth/register', payload);
      return res.data;
    } catch (err) {
      if (err.status === 404) {
        const res = await apiClient.post('/api/v1/identity/auth/register', payload);
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
    const payload = { 
      email: (email || '').trim().toLowerCase(), 
      otpCode: (otpCode || '').trim() 
    };
    try {
      const res = await apiClient.post('/api/auth/verify-account', payload);
      return res.data;
    } catch (err) {
      if (err.status === 404) {
        const res = await apiClient.post('/api/v1/identity/auth/verify-account', payload);
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
        try {
          const res = await apiClient.get('/api/v1/identity/campuses');
          return res.data;
        } catch {
          // Fall through to fallback
        }
      }
      return [
        { campusId: '11111111-1111-1111-1111-111111111111', code: 'CS_THUDUC', name: 'Cơ sở Thủ Đức (Khu ĐHQG)', address: 'Khu phố 6, Linh Trung, TP. Thủ Đức' },
        { campusId: '22222222-2222-2222-2222-222222222222', code: 'CS_Q10', name: 'Cơ sở Quận 10 (Lý Thường Kiệt)', address: '268 Lý Thường Kiệt, Quận 10, TP.HCM' },
        { campusId: '33333333-3333-3333-3333-333333333333', code: 'CS_BINHTHANH', name: 'Cơ sở Bình Thạnh (Điện Biên Phủ)', address: '475A Điện Biên Phủ, P.25, Bình Thạnh' }
      ];
    }
  },

  /**
   * Kiểm tra xem phiên làm việc hiện tại đã đăng nhập hay chưa
   */
  isAuthenticated() {
    return !!tokenStorage.getAccessToken();
  },

  /**
   * Lấy thông tin người dùng lưu trong localStorage
   */
  getStoredUser() {
    return tokenStorage.getUser();
  }
};

export default authService;

