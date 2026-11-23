const STORAGE_KEY = 'veval_flagged_questions_v1';

export const FLAG_REASONS = [
  { code: 'WRONG_DOMAIN', label: 'Sai môn / lạc miền kiến thức' },
  { code: 'WRONG_ANSWER', label: 'Sai đáp án hoặc lời giải' },
  { code: 'RENDER_BUG', label: 'Lỗi công thức / hiển thị' },
  { code: 'UNCLEAR', label: 'Nội dung câu hỏi chưa rõ ràng' }
];

function safeRead() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(list) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('veval:question-flags-updated', { detail: { count: list.length } }));
  } catch {
    // ignore storage quota errors
  }
}

export function getFlaggedQuestions() {
  return safeRead();
}

export function getFlaggedQuestionIdSet() {
  return new Set(
    safeRead()
      .filter((f) => f.status === 'PENDING' || f.status === 'DELETED')
      .map((f) => String(f.questionId || ''))
      .filter(Boolean)
  );
}

export function getPendingFlagCount() {
  return safeRead().filter((f) => f.status === 'PENDING').length;
}

export function addFlaggedQuestion({
  questionId,
  skillId = '',
  skillName = '',
  subjectName = '',
  questionContent = '',
  options = [],
  correctOption = '',
  explanation = '',
  difficultyLevel = 2,
  reasonCode = 'WRONG_DOMAIN',
  note = '',
  sourcePage = 'Học tập',
  reportedBy = 'Học sinh'
}) {
  const list = safeRead();
  const reasonObj = FLAG_REASONS.find((r) => r.code === reasonCode) || FLAG_REASONS[0];
  const entry = {
    flagId: `flag_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    questionId: String(questionId || ''),
    skillId: String(skillId || ''),
    skillName: skillName || 'Chưa rõ chuyên đề',
    subjectName: subjectName || 'Tổng hợp',
    questionContent: String(questionContent || ''),
    options: Array.isArray(options) ? options : [],
    correctOption: String(correctOption || ''),
    explanation: String(explanation || ''),
    difficultyLevel: Number(difficultyLevel || 2),
    reasonCode: reasonObj.code,
    reasonLabel: reasonObj.label,
    note: String(note || '').trim(),
    sourcePage,
    reportedBy,
    reportedAt: new Date().toISOString(),
    status: 'PENDING', // 'PENDING' | 'REASSIGNED' | 'DELETED' | 'KEPT'
    resolutionNote: '',
    resolvedBy: '',
    resolvedAt: null
  };
  safeWrite([entry, ...list]);
  return entry;
}

export function resolveFlaggedQuestion(flagId, { status, resolutionNote = '', resolvedBy = 'Giảng viên', newSkillName = '' }) {
  const list = safeRead().map((item) =>
    item.flagId === flagId
      ? {
          ...item,
          status,
          resolutionNote: resolutionNote || (newSkillName ? `Đã chuyển sang: ${newSkillName}` : ''),
          resolvedBy,
          resolvedAt: new Date().toISOString()
        }
      : item
  );
  safeWrite(list);
  return list;
}
