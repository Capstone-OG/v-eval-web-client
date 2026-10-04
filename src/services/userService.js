import apiClient from './apiClient';

/**
 * Service quản lý người dùng & cấp phát tài khoản nội bộ (User Management & Provisioning)
 * Kết nối qua V-Eval API Gateway (:5212) -> Identity Service (:5155)
 */
export const userService = {
  /**
   * Lấy danh sách toàn bộ tài khoản người dùng có phân trang & bộ lọc
   * @param {Object} params - { role, campusId, search, page, pageSize }
   */
  async getUsers(params = {}) {
    try {
      const res = await apiClient.get('/api/v1/users', { params });
      return res.data;
    } catch (err) {
      console.warn('[userService] getUsers API error:', err);
      throw err;
    }
  },

  /**
   * Cấp phát tài khoản nội bộ mới (Admin / Campus Manager)
   * Kích hoạt trực tiếp (IsActive = true), không cần mã OTP
   * @param {Object} userData - { email, password, fullName, phone, roleName, campusId, specialty }
   */
  async provisionUser(userData) {
    const payload = {
      email: (userData.email || '').trim().toLowerCase(),
      password: userData.password || 'Password123@',
      fullName: (userData.fullName || '').trim(),
      phone: (userData.phone || '').trim(),
      roleName: userData.roleName || 'TEACHER',
      campusId: userData.campusId || null,
      specialty: userData.specialty || null
    };

    try {
      const res = await apiClient.post('/api/v1/users/provision', payload);
      return res.data;
    } catch (err) {
      console.warn('[userService] provisionUser API error:', err);
      throw err;
    }
  },

  /**
   * Khóa hoặc mở khóa trạng thái tài khoản
   * @param {string} userId
   */
  async toggleUserStatus(userId) {
    try {
      const res = await apiClient.patch(`/api/v1/users/${userId}/toggle-status`);
      return res.data;
    } catch (err) {
      console.warn('[userService] toggleUserStatus API error:', err);
      throw err;
    }
  },

  /**
   * Lấy danh sách cơ sở đào tạo thực tế từ CSDL
   */
  async getCampuses() {
    try {
      const res = await apiClient.get('/api/v1/campuses');
      return res.data;
    } catch (err) {
      console.warn('[userService] getCampuses error, using fallback:', err);
      return [
        { campusId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', code: 'CS_THU_DUC', name: 'Cơ sở 1 - Khu đô thị ĐHQG-HCM, TP. Thủ Đức' },
        { campusId: '4ba85f64-5717-4562-b3fc-2c963f66afa7', code: 'CS_QUAN_10', name: 'Cơ sở 2 - Quận 10, TP.HCM' }
      ];
    }
  }
};

export default userService;
