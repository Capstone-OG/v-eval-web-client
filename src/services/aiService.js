import apiClient from './apiClient';

/**
 * AI Engine Service (Gemini OCR, Socratic AI Tutor & RAG Knowledge Search)
 * Routed through V-Eval API Gateway (:5212) -> AI Engine (:5104)
 */
export const aiService = {
  /**
   * Upload file PDF đề thi gốc để Gemini Flash phân tích, bóc tách câu hỏi & OCR công thức
   * @param {File} pdfFile
   */
  async uploadPdfExam(pdfFile) {
    const formData = new FormData();
    formData.append('file', pdfFile);
    return (await apiClient.upload('/api/ai-engine/upload-pdf', formData)).data;
  },

  /**
   * Truy vấn trạng thái tiến trình nền bóc tách đề thi PDF
   * @param {string} jobId
   */
  async getExamJobStatus(jobId) {
    return (await apiClient.get(`/api/ai-engine/jobs/${jobId}`)).data;
  },

  /**
   * Chat với trợ lý gia sư AI Socratic (Hướng dẫn tư duy từng bước, không spoil đáp án)
   * @param {Object} promptData - { questionId, studentMessage, context, chatHistory }
   */
  async askSocraticTutor(promptData) {
    return (await apiClient.post('/api/ai-engine/tutor/chat', promptData)).data;
  },

  /**
   * Nạp tệp Sách giáo khoa / Tài liệu chuẩn vào kho tri thức RAG Vector DB
   * @param {File} file
   * @param {string} domainId - Mã miền năng lực (Toán, Văn, Khoa học)
   * @param {number} grade - Khối lớp (10, 11, 12)
   */
  async ingestTextbook(file, domainId, grade = 12) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('domainId', domainId);
    formData.append('grade', grade.toString());
    return (await apiClient.upload('/api/ai-engine/textbook/ingest', formData)).data;
  },

  /**
   * Tìm kiếm vector kiến thức chuyên sâu từ cơ sở dữ liệu Qdrant
   * @param {string} query
   * @param {string} [domainId]
   */
  async searchKnowledgeBase(query, domainId = null) {
    return (await apiClient.post('/api/ai-engine/rag/search', { query, domainId })).data;
  }
};

export default aiService;
