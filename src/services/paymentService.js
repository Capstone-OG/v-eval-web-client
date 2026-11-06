import apiClient from './apiClient.js';

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
  }
};

export default paymentService;
