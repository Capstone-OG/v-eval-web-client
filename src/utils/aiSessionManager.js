/**
 * aiSessionManager.js
 * Quản lý phiên hội thoại Gia sư AI Socratic Tutor (Hybrid Client Storage + Cloud Sync).
 * Đảm bảo học sinh không bao giờ bị mất mạch tư duy khi tắt modal, tải lại trang,
 * hoặc chuyển đổi giữa các câu hỏi khảo thí ĐGNL.
 */

const STORAGE_PREFIX = 'veval_socratic_sessions_';

/**
 * Lấy storage key tương ứng với từng định danh học sinh
 */
export function getStorageKey(userId) {
  const cleanId = userId ? String(userId).trim() : 'guest_student';
  return `${STORAGE_PREFIX}${cleanId}`;
}

/**
 * Định dạng thời gian thân thiện cho danh sách phiên
 */
export function formatSessionTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return timeStr;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Hôm qua ${timeStr}`;
  }

  return `${d.getDate()}/${d.getMonth() + 1} ${timeStr}`;
}

/**
 * Trích xuất tiêu đề ngắn gọn từ câu hỏi hoặc nội dung trò chuyện
 */
export function generateSessionTitle(questionText, skillName) {
  if (questionText && typeof questionText === 'string') {
    // Xóa bớt ký tự markdown/latex đặc biệt để tiêu đề gọn gàng
    const clean = questionText
      .replace(/[\$\*\#\_\[\]\(\)]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (clean.length > 0) {
      return clean.length > 42 ? `${clean.substring(0, 42)}...` : clean;
    }
  }
  if (skillName && typeof skillName === 'string' && skillName.trim()) {
    return `Ôn tập: ${skillName.trim()}`;
  }
  return 'Phiên hỏi đáp Socratic';
}

/**
 * Đọc toàn bộ danh sách phiên từ LocalStorage của học sinh
 */
export function getSessions(userId) {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  } catch {
    return [];
  }
}

/**
 * Lưu danh sách phiên vào LocalStorage
 */
export function saveSessions(userId, sessions) {
  try {
    if (!Array.isArray(sessions)) return;
    localStorage.setItem(getStorageKey(userId), JSON.stringify(sessions));
  } catch {
    // Bỏ qua lỗi QuotaExceeded hoặc Private mode
  }
}

/**
 * Tìm kiếm phiên hỏi đáp theo ID câu hỏi
 */
export function findSessionByQuestionId(userId, questionId) {
  if (!questionId) return null;
  const sessions = getSessions(userId);
  return sessions.find(s => s.questionId === questionId) || null;
}

/**
 * Khởi tạo một phiên hỏi đáp Socratic mới
 */
export function createSession(userId, {
  questionId = null,
  questionLatex = null,
  skill = null,
  selectedWrong = null,
  correctOption = null,
  options = null,
  initialMessages = [],
  title = null
} = {}) {
  const sessions = getSessions(userId);
  const now = new Date().toISOString();

  const resolvedTitle = title || generateSessionTitle(questionLatex, skill);
  const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const newSession = {
    id: newId,
    title: resolvedTitle,
    skill: skill || null,
    questionId: questionId ? String(questionId) : null,
    questionLatex: questionLatex || null,
    selectedWrong: selectedWrong || null,
    correctOption: correctOption || null,
    options: options || null,
    messages: Array.isArray(initialMessages) ? initialMessages : [],
    createdAt: now,
    updatedAt: now,
    isSynced: false
  };

  const updatedSessions = [newSession, ...sessions];
  saveSessions(userId, updatedSessions);
  return newSession;
}

/**
 * Cập nhật tin nhắn và thời điểm hoạt động cho một phiên
 */
export function updateSessionMessages(userId, sessionId, messages) {
  if (!sessionId) return null;
  const sessions = getSessions(userId);
  const targetIdx = sessions.findIndex(s => s.id === sessionId);
  if (targetIdx === -1) return null;

  const now = new Date().toISOString();
  const existing = sessions[targetIdx];

  // Tự động cập nhật tiêu đề nếu phiên trước đó là tiêu đề mặc định và tin nhắn mới có nội dung câu hỏi
  let updatedTitle = existing.title;
  if (
    (!existing.title || existing.title === 'Phiên hỏi đáp Socratic' || existing.title.startsWith('Ôn tập:')) &&
    messages.length > 1
  ) {
    const firstUserMsg = messages.find(m => m.sender === 'user');
    if (firstUserMsg?.text) {
      updatedTitle = generateSessionTitle(firstUserMsg.text, existing.skill);
    }
  }

  const updatedSession = {
    ...existing,
    title: updatedTitle,
    messages: Array.isArray(messages) ? messages : existing.messages,
    updatedAt: now
  };

  sessions[targetIdx] = updatedSession;
  saveSessions(userId, sessions);
  return updatedSession;
}

/**
 * Xóa một phiên hỏi đáp
 */
export function deleteSession(userId, sessionId) {
  if (!sessionId) return false;
  const sessions = getSessions(userId);
  const filtered = sessions.filter(s => s.id !== sessionId);
  saveSessions(userId, filtered);
  return true;
}

/**
 * Xóa toàn bộ lịch sử phiên của học sinh
 */
export function clearAllSessions(userId) {
  try {
    localStorage.removeItem(getStorageKey(userId));
    return true;
  } catch {
    return false;
  }
}

/**
 * Đồng bộ hóa và gộp các tương tác từ Supabase Cloud API vào bộ lưu trữ cục bộ
 */
export function mergeCloudInteractions(userId, cloudInteractions = []) {
  if (!Array.isArray(cloudInteractions) || cloudInteractions.length === 0) {
    return getSessions(userId);
  }

  const localSessions = getSessions(userId);
  const existingIds = new Set(localSessions.map(s => s.id));
  const existingQuestionIds = new Set(
    localSessions.map(s => s.questionId).filter(Boolean)
  );

  const convertedSessions = [];

  for (const item of cloudInteractions) {
    const interactionId = item.id ? String(item.id) : null;
    const questionId = item.question_id ? String(item.question_id) : null;

    // Bỏ qua nếu đã tồn tại session tương ứng
    if (interactionId && existingIds.has(interactionId)) continue;
    if (interactionId && existingIds.has(`cloud_${interactionId}`)) continue;
    if (questionId && existingQuestionIds.has(questionId)) continue;

    // Chuyển đổi bảng ghi Cloud sang Session
    const rawTranscript = Array.isArray(item.ai_guidance_transcript)
      ? item.ai_guidance_transcript
      : [];

    const messages = rawTranscript.map((t, idx) => ({
      sender: t.role === 'user' ? 'user' : 'ai',
      text: t.text || (t.option ? `Em chọn phương án: ${t.option}` : ''),
      timestamp: formatSessionTime(item.created_at || new Date()),
      topicLabel: item.pattern_name || null,
      interactionId: interactionId
    }));

    if (messages.length === 0 && item.student_selected_option) {
      messages.push({
        sender: 'user',
        text: `Em làm bài tập câu ${questionId || ''} và chọn phương án ${item.student_selected_option}.`,
        timestamp: formatSessionTime(item.created_at || new Date()),
        interactionId: interactionId
      });
      messages.push({
        sender: 'ai',
        text: item.misconception_explanation || 'Thầy đã ghi nhận phản hồi và đang hỗ trợ em giải quyết câu hỏi này.',
        timestamp: formatSessionTime(item.created_at || new Date()),
        topicLabel: item.pattern_name || null,
        interactionId: interactionId
      });
    }

    const title = item.pattern_name || generateSessionTitle(item.core_theory_latex, 'Ôn tập ĐGNL');

    convertedSessions.push({
      id: interactionId ? `cloud_${interactionId}` : `cloud_q_${questionId}_${Date.now()}`,
      title: title,
      skill: item.pattern_name || 'Ôn tập ĐGNL',
      questionId: questionId,
      questionLatex: item.core_theory_latex || null,
      selectedWrong: item.student_selected_option || null,
      correctOption: item.correct_option || null,
      options: null,
      messages: messages,
      createdAt: item.created_at || new Date().toISOString(),
      updatedAt: item.created_at || new Date().toISOString(),
      isSynced: true
    });
  }

  if (convertedSessions.length > 0) {
    const merged = [...localSessions, ...convertedSessions].sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
    saveSessions(userId, merged);
    return merged;
  }

  return localSessions;
}

export const aiSessionManager = {
  getStorageKey,
  formatSessionTime,
  generateSessionTitle,
  getSessions,
  saveSessions,
  findSessionByQuestionId,
  createSession,
  updateSessionMessages,
  deleteSession,
  clearAllSessions,
  mergeCloudInteractions
};

export default aiSessionManager;

