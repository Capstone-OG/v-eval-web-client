import apiClient from './apiClient.js';
import { normalizeTuitionStatus } from '../utils/tuitionStatus.js';

/**
 * Payment & Tuition Service (PayOS VietQR Integration)
 * Routed through V-Eval API Gateway (:5212) -> Practice Service (:5261)
 */
export const paymentService = {
  /**
   * Tạo link thanh toán học phí PayOS (VietQR)
   * @param {Object} payload - { studentId, parentId, courseId, returnUrl, cancelUrl }
   * @returns {Promise<{ paymentId, orderCode, registrationId, amount, checkoutUrl, status }>}
   */
  async createPaymentLink(payload) {
    const response = await apiClient.post('/api/practice/payments/create-link', payload);
    return response.data;
  },

  /**
   * Tra cứu trạng thái giao dịch thanh toán PayOS theo orderCode
   * @param {number|string} orderCode
   * @returns {Promise<{ paymentId, orderCode, status, paidAt, counterAccountBankName }>}
   */
  async getPaymentStatus(orderCode) {
    const response = await apiClient.get(`/api/practice/payments/status/${orderCode}`);
    return response.data;
  },

  /**
   * Lấy lịch sử kiểm toán giao dịch (Audit Logs)
   * @param {string} paymentId
   */
  async getPaymentTransactions(paymentId) {
    const response = await apiClient.get(`/api/practice/payments/transactions/${paymentId}`);
    return Array.isArray(response.data) ? response.data : (response.data?.items || response.data?.data || []);
  },

  /**
   * Lấy toàn bộ danh sách lịch sử thanh toán thực tế của học sinh từ Database
   * @param {string} studentId
   * @returns {Promise<Array>}
   */
  async getStudentPayments(studentId) {
    if (!studentId) return [];
    try {
      const response = await apiClient.get(`/api/practice/payments/student/${studentId}`);
      return Array.isArray(response.data) ? response.data : (response.data?.items || response.data?.data || []);
    } catch (err) {
      // Fallback query query-string nếu gateway rewrite
      try {
        const fallbackRes = await apiClient.get(`/api/practice/payments/my-payments?studentId=${studentId}`);
        return Array.isArray(fallbackRes.data) ? fallbackRes.data : (fallbackRes.data?.items || fallbackRes.data?.data || []);
      } catch {
        return [];
      }
    }
  },

  /**
   * Tra cứu trạng thái học phí tổng thể, khóa học đang kích hoạt và các phân hệ đã mở khóa từ Database
   * @param {string} studentId
   * @returns {Promise<{ isPaid: boolean, activeCourseId, courseName, planType, durationWeeks, startDate, endDate, assignedClassName, unlockedFeatures: string[], payments: Array }>}
   */
  async getStudentTuitionStatus(studentId, { throwOnError = false } = {}) {
    if (!studentId) return { isPaid: false, unlockedFeatures: [], payments: [] };
    let status;
    try {
      const response = await apiClient.get(`/api/practice/payments/status-by-student/${studentId}`);
      status = response.data;
    } catch (err) {
      try {
        const fallbackRes = await apiClient.get(`/api/practice/payments/my-status?studentId=${studentId}`);
        status = fallbackRes.data;
      } catch (fallbackError) {
        if (throwOnError) throw fallbackError;
        return { isPaid: false, unlockedFeatures: [], payments: [] };
      }
    }
    const payments = Array.isArray(status?.payments) ? status.payments : [];
    return normalizeTuitionStatus(status, payments, studentId);
  }
};

export default paymentService;
