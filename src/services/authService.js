import apiClient, { tokenStorage } from './apiClient.js';

/**
 * Authentication and User Identity Service
 * Routed through V-Eval API Gateway (:5212) -> Identity Service (:5155)
 */
export const authService = {
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
   * Đăng nhập tài khoản (UC 03)
   * @param {Object} credentials - { email, password }
   */
  async login({ email, password, rememberMe = true }) {
    const payload = {
      email: (email || '').trim().toLowerCase(),
      password: password || ''
    };

    const extractAndSaveUser = async (data) => {
      const u = data.user || data;
      const roles = u.roles || data.roles || [];
      const userObj = {
        id: u.userId || u.id || data.userId || data.id,
        userId: u.userId || u.id || data.userId || data.id,
        email: u.email || data.email || payload.email,
        fullName: u.fullName || data.fullName || payload.email,
        phone: u.phone || data.phone || '',
        campusId: u.campusId || data.campusId || null,
        campusName: u.campusName || data.campusName || null,
        roles: roles,
        role: this.resolveAppRole({ roles })
      };
      tokenStorage.setTokens(data.accessToken, data.refreshToken, userObj, rememberMe);

      try {
        const me = await this.fetchCurrentUserProfile();
        if (me && (me.id || me.userId || me.email)) {
          const mergedRoles = Array.isArray(me.roles) && me.roles.length > 0 ? me.roles : roles;
          const enrichedUser = {
            ...userObj,
            id: me.userId || me.id || userObj.id,
            userId: me.userId || me.id || userObj.userId,
            email: me.email || userObj.email,
            fullName: me.fullName || userObj.fullName,
            phone: me.phone || userObj.phone,
            campusId: me.campusId || userObj.campusId,
            campusName: me.campusName || userObj.campusName,
            roles: mergedRoles,
            role: this.resolveAppRole({ roles: mergedRoles, role: me.role })
          };
          tokenStorage.setTokens(data.accessToken, data.refreshToken, enrichedUser, rememberMe);
          return { ...data, user: enrichedUser };
        }
      } catch {
        // Keep token payload user if /users/me is not reachable immediately
      }

      return { ...data, user: userObj };
    };

    try {
      const res = await apiClient.post('/api/auth/login', payload);
      if (res.data?.accessToken) {
        return await extractAndSaveUser(res.data);
      }
      return res.data;
    } catch (err) {
      if (err.status === 404) {
        const res = await apiClient.post('/api/v1/identity/auth/login', payload);
        if (res.data?.accessToken) {
          return await extractAndSaveUser(res.data);
        }
        return res.data;
      }
      throw err;
    }
  },

  /**
   * Kiểm tra tính hợp lệ, máy chủ nhận thư DNS MX và trạng thái tồn tại của Email trước khi đăng ký (UC 01a)
   * @param {string} email
   */
  async validateEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    try {
      const res = await apiClient.get(
        `/api/auth/validate-email?email=${encodeURIComponent(cleanEmail)}`
      );
      return res.data?.value || res.data;
    } catch (err) {
      if (err.status === 404) {
        const res = await apiClient.get(
          `/api/v1/identity/auth/validate-email?email=${encodeURIComponent(cleanEmail)}`
        );
        return res.data?.value || res.data;
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
      roleName: userData.roleName || 'STUDENT',
      campusId: userData.campusId || undefined
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
   * Xác thực mã OTP đặt lại mật khẩu trước khi qua bước đổi mật khẩu (UC 05b)
   * @param {string} email
   * @param {string} otpCode
   */
  async verifyResetOtp(email, otpCode) {
    const payload = {
      email: (email || '').trim().toLowerCase(),
      otpCode: (otpCode || '').trim()
    };
    return (await apiClient.post('/api/auth/verify-reset-otp', payload)).data;
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
   * Lấy thông tin người dùng lưu trong localStorage (đồng bộ cho khởi tạo React state)
   */
  getCurrentUser() {
    return tokenStorage.getUser();
  },

  /**
   * Gọi API lấy thông tin hồ sơ người dùng hiện tại từ Backend (UC 04)
   */
  async fetchCurrentUserProfile() {
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
   * Phân giải Role chuẩn của ứng dụng ('student' | 'parent' | 'teacher' | 'manager' | 'admin')
   */
  resolveAppRole(user) {
    if (!user) return 'student';
    if (user.role && ['student', 'parent', 'teacher', 'manager', 'admin'].includes(user.role)) {
      return user.role;
    }
    const roles = Array.isArray(user.roles) ? user.roles : [];
    const normalized = roles.map((r) => String(r).toLowerCase());
    if (normalized.some((r) => r.includes('admin') || r.includes('administrator'))) {
      return 'admin';
    }
    if (
      normalized.some(
        (r) => r.includes('manager') || r.includes('director') || r.includes('quanly')
      )
    ) {
      return 'manager';
    }
    if (normalized.some((r) => r.includes('teacher') || r.includes('giaovien'))) {
      return 'teacher';
    }
    if (normalized.some((r) => r.includes('parent') || r.includes('phuhuynh'))) {
      return 'parent';
    }
    return 'student';
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
      return Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || []);
    } catch (err) {
      if (err.status === 404) {
        const res = await apiClient.get('/api/v1/identity/campuses');
        return Array.isArray(res.data) ? res.data : (res.data?.items || res.data?.data || []);
      }
      throw err;
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
