import apiClient from './apiClient.js';

export function createMockExamService(client = apiClient) {
  return {
    async getExams() {
      const { data } = await client.get('/api/content/exams');
      if (!Array.isArray(data)) throw new Error('Danh sách đề thi không hợp lệ.');
      return data.filter((exam) => exam.isPublished === true && exam.examCategory === 'FULL_MOCK');
    },
    async start(examId, studentId) {
      if (!studentId || !examId) throw new Error('Chưa xác định được học sinh hoặc đề thi.');
      const { data } = await client.post(`/api/practice/mock-exams/${encodeURIComponent(examId)}/start`, { studentId });
      if (data?.studentId !== studentId || !data.submissionId || !Array.isArray(data.questions) || !data.questions.length) {
        throw new Error('Phiên thi trả về không hợp lệ. Vui lòng thử lại.');
      }
      return data;
    },
    async submit(submissionId, answers) {
      return (await client.post(`/api/practice/mock-exams/${encodeURIComponent(submissionId)}/submit`, { answers })).data;
    },
    async getResult(submissionId) {
      return (await client.get(`/api/practice/mock-exams/${encodeURIComponent(submissionId)}`)).data;
    },
    async logTabDeparture(submissionId, reason = 'Học sinh chuyển sang tab hoặc ứng dụng khác.') {
      return (await client.post(`/api/practice/mock-exams/${encodeURIComponent(submissionId)}/log-tab-departure`, { reason })).data;
    }
  };
}
export const mockExamService = createMockExamService();
