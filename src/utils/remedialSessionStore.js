/**
 * remedialSessionStore.js
 * Quản lý lịch học nhóm phụ đạo / bồi dưỡng vi mô (Remedial Study Sessions)
 * Phục vụ mô hình kèm cặp học sinh có cùng điểm trũng kiến thức (Offline tại lớp hoặc Live Q&A)
 */

const STORAGE_PREFIX = 'veval_remedial_sessions_';

export function getRemedialSessions(classId) {
  if (!classId) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${classId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[remedialSessionStore] Error reading remedial sessions:', err.message);
    return [];
  }
}

export function getRemedialSessionByGroup(classId, groupId) {
  if (!classId || !groupId) return null;
  const sessions = getRemedialSessions(classId);
  return sessions.find(s => s.groupId === groupId) || null;
}

export function saveRemedialSession(classId, sessionData) {
  if (!classId || !sessionData) return null;
  try {
    const existing = getRemedialSessions(classId);
    const newSession = {
      ...sessionData,
      id: sessionData.id || `RS-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      classId,
      createdAt: new Date().toISOString()
    };
    // Thay thế session cũ của nhóm này nếu đã có, hoặc thêm mới
    const updated = [newSession, ...existing.filter(s => s.groupId !== sessionData.groupId)];
    localStorage.setItem(`${STORAGE_PREFIX}${classId}`, JSON.stringify(updated));

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('veval:remedial-session-scheduled', {
          detail: { classId, session: newSession }
        })
      );
    }
    return newSession;
  } catch (err) {
    console.error('[remedialSessionStore] Error saving remedial session:', err);
    return null;
  }
}

export function deleteRemedialSession(classId, sessionId) {
  if (!classId || !sessionId) return;
  try {
    const existing = getRemedialSessions(classId);
    const updated = existing.filter(s => s.id !== sessionId);
    localStorage.setItem(`${STORAGE_PREFIX}${classId}`, JSON.stringify(updated));
  } catch (err) {
    console.warn('[remedialSessionStore] Error deleting remedial session:', err.message);
  }
}
