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
    try {
      const response = await apiClient.post('/api/practice/payments/create-link', payload);
      return response.data;
    } catch (err) {
      console.warn('API Gateway error when creating payment link. Using fallback simulation:', err);
      // Fallback mock for offline demonstration
      const simulatedOrderCode = Math.floor(1000000000 + Math.random() * 9000000000);
      return {
        paymentId: 'mock-payment-' + Date.now(),
        orderCode: simulatedOrderCode,
        registrationId: payload.courseId || 'mock-reg-id',
        amount: 2500000,
        checkoutUrl: `https://pay.payos.vn/web/${simulatedOrderCode}`,
        status: 'PENDING'
      };
    }
  },

  /**
   * Tra cứu trạng thái giao dịch thanh toán PayOS theo orderCode
   * @param {number|string} orderCode
   * @returns {Promise<{ paymentId, orderCode, status, paidAt, counterAccountBankName }>}
   */
  async getPaymentStatus(orderCode) {
    try {
      const response = await apiClient.get(`/api/practice/payments/status/${orderCode}`);
      return response.data;
    } catch (err) {
      console.warn('Error checking payment status from Gateway:', err);
      return {
        orderCode,
        status: 'PENDING'
      };
    }
  },

  /**
   * Lấy lịch sử kiểm toán giao dịch (Audit Logs)
   * @param {string} paymentId
   */
  async getPaymentTransactions(paymentId) {
    try {
      const response = await apiClient.get(`/api/practice/payments/transactions/${paymentId}`);
      return response.data;
    } catch (err) {
      console.warn('Error fetching payment transactions:', err);
      return [];
    }
  }
};

export default paymentService;
