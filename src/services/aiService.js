import apiClient, { tokenStorage } from './apiClient';

/**
 * AI Engine Service (Gemini OCR, Socratic AI Tutor & Conversational RAG Engine)
 * Routed through V-Eval YARP API Gateway (:5212) ->
 *   - .NET Core AI Engine (:5104) for Exam OCR, Background Job Polling & Textbook Ingestion
 *   - Python FastAPI Service (:8000) for Psychometrics IRT/BKT, Exam Generator & Socratic RAG Chat
 */
export const aiService = {
  // =========================================================================
  // 1. BÓC TÁCH ĐỀ THI PDF BẰNG GEMINI VISION OCR (.NET Core AI Engine :5104)
  // =========================================================================

  /**
   * Upload file PDF đề thi gốc để Gemini Flash phân tích, bóc tách câu hỏi & OCR công thức
   * @param {File} pdfFile - Tệp PDF đề thi cần phân tích
   * @returns {Promise<{jobId: string, status: string, fileName: string, createdAt: string}>}
   */
  async uploadPdfExam(pdfFile) {
    const formData = new FormData();
    formData.append('file', pdfFile);
    const response = await apiClient.upload('/api/ai-engine/upload-pdf', formData);
    return response.data;
  },

  /**
   * Truy vấn trạng thái tiến trình nền bóc tách đề thi PDF (Polling Endpoint)
   * @param {string} jobId - Mã định danh tác vụ nhận được từ uploadPdfExam
   * @returns {Promise<{jobId: string, status: string, progressMessage?: string, parsedExam?: object, errorMessage?: string}>}
   */
  async getExamJobStatus(jobId) {
    const response = await apiClient.get(`/api/ai-engine/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Lấy URL trang giao diện xem trước đề thi bóc tách trực quan
   * @param {string} [jobId]
   * @returns {string}
   */
  getViewExamUrl(jobId = null) {
    const base = apiClient.getBaseUrl();
    return jobId ? `${base}/view-exam?jobId=${encodeURIComponent(jobId)}` : `${base}/view-exam`;
  },

  // =========================================================================
  // 2. NẠP & QUẢN TRỊ TRI THỨC SGK / VECTOR DB (.NET Core AI Engine :5104)
  // =========================================================================

  /**
   * Upload tệp Sách giáo khoa / Tài liệu chuẩn (hỗ trợ file lớn đến 250MB) vào kho tri thức
   * @param {File} file - Tệp PDF SGK cần nạp
   * @param {object} [options]
   * @param {string} [options.domainId='Domain-Default'] - Mã miền kiến thức (Toán, Văn, KHTN...)
   * @param {string} [options.skillId='Skill-Default'] - Mã kỹ năng chuyên biệt
   * @param {string} [options.docType='TEXTBOOK'] - Loại tài liệu (TEXTBOOK, REFERENCE, EXAM)
   * @param {string} [options.ocrMode='TEXT_HUMANITIES'] - Chế độ OCR (TEXT_HUMANITIES, FORMULA_STEM)
   * @param {boolean} [options.forceReingest=false] - Bỏ qua checkpoint và nạp lại từ đầu
   * @returns {Promise<{jobId: string, fileHash: string, totalPages: number, status: string}>}
   */
  async uploadTextbookPdf(file, {
    domainId = 'Domain-Default',
    skillId = 'Skill-Default',
    docType = 'TEXTBOOK',
    ocrMode = 'TEXT_HUMANITIES',
    forceReingest = false
  } = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('domainId', domainId);
    formData.append('skillId', skillId);
    formData.append('docType', docType);
    formData.append('ocrMode', ocrMode);
    formData.append('forceReingest', forceReingest.toString());

    const response = await apiClient.upload('/api/ai-engine/textbooks/upload-pdf', formData);
    return response.data;
  },

  /**
   * Kiểm tra tác vụ nạp SGK đang chạy gần nhất (phục vụ khi học sinh/giáo viên F5 trang)
   * @returns {Promise<{hasActive: boolean, job?: object}>}
   */
  async getActiveTextbookJob() {
    const response = await apiClient.get('/api/ai-engine/textbooks/active-job');
    return response.data;
  },

  /**
   * Tra cứu Checkpoint của tệp SGK theo SHA-256 Hash
   * @param {string} fileHash - Mã băm SHA-256 của tệp
   * @returns {Promise<{hasCheckpoint: boolean, sourceId?: string, lastProcessedPage?: number, totalPages?: number, isCompleted?: boolean}>}
   */
  async getTextbookCheckpoint(fileHash) {
    const response = await apiClient.get(`/api/ai-engine/textbooks/checkpoint/${fileHash}`);
    return response.data;
  },

  /**
   * Kiểm tra tiến độ nạp SGK theo Job ID (Polling Endpoint)
   * @param {string} jobId
   * @returns {Promise<{jobId: string, status: string, progressStep?: string, progressPercent?: number, currentPage?: number, totalPages?: number, result?: object, errorMessage?: string}>}
   */
  async getTextbookJobStatus(jobId) {
    const response = await apiClient.get(`/api/ai-engine/textbooks/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Lấy danh sách Vector Chunks tri thức đã bóc tách theo SourceId
   * @param {string} sourceId
   * @returns {Promise<{sourceId: string, totalChunks: number, chunks: Array<object>}>}
   */
  async getTextbookChunks(sourceId) {
    const response = await apiClient.get(`/api/ai-engine/textbooks/chunks/${sourceId}`);
    return response.data;
  },

  /**
   * Lấy danh sách Vector Chunks tri thức theo mã SHA-256 Hash
   * @param {string} fileHash
   * @returns {Promise<{sourceId: string, fileHash: string, totalPages: number, lastProcessedPage: number, status: string, totalChunks: number, chunks: Array<object>}>}
   */
  async getTextbookChunksByHash(fileHash) {
    const response = await apiClient.get(`/api/ai-engine/textbooks/chunks-by-hash/${fileHash}`);
    return response.data;
  },

  /**
   * Lưu các Vector Chunks và tri thức SGK vào Supabase Database (Schema v_eval_ai)
   * @param {object} textbookResultDto
   * @returns {Promise<{success: boolean, message: string, sourceId: string, totalChunksSaved: number, fileHash: string}>}
   */
  async saveTextbookChunksToDb(textbookResultDto) {
    const response = await apiClient.post('/api/ai-engine/textbooks/save-db', textbookResultDto);
    return response.data;
  },

  /**
   * Ping kiểm tra & đo độ trễ các mô hình Vision AI (Gemini Flash-Lite, Gemini 3.8 Flash, OpenAI)
   * @param {string} [geminiKey] - Tùy chọn truyền API Key tạm thời để test
   * @returns {Promise<{pingTimestamp: string, hasActiveKey: boolean, recommendations: object, models: Array<object>}>}
   */
  async pingVisionModels(geminiKey = null) {
    const endpoint = geminiKey 
      ? `/api/ai-engine/textbooks/ping-vision?key=${encodeURIComponent(geminiKey)}`
      : '/api/ai-engine/textbooks/ping-vision';
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  /**
   * Lấy URL trang giao diện xem và nạp SGK trực quan
   * @returns {string}
   */
  getViewTextbookUrl() {
    return `${apiClient.getBaseUrl()}/view-textbook`;
  },

  // =========================================================================
  // 3. SINH ĐỀ THI AI & CHẨN ĐOÁN NĂNG LỰC IRT/BKT (Python FastAPI RAG :8000)
  // =========================================================================

  /**
   * Sinh đề thi AI động theo Prompt giáo viên và chuẩn hóa Bloom 6 cấp độ
   * @param {object} payload
   * @param {string} [payload.prompt] - Prompt yêu cầu (ví dụ: 'Đề thi chuyên sâu Văn 15 câu Bloom 3-5')
   * @param {string} [payload.domainId='ALL'] - Mã miền (ALL, dom_math, dom_logic, dom_lang, dom_nat_sci, dom_soc_sci)
   * @param {number} [payload.questionCount=10] - Số lượng câu hỏi (từ 5 đến 50)
   * @param {number} [payload.bloomLevel=null] - Giới hạn cấp độ Bloom (1: Nhớ, 2: Hiểu, 3: Vận dụng, 4: Phân tích, 5: Đánh giá, 6: Sáng tạo)
   * @param {'gemini'|'calibrated'} [payload.generatorMode='gemini'] - 'gemini' (AI Cloud) hoặc 'calibrated' (Ngân hàng hiệu chuẩn <500ms)
   * @returns {Promise<{title: string, prompt_used: string, total_questions: number, questions: Array<object>, bloom_distribution: object, option_distribution: object, engine_used: string, generation_time_ms: number}>}
   */
  async generateExam({
    prompt = '',
    domainId = 'ALL',
    questionCount = 10,
    bloomLevel = null,
    generatorMode = 'gemini'
  } = {}) {
    const body = {
      prompt,
      domain_id: domainId,
      question_count: questionCount,
      bloom_level: bloomLevel,
      generator_mode: generatorMode
    };
    const response = await apiClient.post('/api/v1/diagnostic/generate-exam', body);
    return response.data;
  },

  /**
   * Chẩn đoán năng lực học sinh qua bài thi chẩn đoán 30 câu (Core Flow 1)
   * Ước lượng năng lực IRT 2PL theta_0, BKT initial mastery P(L0), phân lớp và dữ liệu Radar Chart
   * @param {object} payload
   * @param {string} payload.studentId
   * @param {string} payload.submissionId
   * @param {Array<{question_id: string, skill_id: string, domain_id: string, difficulty_level: number, is_correct: boolean, time_spent_seconds: number}>} payload.answers
   * @param {Array<{domain_id: string, domain_name: string}>} [payload.domainNames=[]]
   * @param {number} [payload.targetScore=900]
   * @param {Array<string>} [payload.allSkillIds=[]]
   * @returns {Promise<{student_id: string, submission_id: string, theta_0: number, placement_class: string, domain_scores: Array<object>, skill_priors: Array<object>, radar_chart: Array<object>, ai_commentary: string}>}
   */
  async analyzeDiagnosticSubmission({
    studentId,
    submissionId,
    answers,
    domainNames = [],
    targetScore = 900,
    allSkillIds = {}
  }) {
    const body = {
      student_id: studentId,
      submission_id: submissionId,
      answers,
      domain_names: domainNames,
      target_score: targetScore,
      all_skill_ids: Array.isArray(allSkillIds) ? {} : (allSkillIds || {})
    };
    const response = await apiClient.post('/api/v1/diagnostic/analyze', body);
    return response.data;
  },

  /**
   * Lấy cấu hình tham số động cơ chẩn đoán (ngưỡng phân lớp, bảng tham số IRT)
   * @returns {Promise<{max_score: number, difficulty_levels: object, placement_thresholds: object, bkt_prior_clamping: object}>}
   */
  async getDiagnosticConfig() {
    const response = await apiClient.get('/api/v1/diagnostic/config');
    return response.data;
  },

  /**
   * Lấy URL trang giao diện khảo sát năng lực chẩn đoán trực quan
   * @returns {string}
   */
  getViewDiagnosticUrl() {
    return `${apiClient.getBaseUrl()}/view-diagnostic`;
  },

  // =========================================================================
  // 4. TRỢ LÝ GIA SƯ AI SOCRATIC RAG (Python FastAPI RAG :8000)
  // =========================================================================

  /**
   * Hỏi đáp với Gia sư AI Socratic RAG (Single Request - Response)
   * @param {object} payload
   * @param {string} payload.question - Câu hỏi của học sinh
   * @param {string} [payload.sessionId='default-session'] - Phiên trò chuyện
   * @returns {Promise<{session_id: string, question: string, answer: string, sources: Array<object>}>}
   */
  async askSocraticTutor({ question, sessionId = 'default-session' }) {
    const body = {
      question,
      session_id: sessionId
    };
    const response = await apiClient.post('/api/v1/chat', body);
    return response.data;
  },

  /**
   * Chat với Gia sư AI Socratic dạng SSE Streaming (Hiển thị từng token chữ chạy mượt mà như ChatGPT)
   * @param {object} params
   * @param {string} params.question - Câu hỏi của học sinh
   * @param {string} [params.sessionId='default-session'] - Phiên trò chuyện
   * @param {(token: string) => void} params.onToken - Callback khi nhận được từng ký tự / token mới
   * @param {(error: Error) => void} [params.onError] - Callback khi có lỗi kết nối
   * @param {() => void} [params.onComplete] - Callback khi stream hoàn tất
   * @param {AbortSignal} [params.signal] - Tín hiệu hủy yêu cầu stream
   * @returns {Promise<string>} Toàn bộ câu trả lời hoàn chỉnh sau khi kết thúc stream
   */
  async askSocraticTutorStream({
    question,
    sessionId = 'default-session',
    onToken,
    onError,
    onComplete,
    signal
  }) {
    const baseUrl = apiClient.getBaseUrl();
    const token = tokenStorage.getAccessToken();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream'
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${baseUrl}/api/v1/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ question, session_id: sessionId }),
        signal
      });

      if (!response.ok) {
        throw new Error(`Chat stream failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullAnswer = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Giữ lại dòng chưa hoàn chỉnh cuối cùng

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataStr = trimmed.replace(/^data:\s*/, '');
          if (dataStr === '[DONE]') {
            if (onComplete) onComplete();
            return fullAnswer;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.token) {
              fullAnswer += parsed.token;
              if (onToken) onToken(parsed.token);
            }
          } catch (jsonErr) {
            // Nuốt lỗi parse các định dạng non-json nếu có
          }
        }
      }

      if (onComplete) onComplete();
      return fullAnswer;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.info('[AI Socratic Stream] Chat request aborted by user.');
        return '';
      }
      console.error('[AI Socratic Stream Error]:', err);
      if (onError) onError(err);
      throw err;
    }
  },

  /**
   * Lấy danh sách các phiên trò chuyện Socratic đang hoạt động
   * @returns {Promise<{active_sessions: Array<string>}>}
   */
  async getChatSessions() {
    const response = await apiClient.get('/api/v1/chat/sessions');
    return response.data;
  },

  /**
   * Xóa lịch sử trò chuyện của một phiên
   * @param {string} sessionId
   * @returns {Promise<{session_id: string, message: string}>}
   */
  async clearChatSession(sessionId) {
    const response = await apiClient.delete(`/api/v1/chat/sessions/${sessionId}`);
    return response.data;
  },

  // =========================================================================
  // 5. QUẢN LÝ TÀI LIỆU TRI THỨC RAG PHIÊN BẢN HÓA (Python FastAPI RAG :8000)
  // =========================================================================

  /**
   * Nạp tài liệu tri thức (PDF / DOCX) vào kho RAG pgvector với mã băm SHA-256
   * @param {File} file
   * @returns {Promise<{message: string, status: string, document_id?: string, document_group_id?: string, version?: number, total_chunks?: number}>}
   */
  async uploadRagDocument(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.upload('/api/v1/documents/upload', formData);
    return response.data;
  }
};

export default aiService;
