import apiClient from './apiClient';

/**
 * Practice & Adaptive Learning Roadmap Service
 * Routed through V-Eval API Gateway (:5212) -> Practice Service (:5261)
 */
export const practiceService = {
  // =========================================================================
  // Core Flow 1: Khảo Thí & Chẩn Đoán Ban Đầu (IRT 2PL)
  // =========================================================================

  /**
   * Nộp bài thi khảo sát chẩn đoán năng lực ban đầu
   * @param {Object} submission - { examId, studentId, responses: [{ questionId, selectedOptionId, responseTimeSeconds }] }
   */
  async submitDiagnosticTest(submission) {
    return (await apiClient.post('/api/v1/practice/diagnostic-submissions', submission)).data;
  },

  // =========================================================================
  // Core Flow 2: Quy Hoạch Lộ Trình & Máy Trạng Thái FSM (APIs 1 - 7)
  // =========================================================================

  /**
   * API 1: Khởi tạo lộ trình học tập thích ứng cá nhân hóa từ kết quả khảo thí
   * @param {Object} data - { studentId, targetScore, availableWeeklyHours }
   */
  async generateRoadmap(data) {
    return (await apiClient.post('/api/v1/practice/roadmaps/generate', data)).data;
  },

  /**
   * API 2: Lấy toàn bộ lộ trình học tập cá nhân hóa hiện tại của học sinh
   */
  async getMyRoadmap() {
    return (await apiClient.get('/api/v1/practice/roadmaps/my-roadmap')).data;
  },

  /**
   * API 3: Lấy chi tiết thông tin và điều kiện tiên quyết của một chặng học
   * @param {string} nodeId - GUID của chặng học (Roadmap Node)
   */
  async getRoadmapNodeDetail(nodeId) {
    return (await apiClient.get(`/api/v1/practice/roadmaps/nodes/${nodeId}`)).data;
  },

  /**
   * API 4: Ghi nhận thời gian xem video bài giảng lý thuyết (>= 80% để mở khóa Quiz)
   * @param {string} nodeId - GUID của chặng học
   * @param {number} watchSeconds - Thời gian xem thực tế (giây)
   */
  async trackVideoProgress(nodeId, watchSeconds) {
    return (await apiClient.post(`/api/v1/practice/roadmaps/nodes/${nodeId}/track-video`, { watchSeconds })).data;
  },

  /**
   * API 5: Lấy đề thi Quiz kiểm tra năng lực cuối chặng (Milestone Quiz)
   * @param {string} nodeId
   */
  async getMilestoneQuiz(nodeId) {
    return (await apiClient.get(`/api/v1/practice/roadmaps/nodes/${nodeId}/quiz`)).data;
  },

  /**
   * API 6: Nộp bài thi Quiz chặng học & Chấm điểm tự động (FSM Chuyển trạng thái)
   * @param {string} nodeId
   * @param {Object} answers - { responses: [{ questionId, selectedOptionId, timeSpentSeconds }] }
   */
  async submitMilestoneQuiz(nodeId, answers) {
    return (await apiClient.post(`/api/v1/practice/roadmaps/nodes/${nodeId}/submit-quiz`, answers)).data;
  },

  /**
   * API 7: Nộp bài Quiz bù dành riêng cho học sinh vắng mặt buổi học Live Q&A
   * @param {string} nodeId
   * @param {Object} answers
   */
  async submitMakeupQuiz(nodeId, answers) {
    return (await apiClient.post(`/api/v1/practice/roadmaps/nodes/${nodeId}/submit-makeup-quiz`, answers)).data;
  },

  // =========================================================================
  // Core Flow 2: Quản Lý Phân Công Lớp Học (API 9)
  // =========================================================================

  /**
   * API 9: Phân công hoặc điều chuyển giáo viên phụ trách lớp học cơ sở (Academic Manager)
   * @param {string} classId
   * @param {string} teacherId
   */
  async assignTeacher(classId, teacherId) {
    return (await apiClient.put(`/api/v1/practice/classes/${classId}/assign-teacher`, { teacherId })).data;
  }
};

export default practiceService;
