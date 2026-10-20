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
    const cleanPayload = { ...payload };
    if (cleanPayload.correctOption !== undefined) {
      cleanPayload.correctOption = normalizeCorrectOption(cleanPayload.correctOption);
    }
    return (await apiClient.post('/api/content/questions', cleanPayload)).data;
  },

  /**
   * Cập nhật nội dung câu hỏi trong ngân hàng đề (API 17)
   * @param {string} questionId 
   * @param {Object} payload 
   */
  async updateQuestion(questionId, payload) {
    const cleanPayload = { ...payload };
    if (cleanPayload.correctOption !== undefined) {
      cleanPayload.correctOption = normalizeCorrectOption(cleanPayload.correctOption);
    }
    return (await apiClient.put(`/api/content/questions/${encodeURIComponent(questionId)}`, cleanPayload)).data;
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
   * Tự động chuẩn hóa toàn bộ các trường, chuyển đổi đáp án đúng về 'A'|'B'|'C'|'D'
   * @param {Object} payload 
   */
  async importCurriculum(payload) {
    const cleanPayload = sanitizeCurriculumPayload(payload);
    return (await apiClient.post('/api/content/curriculum/import', cleanPayload)).data;
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

/**
 * Chuẩn hóa đáp án đúng về duy nhất 1 ký tự 'A', 'B', 'C', 'D'
 * Xử lý an toàn mọi định dạng từ OCR / AI: "A.", "Phương án B", "0", 0, null...
 */
export function normalizeCorrectOption(raw) {
  if (raw === null || raw === undefined) return 'A';
  
  if (typeof raw === 'number') {
    if (raw >= 0 && raw <= 3) return String.fromCharCode(65 + raw); // 0->A, 1->B, 2->C, 3->D
    if (raw >= 1 && raw <= 4) return String.fromCharCode(64 + raw); // 1->A, 2->B, 3->C, 4->D
    if (raw >= 65 && raw <= 68) return String.fromCharCode(raw);
    return 'A';
  }

  const str = String(raw).trim();
  if (!str) return 'A';

  // 1. Nếu là 1 ký tự sau khi bỏ dấu câu như "A.", "(B)", "[C]", "D:"
  const stripped = str.replace(/^[ \t\r\n.:();,\[\]'"\-_]+|[ \t\r\n.:();,\[\]'"\-_]+$/g, '');
  if (stripped.length === 1) {
    const upper = stripped.toUpperCase();
    if (upper >= 'A' && upper <= 'D') return upper;
    if (upper >= '0' && upper <= '3') return String.fromCharCode(65 + Number(upper));
    if (upper >= '1' && upper <= '4') return String.fromCharCode(64 + Number(upper));
  }

  // 2. Tìm theo từ khóa (đáp án A, phương án B, option C, answer D...)
  const match = str.match(/(?:đáp\s*án|phương\s*án|chọn|câu|answer|choice|option)\s*[:\-\.]?\s*([A-D])\b/i);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }

  // 3. Quét ký tự A, B, C, D đầu tiên
  for (const ch of str) {
    const upper = ch.toUpperCase();
    if (upper >= 'A' && upper <= 'D') return upper;
  }

  // 4. Quét số 0..3 trong chuỗi
  for (const ch of str) {
    if (ch >= '0' && ch <= '3') return String.fromCharCode(65 + Number(ch));
    if (ch >= '1' && ch <= '4') return String.fromCharCode(64 + Number(ch));
  }

  return 'A';
}

/**
 * Đảm bảo toàn bộ payload nạp tri thức tuân thủ 100% schema backend
 */
export function sanitizeCurriculumPayload(payload) {
  if (!payload || typeof payload !== 'object') return payload;

  const sanitized = JSON.parse(JSON.stringify(payload));

  if (Array.isArray(sanitized.chapters)) {
    sanitized.chapters.forEach(ch => {
      if (Array.isArray(ch.lessons)) {
        ch.lessons.forEach(les => {
          if (Array.isArray(les.patterns)) {
            les.patterns.forEach(pat => {
              if (Array.isArray(pat.questions)) {
                pat.questions.forEach(q => {
                  q.correctOption = normalizeCorrectOption(q.correctOption);
                  if (typeof q.difficultyLevel !== 'number') {
                    q.difficultyLevel = Number(q.difficultyLevel) || 2;
                  }
                  q.contentLatex = q.contentLatex || '';
                  q.optionA = q.optionA || '';
                  q.optionB = q.optionB || '';
                  q.optionC = q.optionC || '';
                  q.optionD = q.optionD || '';
                  q.explanation = q.explanation || '';
                });
              }
            });
          }
        });
      }
    });
  }

  return sanitized;
}

export default contentService;
