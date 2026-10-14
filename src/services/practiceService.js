import apiClient, { tokenStorage } from './apiClient';

// =========================================================================
// Core Flow 4 Helpers: DTO Sanitizers & Normalizers
// =========================================================================

const ensureGuid = (id, fallback = '00000000-0000-0000-0000-000000000001') => {
  if (typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return fallback;
};

const cleanOptionKey = (opt, fallback = 'A') => {
  if (!opt) return fallback;
  const match = String(opt).trim().match(/^([A-D])/i);
  return match ? match[1].toUpperCase() : fallback;
};

const normalizeOptions = (opts) => {
  if (!opts) return { A: 'Phương án A', B: 'Phương án B' };
  if (Array.isArray(opts)) {
    const dict = {};
    opts.forEach((opt, idx) => {
      const key = String.fromCharCode(65 + idx);
      dict[key] = String(opt);
    });
    return dict;
  }
  if (typeof opts === 'object') return opts;
  return { A: 'Phương án A', B: 'Phương án B' };
};

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
  },

  // =========================================================================
  // Phân Cụm Học Sinh & Nhóm Học Tập Vi Mô (Micro Study Groups: 3 - 5 bạn)
  // =========================================================================

  /**
   * Tự động phân cụm K-Means tạo các Lớp Chuyên Đề theo lỗ hổng kiến thức
   * @param {string} campusId
   * @param {number} maxK
   */
  async autoClusterClasses(campusId, maxK = 6) {
    return (await apiClient.post('/api/v1/practice/classes/auto-cluster', { campusId, maxK })).data;
  },

  /**
   * Tự động phân chia học sinh trong lớp thành các nhóm vi mô (3 - 5 bạn/nhóm)
   * @param {string} classId
   * @param {number} preferredGroupSize - Mặc định 4 (chấp nhận 3 - 5)
   */
  async autoPartitionMicroGroups(classId, preferredGroupSize = 4) {
    return (await apiClient.post(`/api/v1/practice/classes/${classId}/micro-groups/auto-partition`, { preferredGroupSize })).data;
  },

  /**
   * Lấy danh sách các nhóm học tập vi mô của lớp học (phục vụ dashboard giáo viên)
   * @param {string} classId
   */
  async getClassMicroGroups(classId) {
    return (await apiClient.get(`/api/v1/practice/classes/${classId}/micro-groups`)).data;
  },

  /**
   * Phân phối đề luyện tập / phiếu bài tập vi mô thích ứng cho nhóm học tập
   * @param {string} classId
   * @param {string} groupId
   * @param {string} worksheetId
   * @param {string} worksheetTitle
   */
  async assignGroupWorksheet(classId, groupId, worksheetId, worksheetTitle) {
    return (await apiClient.post(`/api/v1/practice/classes/${classId}/micro-groups/${groupId}/assign-worksheet`, { worksheetId, worksheetTitle })).data;
  },

  // =========================================================================
  // Core Flow 4: Gia Sư AI Socratic & GraphRAG Continuous Learning
  // =========================================================================

  /**
   * Hỏi đáp gợi mở Socratic dạng SSE Streaming qua API Gateway (:5212) -> Practice Service (:5261)
   * Tự động xử lý giới hạn 10 req/phút (StrictTutorPolicy) và stream từng token chữ chạy.
   *
   * @param {Object} params
   * @param {string} [params.studentId]
   * @param {string} [params.questionId]
   * @param {string} params.questionLatex - Câu hỏi bài tập hoặc thắc mắc tư duy (hỗ trợ KaTeX)
   * @param {Object|Array} [params.options] - Dictionary phương án trắc nghiệm (ví dụ: { A: "...", B: "..." } hoặc mảng)
   * @param {string} [params.studentWrongOption='A'] - Phương án học sinh chọn sai
   * @param {string} [params.correctOption='B'] - Phương án đáp án đúng
   * @param {string} [params.skillId]
   * @param {function} [params.onToken] - Callback nhận từng token chữ
   * @param {function} [params.onInteractionId] - Callback nhận GUID phiên tương tác
   * @param {function} [params.onError] - Callback khi có lỗi hoặc mã 429 Rate Limit
   * @param {function} [params.onComplete] - Callback khi stream hoàn tất
   * @param {AbortSignal} [params.signal] - Tín hiệu hủy yêu cầu stream
   * @returns {Promise<string>} Toàn bộ câu trả lời hoàn chỉnh
   */
  async askAiTutorStream({
    studentId,
    questionId,
    questionLatex,
    options = null,
    studentWrongOption = 'A',
    correctOption = 'B',
    skillId = null,
    onToken,
    onInteractionId,
    onError,
    onComplete,
    signal
  }) {
    const baseUrl = apiClient.getBaseUrl();
    const token = tokenStorage.getAccessToken();
    const currentUser = tokenStorage.getUser();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream'
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const resolvedStudentId = ensureGuid(studentId || currentUser?.id, '00000000-0000-0000-0000-000000000001');
    const resolvedQuestionId = ensureGuid(questionId, '11111111-1111-1111-1111-111111111111');
    const resolvedSkillId = skillId ? ensureGuid(skillId, null) : null;
    const resolvedWrongOpt = cleanOptionKey(studentWrongOption, 'A');
    const resolvedCorrectOpt = cleanOptionKey(correctOption, 'B');
    const resolvedOptions = normalizeOptions(options);

    const body = {
      studentId: resolvedStudentId,
      questionId: resolvedQuestionId,
      questionLatex: questionLatex || 'Đề bài chưa cung cấp nội dung',
      options: resolvedOptions,
      studentWrongOption: resolvedWrongOpt,
      correctOption: resolvedCorrectOpt,
      skillId: resolvedSkillId
    };

    let fullAnswer = '';

    try {
      const response = await fetch(`${baseUrl}/api/practice/ai-tutor/ask-stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal
      });

      if (response.status === 429) {
        const rateLimitErr = new Error('Bạn đang gửi câu hỏi quá nhanh (Tối đa 10 câu/phút). Vui lòng dành thời gian đọc kỹ câu hỏi gợi mở của AI trước khi gửi tiếp nhé!');
        rateLimitErr.status = 429;
        if (onError) onError(rateLimitErr);
        throw rateLimitErr;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error || errorData.message || `Lỗi kết nối AI Tutor (HTTP ${response.status})`;
        const httpErr = new Error(msg);
        httpErr.status = response.status;
        if (onError) onError(httpErr);
        throw httpErr;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataStr = trimmed.replace(/^data:\s*/, '');
          if (dataStr === '[DONE]') {
            if (onComplete) onComplete(fullAnswer);
            return fullAnswer;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.interaction_id || parsed.interactionId) {
              const id = parsed.interaction_id || parsed.interactionId;
              if (onInteractionId) onInteractionId(id);
            }
            if (parsed.token) {
              fullAnswer += parsed.token;
              if (onToken) onToken(parsed.token);
            }
          } catch (jsonErr) {
            // Nuốt lỗi parse các dòng không phải JSON chuẩn
          }
        }
      }

      if (onComplete) onComplete(fullAnswer);
      return fullAnswer;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.info('[AI Tutor Stream] Yêu cầu stream đã bị hủy.');
        return fullAnswer || '';
      }
      console.error('[AI Tutor Stream Error]:', err);
      if (onError) onError(err);
      throw err;
    }
  },

  /**
   * Hỏi đáp gợi mở Socratic dạng JSON đồng bộ (Single Request - Response)
   */
  async askAiTutor(payload) {
    const sanitizedPayload = {
      ...payload,
      studentId: ensureGuid(payload.studentId, '00000000-0000-0000-0000-000000000001'),
      questionId: ensureGuid(payload.questionId, '11111111-1111-1111-1111-111111111111'),
      options: normalizeOptions(payload.options),
      studentWrongOption: cleanOptionKey(payload.studentWrongOption, 'A'),
      correctOption: cleanOptionKey(payload.correctOption, 'B')
    };
    return (await apiClient.post('/api/practice/ai-tutor/ask', sanitizedPayload)).data;
  },

  /**
   * Báo cáo câu trả lời của AI vi phạm quy tắc sư phạm (lộ đáp án, ảo giác, phản sư phạm)
   * @param {Object} report
   * @param {string} report.interactionId - GUID của phiên tương tác
   * @param {string} report.reason - Lý do báo cáo
   * @param {string} [report.studentId]
   */
  async reportAiTutorInteraction({ interactionId, reason, studentId }) {
    const resolvedInteractionId = ensureGuid(interactionId, '98e1f0fd-aed6-45f6-beac-be24686b573c');
    const resolvedStudentId = studentId ? ensureGuid(studentId, null) : (tokenStorage.getUser()?.id ? ensureGuid(tokenStorage.getUser()?.id, null) : null);
    return (await apiClient.post('/api/practice/ai-tutor/report', {
      interactionId: resolvedInteractionId,
      reason,
      studentId: resolvedStudentId
    })).data;
  },

  /**
   * Truy vấn lịch sử tương tác AI Tutor (phục vụ Giáo viên / Mentor Studio)
   */
  async getAiTutorInteractions({ reportedOnly = false, limit = 50, offset = 0 } = {}) {
    return (await apiClient.get(`/api/practice/ai-tutor/interactions?reportedOnly=${reportedOnly}&limit=${limit}&offset=${offset}`)).data;
  }
};

export default practiceService;
