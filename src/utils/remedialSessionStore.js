/**
 * remedialSessionStore.js
 * Quản lý lịch học nhóm phụ đạo / bồi dưỡng vi mô (Remedial Study Sessions)
 * Phục vụ mô hình kèm cặp học sinh có cùng điểm trũng kiến thức (Offline tại lớp hoặc Live Q&A)
 * Đồng bộ hai chiều với Thời Khóa Biểu Giảng Viên & Học Sinh theo 6 Slot học chuẩn
 */

const STORAGE_PREFIX = 'veval_remedial_sessions_';

// 6 Slot học chuẩn hóa đồng bộ 100% với Thời Khóa Biểu hệ thống V-Eval
export const STANDARD_ACADEMIC_SLOTS = [
  { slot: 1, label: 'Slot 1', timeRange: '07:30 - 09:30', period: 'Sáng', startTime: '07:30', endTime: '09:30' },
  { slot: 2, label: 'Slot 2', timeRange: '09:45 - 11:45', period: 'Sáng', startTime: '09:45', endTime: '11:45' },
  { slot: 3, label: 'Slot 3', timeRange: '13:00 - 15:00', period: 'Chiều', startTime: '13:00', endTime: '15:00' },
  { slot: 4, label: 'Slot 4', timeRange: '15:15 - 17:15', period: 'Chiều', startTime: '15:15', endTime: '17:15' },
  { slot: 5, label: 'Slot 5', timeRange: '18:00 - 20:00', period: 'Tối', startTime: '18:00', endTime: '20:00' },
  { slot: 6, label: 'Slot 6', timeRange: '20:15 - 22:30', period: 'Tối', startTime: '20:15', endTime: '22:30' }
];

export function getAllRemedialSessions() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const all = [];
    const keys = [];
    if (typeof localStorage.length === 'number' && typeof localStorage.key === 'function') {
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
    } else {
      keys.push(...Object.keys(localStorage));
    }

    for (const key of keys) {
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) all.push(...parsed);
        }
      }
    }
    return all;
  } catch (err) {
    console.warn('[remedialSessionStore] Error reading all remedial sessions:', err.message);
    return [];
  }
}

export function getRemedialSessions(classId) {
  if (!classId) return [];
  if (classId === 'ALL') return getAllRemedialSessions();
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${classId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[remedialSessionStore] Error reading remedial sessions:', err.message);
    return [];
  }
}

export function getRemedialSessionByGroup(classId, groupId, topic = null) {
  if (!classId || !groupId) return null;
  const sessions = getRemedialSessions(classId);
  return sessions.find(s => {
    if (s.groupId !== groupId) return false;
    if (topic && s.topic && s.topic !== topic && s.focusSkill !== topic) return false;
    return true;
  }) || null;
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
    // Thay thế session cũ của đúng nhóm bàn này nếu đã có, hoặc thêm mới
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

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('veval:remedial-session-deleted', {
          detail: { classId, sessionId }
        })
      );
    }
  } catch (err) {
    console.warn('[remedialSessionStore] Error deleting remedial session:', err.message);
  }
}
