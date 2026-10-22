import apiClient, { tokenStorage } from './apiClient';

/**
 * Authentication and User Identity Service
 * Routed through V-Eval API Gateway (:5212) -> Identity Service (:5155)
 */
export const authService = {
  /**
   * Đăng nhập tài khoản (UC 03)
   * @param {Object} credentials - { email, password, rememberMe }
   */
  async login({ email, password, rememberMe = true }) {
    const res = await apiClient.post('/api/auth/login', { email, password });
    if (res.data?.accessToken) {
      tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken, res.data.user, rememberMe);
    }
    return res.data;
  },

  /**
   * Đăng ký tài khoản học sinh mới (UC 01)
   * @param {Object} userData - { email, password, fullName, phone, campusId }
   */
  async register(userData) {
    const res = await apiClient.post('/api/auth/register', userData);
    return res.data;
  },

  /**
   * Xác thực mã OTP 6 số kích hoạt tài khoản (UC 02)
   * @param {string} email
   * @param {string} otpCode
   */
  async verifyOtp(email, otpCode) {
    const res = await apiClient.post('/api/auth/verify-account', { email, otpCode });
    return res.data;
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
   * Cập nhật thông tin tài khoản chung (Họ tên, SĐT, Avatar) (UC 04)
   * @param {Object} profileData - { fullName, phone, avatarUrl }
   */
  async updateProfile(profileData) {
    try {
      const res = await apiClient.put('/api/v1/users/me/profile', profileData);
      return res.data;
    } catch (err) {
      if (err.status === 404) {
        const res = await apiClient.put('/api/v1/users/profile', profileData);
        return res.data;
      }
      throw err;
    }
  },

  /**
   * Lấy thông tin hồ sơ học sinh (Điểm mục tiêu, cơ sở, ngày thi, giờ học) (UC 04)
   */
  async getStudentProfile() {
    try {
      const res = await apiClient.get('/api/v1/students/me/profile');
      return res.data;
    } catch (err) {
      if (err.status === 404) {
        const res = await apiClient.get('/api/v1/students/profile');
        return res.data;
      }
      throw err;
    }
  },

  /**
   * Cập nhật hồ sơ học sinh chuyên sâu (UC 04 & UC 10)
   * @param {Object} studentData - { campusId, targetScore, examDate, studyHoursDay, schoolName }
   */
  async updateStudentProfile(studentData) {
    try {
      const res = await apiClient.put('/api/v1/students/me/profile', studentData);
      return res.data;
    } catch (err) {
      if (err.status === 404) {
        const res = await apiClient.put('/api/v1/students/profile', studentData);
        return res.data;
      }
      throw err;
    }
  },

  /**
   * Lấy thông tin phụ huynh liên kết (Cha/Mẹ) (UC 04)
   */
  async getParentInfo() {
    try {
      const res = await apiClient.get('/api/v1/students/me/parent');
      return res.data;
    } catch (err) {
      const cached = localStorage.getItem('veval_parent_info');
      if (cached) {
        try { return JSON.parse(cached); } catch { return null; }
      }
      return null;
    }
  },

  /**
   * Cập nhật thông tin phụ huynh liên kết (Cha HOẶC Mẹ)
   * @param {Object} parentData - { parentRelation, parentName, parentPhone, parentEmail, parentConnectCode }
   */
  async updateParentInfo(parentData) {
    try {
      const res = await apiClient.put('/api/v1/students/me/parent', parentData);
      localStorage.setItem('veval_parent_info', JSON.stringify(parentData));
      return res.data;
    } catch (err) {
      localStorage.setItem('veval_parent_info', JSON.stringify(parentData));
      return parentData;
    }
  },

  /**
   * Đổi mật khẩu cá nhân (UC 04)
   * @param {Object} passwordData - { currentPassword, newPassword, confirmPassword }
   */
  async changePassword(passwordData) {
    const payload = {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword || passwordData.newPassword
    };
    try {
      return (await apiClient.post('/api/v1/users/me/change-password', payload)).data;
    } catch (err) {
      if (err.status === 404 || err.status === 405) {
        return (await apiClient.put('/api/v1/users/change-password', payload)).data;
      }
      throw err;
    }
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
