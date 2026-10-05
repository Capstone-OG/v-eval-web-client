import apiClient from './apiClient';

/**
 * Content Management Service
 * Routed through V-Eval API Gateway (:5212) -> Content Service (:5249)
 */
export const contentService = {
  /**
   * Core Flow 1 - Lấy bộ đề thi khảo sát chẩn đoán năng lực ban đầu (30 câu hỏi chuẩn V-ACT)
   * @param {string} [excludeExamId] - ID đề thi muốn bỏ qua khi làm lại đề mới
   */
  async getDiagnosticTest(excludeExamId = null) {
    const endpoint = excludeExamId 
      ? `/api/v1/content/diagnostic-test?excludeExamId=${encodeURIComponent(excludeExamId)}`
      : '/api/v1/content/diagnostic-test';
    return (await apiClient.get(endpoint)).data;
  },

  /**
   * Core Flow 2 - Lấy toàn bộ cây kỹ năng DAG kèm trọng số (12 kỹ năng chuẩn ĐGNL)
   */
  async getSkillsTree() {
    return (await apiClient.get('/api/v1/content/skills-tree')).data;
  },

  /**
   * Lấy danh sách đề thi luyện tập / thi thử
   * @param {Object} [params] - { domainId, difficulty, page, limit }
   */
  async getMockExams(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/api/v1/content/exams?${query}` : '/api/v1/content/exams';
    return (await apiClient.get(endpoint)).data;
  },

  /**
   * Lấy chi tiết đề thi theo ID
   * @param {string} examId
   */
  async getExamDetail(examId) {
    return (await apiClient.get(`/api/v1/content/exams/${examId}`)).data;
  },

  /**
   * Quản trị ngân hàng câu hỏi gốc (Phân hệ Content Admin / Teacher)
   * @param {Object} [params]
   */
  async getQuestions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/api/v1/content/questions?${query}` : '/api/v1/content/questions';
    return (await apiClient.get(endpoint)).data;
  }
};

export default contentService;
