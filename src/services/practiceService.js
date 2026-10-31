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

const buildRichSocraticFallback = ({ questionLatex, options, studentWrongOption, correctOption }) => {
  const cleanQ = String(questionLatex || '').replace(/\[Ngữ cảnh câu hỏi:[\s\S]*?\]/g, '').trim() || String(questionLatex || '');
  const opts = normalizeOptions(options);
  const wrongKey = cleanOptionKey(studentWrongOption, 'A');
  const rightKey = cleanOptionKey(correctOption, 'C');
  const wrongVal = opts[wrongKey] && !opts[wrongKey].startsWith('Phương án ') ? ` (${opts[wrongKey]})` : '';
  const rightVal = opts[rightKey] && !opts[rightKey].startsWith('Phương án ') ? ` (${opts[rightKey]})` : '';

  return (
    `💡 **Gợi ý phương pháp giải Socratic:**\n\n` +
    `- **Phân tích lựa chọn:** Với câu hỏi *"${cleanQ}"*, em đã chọn phương án **${wrongKey}${wrongVal}**, trong khi phương án thỏa mãn đầy đủ điều kiện bài toán là **${rightKey}${rightVal}**.\n` +
    `- **Hướng kiểm tra bản chất:** Hãy xét điều kiện xác định và kiểm tra tính chất đặc trưng (như dấu của đạo hàm $y'$, điều kiện biên hoặc biến đổi tương đương) trên toàn miền của bài toán. Phương án **${wrongKey}${wrongVal}** thường là bẫy khi chỉ thỏa mãn trên một tập con hoặc đổi dấu tại điểm cực trị.\n\n` +
    `👉 *Câu hỏi gợi mở:* Khi đối chiếu trực tiếp điều kiện của đề bài vào phương án **${wrongKey}${wrongVal}** và **${rightKey}${rightVal}**, em thấy biểu thức nào luôn giữ nguyên tính chất trên toàn miền yêu cầu?`
  );
};

const HISTORY_STORAGE_KEY = 'veval_submission_history_v1';

const getDefaultSeedHistory = () => [
  {
    id: 'sub_seed_vact_01',
    title: 'Đề Khảo Sát Năng Lực Đầu Vào Chuẩn V-ACT 2026 (Đề số 01)',
    examType: 'DIAGNOSTIC',
    engineUsed: 'content_service',
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    theta_0: 0.42,
    placement_class: 'ACCELERATION',
    ai_commentary:
      'Bạn đạt độ chính xác 67% trên bài khảo sát mẫu. Năng lực Tư duy Logic và Toán học ở mức khá, tuy nhiên cần củng cố kỹ việc xét dấu đạo hàm trên toàn miền xác định và đọc kỹ mệnh đề phủ định.',
    pacing: {
      totalCorrect: 4,
      totalQuestions: 6,
      totalTimeSpent: 215,
      avgTimePerQ: 36,
      fastCount: 2,
      normalCount: 3,
      slowCount: 1,
      flaggedCount: 1
    },
    domain_scores: [
      { domain_id: 'dom_math', domain_name: 'Toán học & Phân tích số liệu', total_questions: 3, correct_count: 2, accuracy_pct: 67 },
      { domain_id: 'dom_logic', domain_name: 'Tư duy Logic & Suy luận', total_questions: 2, correct_count: 1, accuracy_pct: 50 },
      { domain_id: 'dom_lang', domain_name: 'Sử dụng Ngôn ngữ & Văn học', total_questions: 1, correct_count: 1, accuracy_pct: 100 }
    ],
    radar_chart: [
      { domain_id: 'dom_math', domain_name: 'Toán học & Phân tích số liệu', student_pct: 67, benchmark_pct: 85 },
      { domain_id: 'dom_logic', domain_name: 'Tư duy Logic & Suy luận', student_pct: 50, benchmark_pct: 80 },
      { domain_id: 'dom_lang', domain_name: 'Sử dụng Ngôn ngữ & Văn học', student_pct: 100, benchmark_pct: 75 }
    ],
    reviewedQuestions: [
      {
        id: 'seed_q_1',
        question_number: 1,
        content: 'Hàm số nào sau đây đồng biến trên khoảng $(-\\infty; +\\infty)$?',
        options: ['$y = x^4 + 2x^2$', '$y = \\frac{2x-1}{x+1}$', '$y = x^3 + 3x - 1$', '$y = -x^3 + x$'],
        skill_id: 'sk_dom_math_1',
        skill_name: 'Tính đơn điệu của hàm số',
        domain_id: 'dom_math',
        domain_name: 'Toán học & Phân tích số liệu',
        bloom: 2,
        studentChoice: 'A',
        correctChoice: 'C',
        correct: 'C',
        isCorrect: false,
        timeSpent: 42,
        isFlagged: true,
        speedCategory: 'normal',
        explanation: 'Ta có $y\' = 3x^2 + 3 > 0, \\forall x \\in \\mathbb{R}$, do đó hàm số $y = x^3 + 3x - 1$ luôn đồng biến trên $\\mathbb{R}$.'
      },
      {
        id: 'seed_q_2',
        question_number: 2,
        content: 'Cho cấp số cộng $(u_n)$ có $u_1 = 3$ và công sai $d = 4$. Giá trị của $u_5$ bằng:',
        options: ['$19$', '$15$', '$23$', '$16$'],
        skill_id: 'sk_dom_math_2',
        skill_name: 'Dãy số & Cấp số cộng',
        domain_id: 'dom_math',
        domain_name: 'Toán học & Phân tích số liệu',
        bloom: 1,
        studentChoice: 'A',
        correctChoice: 'A',
        correct: 'A',
        isCorrect: true,
        timeSpent: 20,
        isFlagged: false,
        speedCategory: 'fast',
        explanation: 'Áp dụng công thức số hạng tổng quát $u_n = u_1 + (n-1)d$, ta có $u_5 = 3 + 4 \\times 4 = 19$.'
      },
      {
        id: 'seed_q_3',
        question_number: 3,
        content: 'Tìm tập xác định $D$ của hàm số $y = \\log_2(x^2 - 4x + 3)$:',
        options: ['$D = (1; 3)$', '$D = (-\\infty; 1) \\cup (3; +\\infty)$', '$D = [1; 3]$', '$D = (3; +\\infty)$'],
        skill_id: 'sk_dom_math_3',
        skill_name: 'Hàm số Mũ & Logarit',
        domain_id: 'dom_math',
        domain_name: 'Toán học & Phân tích số liệu',
        bloom: 2,
        studentChoice: 'B',
        correctChoice: 'B',
        correct: 'B',
        isCorrect: true,
        timeSpent: 35,
        isFlagged: false,
        speedCategory: 'normal',
        explanation: 'Điều kiện xác định: $x^2 - 4x + 3 > 0 \\iff x < 1$ hoặc $x > 3$. Vậy $D = (-\\infty; 1) \\cup (3; +\\infty)$.'
      },
      {
        id: 'seed_q_4',
        question_number: 4,
        content: 'Cho mệnh đề: "Nếu trời mưa thì đường ướt". Mệnh đề nào sau đây tương đương logic (contrapositive) với mệnh đề đã cho?',
        options: [
          'Nếu trời không mưa thì đường không ướt.',
          'Nếu đường ướt thì trời mưa.',
          'Nếu đường không ướt thì trời không mưa.',
          'Trời mưa hoặc đường ướt.'
        ],
        skill_id: 'sk_dom_logic_1',
        skill_name: 'Mệnh đề & Suy luận Logic',
        domain_id: 'dom_logic',
        domain_name: 'Tư duy Logic & Suy luận',
        bloom: 2,
        studentChoice: 'A',
        correctChoice: 'C',
        correct: 'C',
        isCorrect: false,
        timeSpent: 55,
        isFlagged: false,
        speedCategory: 'normal',
        explanation: 'Mệnh đề kéo theo $P \\Rightarrow Q$ chỉ tương đương logic với mệnh đề phản đảo $\\neg Q \\Rightarrow \\neg P$ ("Nếu đường không ướt thì trời không mưa").'
      },
      {
        id: 'seed_q_5',
        question_number: 5,
        content: 'Năm bạn A, B, C, D, E xếp thành một hàng dọc. Biết A đứng trước B, C đứng ngay sau B, và D đứng đầu hàng. Nếu E đứng cuối hàng thì ai đứng ở vị trí thứ 3?',
        options: ['A', 'B', 'C', 'D'],
        skill_id: 'sk_dom_logic_2',
        skill_name: 'Phân tích Sắp xếp & Ràng buộc',
        domain_id: 'dom_logic',
        domain_name: 'Tư duy Logic & Suy luận',
        bloom: 3,
        studentChoice: 'B',
        correctChoice: 'B',
        correct: 'B',
        isCorrect: true,
        timeSpent: 45,
        isFlagged: false,
        speedCategory: 'normal',
        explanation: 'Thứ tự từ 1 đến 5 là: D (1) - A (2) - B (3) - C (4) - E (5). Vậy vị trí thứ 3 là B.'
      },
      {
        id: 'seed_q_6',
        question_number: 6,
        content: 'Chọn từ viết đúng chính tả tiếng Việt chuẩn trong các phương án sau:',
        options: ['Sáng lạng', 'Xán lạn', 'Sáng lạn', 'Xáng lạn'],
        skill_id: 'sk_dom_lang_1',
        skill_name: 'Chính tả & Ngữ nghĩa Tiếng Việt',
        domain_id: 'dom_lang',
        domain_name: 'Sử dụng Ngôn ngữ & Văn học',
        bloom: 1,
        studentChoice: 'B',
        correctChoice: 'B',
        correct: 'B',
        isCorrect: true,
        timeSpent: 18,
        isFlagged: false,
        speedCategory: 'fast',
        explanation: '"Xán lạn" (gốc Hán Việt: rực rỡ, tươi sáng) là từ đúng chính tả.'
      }
    ]
  }
];

/**
 * Practice & Adaptive Learning Roadmap Service
 * Routed through V-Eval API Gateway (:5212) -> Practice Service (:5261)
 */
export const practiceService = {
  // =========================================================================
  // Core Flow 1: Khảo Thí & Chẩn Đoán Ban Đầu (IRT 2PL) & Lịch Sử Làm Bài
  // =========================================================================

  /**
   * Nộp bài thi khảo sát chẩn đoán năng lực ban đầu
   * @param {Object} submission - { examId, studentId, responses: [{ questionId, selectedOptionId, responseTimeSeconds }] }
   */
  async submitDiagnosticTest(submission) {
    return (await apiClient.post('/api/v1/practice/diagnostic-submissions', submission)).data;
  },

  /**
   * Lấy danh sách lịch sử bài làm khảo sát của học sinh từ Backend Practice Service
   * @param {string} studentId
   */
  async getStudentDiagnosticHistory(studentId) {
    const resolvedId = ensureGuid(studentId || tokenStorage.getUser()?.id, '00000000-0000-0000-0000-000000000001');
    return (await apiClient.get(`/api/v1/practice/diagnostic-submissions/student/${resolvedId}`)).data;
  },

  /**
   * Lấy chi tiết kết quả một bài nộp khảo sát theo Submission ID từ Backend Practice Service
   * @param {string} submissionId
   */
  async getDiagnosticSubmissionById(submissionId) {
    return (await apiClient.get(`/api/v1/practice/diagnostic-submissions/${submissionId}`)).data;
  },

  /**
   * Truy xuất Sổ tay lỗi sai cá nhân (Mistake Notebook)
   */
  async getMistakeNotebook({ studentId, skillId = null, cognitiveErrorTag = null, isMastered = null, pageIndex = 1, pageSize = 20 } = {}) {
    const resolvedId = ensureGuid(studentId || tokenStorage.getUser()?.id, '00000000-0000-0000-0000-000000000001');
    const params = new URLSearchParams({ studentId: resolvedId, pageIndex: String(pageIndex), pageSize: String(pageSize) });
    if (skillId) params.set('skillId', skillId);
    if (cognitiveErrorTag) params.set('cognitiveErrorTag', cognitiveErrorTag);
    if (isMastered !== null && isMastered !== undefined) params.set('isMastered', String(isMastered));
    return (await apiClient.get(`/api/v1/practice/mistakes?${params.toString()}`)).data;
  },

  /**
   * Lưu bản ghi kết quả làm bài vào Lịch sử làm bài (đồng bộ LocalStorage để học sinh xem lại đáp án & hỏi AI mọi lúc)
   * @param {Object} record
   */
  saveSubmissionToHistory(record) {
    try {
      const existing = this.getSubmissionHistory();
      const entry = {
        id: record.id || record.submissionId || `sub_${Date.now()}`,
        title: record.title || 'Bài Khảo Sát Đánh Giá Năng Lực Đầu Vào (30 Câu)',
        examType: record.examType || 'DIAGNOSTIC',
        engineUsed: record.engineUsed || 'content_service',
        completedAt: record.completedAt || new Date().toISOString(),
        theta_0: record.theta_0 ?? 0,
        placement_class: record.placement_class || 'ACCELERATION',
        domain_scores: record.domain_scores || [],
        radar_chart: record.radar_chart || [],
        ai_commentary: record.ai_commentary || '',
        reviewedQuestions: record.reviewedQuestions || [],
        pacing: record.pacing || {
          totalCorrect: (record.reviewedQuestions || []).filter((q) => q.isCorrect).length,
          totalQuestions: (record.reviewedQuestions || []).length || 1,
          totalTimeSpent: 0,
          avgTimePerQ: 0,
          fastCount: 0,
          normalCount: 0,
          slowCount: 0,
          flaggedCount: 0
        }
      };

      const filtered = existing.filter((item) => item.id !== entry.id);
      const updated = [entry, ...filtered].slice(0, 30);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      return entry;
    } catch (e) {
      console.warn('Could not save submission to history:', e);
      return record;
    }
  },

  /**
   * Lấy danh sách toàn bộ Lịch sử làm bài của học sinh (Tự động migrate bài làm gần nhất nếu có)
   * @returns {Array}
   */
  getSubmissionHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      // Migrate veval_last_diagnostic_result if present
      const lastRaw = localStorage.getItem('veval_last_diagnostic_result');
      if (lastRaw) {
        const lastResult = JSON.parse(lastRaw);
        if (lastResult && Array.isArray(lastResult.reviewedQuestions)) {
          const migrated = [
            {
              id: lastResult.id || `sub_migrated_${Date.now()}`,
              title: lastResult.title || 'Bài Khảo Sát Đánh Giá Năng Lực Đầu Vào (30 Câu)',
              examType: lastResult.examType || 'DIAGNOSTIC',
              engineUsed: lastResult.engineUsed || 'content_service',
              completedAt: lastResult.completedAt || new Date().toISOString(),
              ...lastResult
            },
            ...getDefaultSeedHistory()
          ];
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }
      }

      const seeded = getDefaultSeedHistory();
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    } catch (e) {
      console.warn('Could not load submission history:', e);
      return getDefaultSeedHistory();
    }
  },

  /**
   * Xóa một bản ghi lịch sử làm bài
   */
  deleteSubmissionFromHistory(submissionId) {
    try {
      const current = this.getSubmissionHistory();
      const filtered = current.filter((item) => item.id !== submissionId);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
      return filtered;
    } catch (e) {
      console.warn('Could not delete submission from history:', e);
      return [];
    }
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
              const incomingToken = parsed.token.includes('Bước nào trong quá trình biến đổi khiến em chọn phương án này')
                ? buildRichSocraticFallback({
                    questionLatex,
                    options: resolvedOptions,
                    studentWrongOption: resolvedWrongOpt,
                    correctOption: resolvedCorrectOpt
                  })
                : parsed.token;
              fullAnswer += incomingToken;
              if (onToken) onToken(incomingToken);
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
