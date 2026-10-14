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
  },

  /**
   * Core Flow 2 (API 19) - Đóng gói đề Quiz củng cố thích ứng từ SkillIds / Bloom Levels
   * @param {Object} payload - { title, skillIds, questionCount, minBloomLevel, maxBloomLevel }
   */
  async createAdaptiveQuiz(payload) {
    return (await apiClient.post('/api/content/exams/quiz', payload)).data;
  },

  /**
   * Lấy danh sách câu hỏi theo Skill ID từ Content Service
   * @param {string} skillId 
   */
  async getQuestionsBySkill(skillId) {
    return (await apiClient.get(`/api/content/questions/by-skill/${encodeURIComponent(skillId)}`)).data;
  },

  /**
   * Thêm câu hỏi mới vào ngân hàng đề cho một kỹ năng/dạng bài (API 16)
   * @param {Object} payload 
   */
  async createQuestion(payload) {
    return (await apiClient.post('/api/content/questions', payload)).data;
  },

  /**
   * Cập nhật nội dung câu hỏi trong ngân hàng đề (API 17)
   * @param {string} questionId 
   * @param {Object} payload 
   */
  async updateQuestion(questionId, payload) {
    return (await apiClient.put(`/api/content/questions/${encodeURIComponent(questionId)}`, payload)).data;
  },

  /**
   * Xóa câu hỏi khỏi ngân hàng đề (API 18)
   * @param {string} questionId 
   */
  async deleteQuestion(questionId) {
    return (await apiClient.delete(`/api/content/questions/${encodeURIComponent(questionId)}`)).data;
  },

  /**
   * Lấy toàn bộ cây dàn kiến thức 4 miền và các kỹ năng chuẩn từ Backend Content Service (Database Dynamic)
   */
  async getCurriculum() {
    return (await apiClient.get('/api/content/curriculum')).data;
  },

  /**
   * Nạp cây tri thức phân cấp từ Giảng viên / AI Engine (Dynamic Ingestion)
   * @param {Object} payload 
   */
  async importCurriculum(payload) {
    return (await apiClient.post('/api/content/curriculum/import', payload)).data;
  },

  /**
   * Giảng viên hiệu đính toàn bộ 4 khối nội dung của dạng bài
   * @param {string} patternId 
   * @param {Object} payload 
   */
  async updatePattern(patternId, payload) {
    return (await apiClient.put(`/api/content/curriculum/patterns/${encodeURIComponent(patternId)}`, payload)).data;
  },

  /**
   * Giảng viên cập nhật node (Chương / Bài học)
   * @param {string} nodeId 
   * @param {Object} payload 
   */
  async updateNode(nodeId, payload) {
    return (await apiClient.put(`/api/content/curriculum/nodes/${encodeURIComponent(nodeId)}`, payload)).data;
  },

  /**
   * Giảng viên thêm mới Chương / Bài học / Dạng bài
   * @param {Object} payload 
   */
  async createNode(payload) {
    return (await apiClient.post('/api/content/curriculum/nodes', payload)).data;
  },

  /**
   * Giảng viên xóa node khỏi Cây tri thức
   * @param {string} nodeId 
   */
  async deleteNode(nodeId) {
    return (await apiClient.delete(`/api/content/curriculum/nodes/${encodeURIComponent(nodeId)}`)).data;
  }
};

export default contentService;
