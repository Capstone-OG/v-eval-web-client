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
   * Lấy thông tin Mã Liên Kết Học Sinh (VE-XXXXXX), Mã PIN 6 số, QR Link & Danh sách Yêu cầu liên kết từ Phụ huynh (UC 41a)
   */
  async getStudentParentLinkOverview({ studentId, regeneratePin = false } = {}) {
    const params = {};
    if (studentId) params.studentId = studentId;
    if (regeneratePin) params.regeneratePin = true;
    const res = await apiClient.get('/api/v1/users/me/parent-link-overview', { params });
    return res.data?.value || res.data;
  },

  /**
   * Phụ huynh liên kết tài khoản học sinh bằng Mã Tài Khoản (VE-XXXXXX), Mã PIN 6 số hoặc Đường Liên Kết / QR (UC 41b)
   */
  async connectParentByCode({ codeOrLink, parentId }) {
    const res = await apiClient.post('/api/v1/users/parent-link/connect', {
      codeOrLink: (codeOrLink || '').trim(),
      parentId: parentId || undefined
    });
    return res.data?.value || res.data;
  },

  /**
   * Phụ huynh gửi yêu cầu liên kết 2 chiều theo Email / SĐT của học sinh (UC 41c)
   */
  async requestParentLink({ studentIdentifier, parentId }) {
    const res = await apiClient.post('/api/v1/users/parent-link/request', {
      studentIdentifier: (studentIdentifier || '').trim(),
      parentId: parentId || undefined
    });
    return res.data?.value || res.data;
  },

  /**
   * Học sinh xác nhận (Chấp nhận / Từ chối) yêu cầu liên kết từ Phụ huynh ngay trên Web (UC 41d)
   */
  async respondParentLinkRequest({ requestId, approve, studentId }) {
    const res = await apiClient.post(
      `/api/v1/users/me/parent-link-requests/${requestId}/respond`,
      {
        requestId,
        approve: Boolean(approve),
        studentId: studentId || undefined
      }
    );
    return res.data?.value || res.data;
  }
};

export default userService;
