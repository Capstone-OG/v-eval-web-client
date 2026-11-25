import apiClient from './apiClient';

// In-memory TTL + in-flight deduplication cache for static/semi-static curriculum catalog
const CURRICULUM_CACHE_TTL_MS = 15 * 60 * 1000;
let curriculumCacheEntry = { data: null, expiresAt: 0, promise: null };

const invalidateCurriculumCache = () => {
  curriculumCacheEntry = { data: null, expiresAt: 0, promise: null };
};

/**
 * Content Management Service
 * Routed through V-Eval API Gateway (:5212) -> Content Service (:5249)
 */
export const contentService = {
  invalidateCurriculumCache,
  /**
   * Core Flow 1 - Lấy bộ đề thi khảo sát chẩn đoán năng lực ban đầu (30 câu hỏi chuẩn V-ACT)
   * @param {string} [excludeExamId] - ID đề thi muốn bỏ qua khi làm lại đề mới
   */
  async getDiagnosticTest(excludeExamId = null) {
    if (Array.isArray(excludeExamId)) {
      const cleaned = excludeExamId.filter(Boolean);
      const endpoint = cleaned.length > 0
        ? `/api/content/diagnostic-test?excludeExamIds=${encodeURIComponent(cleaned.join(','))}`
        : '/api/content/diagnostic-test';
      return (await apiClient.get(endpoint)).data;
    }
    const endpoint = excludeExamId
      ? `/api/content/diagnostic-test?excludeExamId=${encodeURIComponent(excludeExamId)}`
      : '/api/content/diagnostic-test';
    return (await apiClient.get(endpoint)).data;
  },

  /**
   * Core Flow 2 - Lấy toàn bộ cây kỹ năng DAG kèm trọng số (12 kỹ năng chuẩn ĐGNL)
   */
  async getSkillsTree(options = {}) {
    return this.getCurriculum(options);
  },

  /**
   * Core Flow 2 - Lấy học liệu và video của một kỹ năng trong roadmap.
   * @param {string} skillId
   */
  async getMaterialsBySkill(skillId) {
    return (await apiClient.get(`/api/content/materials/by-skill/${encodeURIComponent(skillId)}`)).data;
  },

  /**
   * Lấy danh sách đề thi luyện tập / thi thử
   * @param {Object} [params] - { domainId, difficulty, page, limit }
   */
  async getMockExams(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/api/content/exams?${query}` : '/api/content/exams';
    return (await apiClient.get(endpoint)).data;
  },

  /**
   * Lấy chi tiết đề thi theo ID
   * @param {string} examId
   */
  async getExamDetail(examId) {
    return (await apiClient.get(`/api/content/exams/${encodeURIComponent(examId)}`)).data;
  },

  /**
   * Import dữ liệu đề thi đã bóc tách từ AI Engine hoặc soạn thủ công vào Supabase PostgreSQL
   * @param {Object} payload - Khớp với ImportMockExamCommand DTO
   */
  async importExam(payload) {
    const sanitizeQuestion = (q) => ({
      questionNumber: Number(q.questionNumber ?? q.question_number) || 1,
      pageNumber: Number(q.pageNumber ?? q.page_number) || 1,
      content: (q.content ?? '').toString(),
      options: {
        A: (q.options?.A ?? q.options?.a ?? '').toString(),
        B: (q.options?.B ?? q.options?.b ?? '').toString(),
        C: (q.options?.C ?? q.options?.c ?? '').toString(),
        D: (q.options?.D ?? q.options?.d ?? '').toString()
      },
      correctOption: normalizeCorrectOption(q.correctOption ?? q.correct_option),
      explanation: (q.explanation ?? '').toString(),
      difficultyLevel: Number(q.difficultyLevel ?? q.difficulty_level) || 2,
      suggestedSkillName: (q.suggestedSkillName ?? q.suggested_skill_name ?? 'Trắc nghiệm tổng hợp').toString(),
      imageUrl: q.imageUrl ?? q.image_url ?? null,
      skillId: q.skillId ?? q.skill_id ?? null,
      domainName: q.domainName ?? q.domain_name ?? null,
      chapterName: q.chapterName ?? q.chapter_name ?? null,
      lessonName: q.lessonName ?? q.lesson_name ?? null
    });

    const cleanPayload = {
      title: (payload.title || 'Đề thi trắc nghiệm').trim(),
      durationMinutes: Number(payload.durationMinutes ?? payload.duration_minutes) || 150,
      examCategory: payload.examCategory || payload.exam_category || 'FULL_MOCK',
      subjectCode: payload.subjectCode || payload.subject_code || 'MATH',
      difficultyLevel: Number(payload.difficultyLevel ?? payload.difficulty_level) || 2,
      passages: (payload.passages || []).map((p) => ({
        startQuestion: Number(p.startQuestion ?? p.start_question) || 1,
        endQuestion: Number(p.endQuestion ?? p.end_question) || 1,
        content: (p.content ?? '').toString(),
        imageUrl: p.imageUrl ?? p.image_url ?? null,
        questions: (p.questions || []).map(sanitizeQuestion)
      })),
      singleQuestions: (payload.singleQuestions || payload.single_questions || []).map(sanitizeQuestion)
    };

    return (await apiClient.post('/api/content/exams/import', cleanPayload)).data;
  },

  /**
   * Phê duyệt và xuất bản đề thi trong kho đề (Chuyển trạng thái sang Đã xuất bản)
   * @param {string} examId
   */
  async publishExam(examId) {
    return (await apiClient.patch(`/api/content/exams/${encodeURIComponent(examId)}/publish`)).data;
  },

  /**
   * Xóa đề thi khỏi cơ sở dữ liệu Supabase
   * @param {string} examId
   */
  async deleteExam(examId) {
    return (await apiClient.delete(`/api/content/exams/${encodeURIComponent(examId)}`)).data;
  },

  /**
   * Quản trị ngân hàng câu hỏi gốc (Phân hệ Content Admin / Teacher)
   * @param {Object} [params]
   */
  async getQuestions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/api/content/questions?${query}` : '/api/content/questions';
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
   * Lấy chi tiết 1 câu hỏi theo Question ID từ Content Service
   * @param {string} questionId
   */
  async getQuestionById(questionId) {
    return (await apiClient.get(`/api/content/questions/${encodeURIComponent(questionId)}`)).data;
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
    const res = (await apiClient.post('/api/content/questions', cleanPayload)).data;
    invalidateCurriculumCache();
    return res;
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
    const res = (await apiClient.put(`/api/content/questions/${encodeURIComponent(questionId)}`, cleanPayload)).data;
    invalidateCurriculumCache();
    return res;
  },

  /**
   * Xóa câu hỏi khỏi ngân hàng đề (API 18)
   * @param {string} questionId 
   */
  async deleteQuestion(questionId) {
    const res = (await apiClient.delete(`/api/content/questions/${encodeURIComponent(questionId)}`)).data;
    invalidateCurriculumCache();
    return res;
  },

  /**
   * Lấy toàn bộ cây dàn kiến thức 4 miền và các kỹ năng chuẩn từ Backend Content Service (Database Dynamic)
   * Có cache bộ nhớ 15 phút + gộp request đang chạy để tránh gọi lặp từ nhiều màn hình
   */
  async getCurriculum(options = {}) {
    const forceRefresh = Boolean(options?.forceRefresh);
    const now = Date.now();

    if (!forceRefresh) {
      if (curriculumCacheEntry.data !== null && curriculumCacheEntry.expiresAt > now) {
        return curriculumCacheEntry.data;
      }
      if (curriculumCacheEntry.promise) {
        return curriculumCacheEntry.promise;
      }
    }

    const promise = apiClient
      .get('/api/content/curriculum')
      .then((res) => {
        curriculumCacheEntry = {
          data: res.data,
          expiresAt: Date.now() + CURRICULUM_CACHE_TTL_MS,
          promise: null
        };
        return res.data;
      })
      .catch((err) => {
        curriculumCacheEntry = { data: null, expiresAt: 0, promise: null };
        throw err;
      });

    curriculumCacheEntry = { data: null, expiresAt: 0, promise };
    return promise;
  },

  /**
   * Nạp cây tri thức phân cấp từ Giảng viên / AI Engine (Dynamic Ingestion)
   * Tự động chuẩn hóa toàn bộ các trường, chuyển đổi đáp án đúng về 'A'|'B'|'C'|'D'
   * @param {Object} payload 
   */
  async importCurriculum(payload) {
    const cleanPayload = sanitizeCurriculumPayload(payload);
    const res = (await apiClient.post('/api/content/curriculum/import', cleanPayload)).data;
    invalidateCurriculumCache();
    return res;
  },

  /**
   * Giảng viên hiệu đính toàn bộ 4 khối nội dung của dạng bài
   * @param {string} patternId 
   * @param {Object} payload 
   */
  async updatePattern(patternId, payload) {
    const res = (await apiClient.put(`/api/content/curriculum/patterns/${encodeURIComponent(patternId)}`, payload)).data;
    invalidateCurriculumCache();
    return res;
  },

  /**
   * Giảng viên cập nhật node (Chương / Bài học)
   * @param {string} nodeId 
   * @param {Object} payload 
   */
  async updateNode(nodeId, payload) {
    const res = (await apiClient.put(`/api/content/curriculum/nodes/${encodeURIComponent(nodeId)}`, payload)).data;
    invalidateCurriculumCache();
    return res;
  },

  /**
   * Giảng viên thêm mới Chương / Bài học / Dạng bài
   * @param {Object} payload 
   */
  async createNode(payload) {
    const res = (await apiClient.post('/api/content/curriculum/nodes', payload)).data;
    invalidateCurriculumCache();
    return res;
  },

  /**
   * Giảng viên xóa node khỏi Cây tri thức
   * @param {string} nodeId 
   */
  async deleteNode(nodeId) {
    const res = (await apiClient.delete(`/api/content/curriculum/nodes/${encodeURIComponent(nodeId)}`)).data;
    invalidateCurriculumCache();
    return res;
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
  sanitized.domainName = sanitized.domainName || sanitized.domain_name || 'Toán học';
  sanitized.domainDescription = sanitized.domainDescription || sanitized.domain_description || '';

  if (Array.isArray(sanitized.chapters)) {
    sanitized.chapters.forEach((ch, chIdx) => {
      ch.chapterName = ch.chapterName || ch.chapter_name || `Chương ${chIdx + 1}`;
      ch.description = ch.description || '';
      ch.weight = typeof ch.weight === 'number' ? ch.weight : 0.25;

      if (Array.isArray(ch.lessons)) {
        ch.lessons.forEach((les, lesIdx) => {
          les.lessonName = les.lessonName || les.lesson_name || `Bài ${lesIdx + 1}`;
          les.summary = les.summary || '';
          les.weight = typeof les.weight === 'number' ? les.weight : 0.08;

          if (Array.isArray(les.patterns)) {
            les.patterns.forEach((pat, patIdx) => {
              pat.patternName = pat.patternName || pat.pattern_name || `Dạng ${patIdx + 1}`;
              pat.theoryRecap = (pat.theoryRecap ?? pat.theory_recap ?? pat.theory ?? '').toString();
              pat.solutionMethod = (pat.solutionMethod ?? pat.solution_method ?? pat.method ?? '').toString();
              pat.videoUrl = (pat.videoUrl ?? pat.video_url ?? '').toString();
              pat.durationSeconds = typeof pat.durationSeconds === 'number' ? pat.durationSeconds : 600;
              pat.weight = typeof pat.weight === 'number' ? pat.weight : 0.04;
              pat.prerequisiteSkillIds = Array.isArray(pat.prerequisiteSkillIds) ? pat.prerequisiteSkillIds : [];

              if (Array.isArray(pat.questions)) {
                pat.questions.forEach(q => {
                  q.correctOption = normalizeCorrectOption(q.correctOption ?? q.correct_option);
                  if (typeof q.difficultyLevel !== 'number') {
                    q.difficultyLevel = Number(q.difficultyLevel ?? q.difficulty_level) || 2;
                  }
                  q.contentLatex = (q.contentLatex ?? q.content_latex ?? q.content ?? '').toString();
                  q.optionA = (q.optionA ?? q.option_a ?? '').toString();
                  q.optionB = (q.optionB ?? q.option_b ?? '').toString();
                  q.optionC = (q.optionC ?? q.option_c ?? '').toString();
                  q.optionD = (q.optionD ?? q.option_d ?? '').toString();
                  q.explanation = (q.explanation ?? '').toString();
                });
              } else {
                pat.questions = [];
              }
            });
          } else {
            les.patterns = [];
          }
        });
      } else {
        ch.lessons = [];
      }
    });
  } else {
    sanitized.chapters = [];
  }

  return sanitized;
}

export default contentService;
