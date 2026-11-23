/**
 * offlineSessionStore.js
 * Quản lý kế hoạch buổi học Offline (Mô hình Lớp học đảo ngược 2 phần)
 * - Phần 1: Chữa đề chung cả lớp (Nửa đầu buổi, bám sát các kỹ năng yếu của lớp)
 * - Phần 2: Phụ đạo Nhóm nhỏ 3 - 5 HS tại bàn (Nửa sau buổi, phân bổ học sinh thật kèm phiếu bài tập)
 * - Nguyên tắc: Giảng viên tự quyết 100% nội dung cho buổi đã có lịch (Không cần Director duyệt)
 */

const STORAGE_PREFIX = 'veval_offline_session_plan_';

/**
 * Kiểm tra xem kế hoạch đã lưu có khớp với danh sách học sinh thực tế của lớp hay không
 */
export function hasMatchingRoster(plan, realStudents = []) {
  if (!plan || !plan.part2 || !Array.isArray(plan.part2.microGroups)) return false;
  if (!Array.isArray(realStudents) || realStudents.length === 0) return true;

  const planStudentIds = new Set(
    plan.part2.microGroups.flatMap((g) => (g.students || []).map((s) => s.id))
  );

  if (planStudentIds.size === 0) return false;
  return realStudents.every((s) => planStudentIds.has(s.id));
}

/**
 * Lấy kế hoạch chuẩn bị buổi học Offline từ LocalStorage
 * Tự động đồng bộ lại nếu bộ nhớ đệm chưa có học sinh thực tế của lớp
 */
export function getOfflineSessionPlan(sessionId, fallbackSession = null, realStudents = [], focusSkills = []) {
  if (!sessionId) return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${sessionId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (hasMatchingRoster(parsed, realStudents)) {
        return parsed;
      }
      localStorage.removeItem(`${STORAGE_PREFIX}${sessionId}`);
    }
  } catch (err) {
    console.warn('[offlineSessionStore] Error reading session plan:', err.message);
  }

  if (fallbackSession) {
    return generateDefaultSessionPlan(fallbackSession, realStudents, focusSkills);
  }
  return null;
}

/**
 * Lưu kế hoạch chuẩn bị buổi học Offline
 */
export function saveOfflineSessionPlan(sessionId, planData) {
  if (!sessionId || !planData) return null;
  try {
    const updatedPlan = {
      ...planData,
      sessionId,
      updatedAt: new Date().toISOString(),
      status: 'PREPARED'
    };
    localStorage.setItem(`${STORAGE_PREFIX}${sessionId}`, JSON.stringify(updatedPlan));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('veval:offline-session-updated', {
          detail: { sessionId, plan: updatedPlan }
        })
      );
    }
    return updatedPlan;
  } catch (err) {
    console.error('[offlineSessionStore] Error saving session plan:', err);
    return null;
  }
}

/**
 * Xóa kế hoạch chuẩn bị buổi học khỏi LocalStorage
 */
export function clearOfflineSessionPlan(sessionId) {
  if (!sessionId) return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${sessionId}`);
  } catch (err) {
    console.warn('[offlineSessionStore] Error clearing session plan:', err.message);
  }
}

/**
 * Xây dựng danh sách chuyên đề chữa bài từ các kỹ năng yếu của lớp
 */
export function buildFocusTopicsFromSkills(focusSkills = [], fallbackTitle = '') {
  if (Array.isArray(focusSkills) && focusSkills.length > 0) {
    const sorted = focusSkills.slice().sort((a, b) => {
      const pltA = a.classAveragePlt ?? a.ClassAveragePlt ?? a.averagePlt ?? 0.5;
      const pltB = b.classAveragePlt ?? b.ClassAveragePlt ?? b.averagePlt ?? 0.5;
      return pltA - pltB;
    });

    return sorted.slice(0, 2).map((col, idx) => {
      const skillName = col.skillName || col.SkillName || col.name || col.title || `Chuyên đề ${idx + 1}`;
      const rawPlt = col.classAveragePlt ?? col.ClassAveragePlt ?? col.averagePlt ?? col.AveragePlt ?? col.plt;
      const mastery = Math.round(rawPlt != null ? (rawPlt <= 1 ? rawPlt * 100 : rawPlt) : 50);
      const errorRatePct = Math.max(0, 100 - mastery);
      return {
        id: col.skillId || col.SkillId || col.id || `TOPIC-0${idx + 1}`,
        skillName,
        errorRatePct
      };
    });
  }

  if (fallbackTitle) {
    return [
      {
        id: 'TOPIC-01',
        skillName: fallbackTitle,
        errorRatePct: 50
      }
    ];
  }

  return [];
}

/**
 * Xây dựng danh sách bàn học vi mô (3 - 5 học sinh / bàn) từ danh sách học sinh thật
 */
export function buildMicroGroupsFromStudents(realStudents = [], focusSkills = []) {
  if (!Array.isArray(realStudents) || realStudents.length === 0) {
    return [];
  }

  const sortedSkills = Array.isArray(focusSkills)
    ? focusSkills.slice().sort((a, b) => {
        const pltA = a.classAveragePlt ?? a.ClassAveragePlt ?? a.averagePlt ?? 0.5;
        const pltB = b.classAveragePlt ?? b.ClassAveragePlt ?? b.averagePlt ?? 0.5;
        return pltA - pltB;
      })
    : [];

  const skill1 = sortedSkills[0]?.skillName || sortedSkills[0]?.SkillName || sortedSkills[0]?.name || 'Củng cố kiến thức trọng tâm';
  const skill2 = sortedSkills[1]?.skillName || sortedSkills[1]?.SkillName || sortedSkills[1]?.name || 'Kỹ thuật loại trừ phương án nhiễu';

  const half = Math.ceil(realStudents.length / 2);
  const g1 = realStudents.slice(0, half);
  const g2 = realStudents.slice(half);

  const groups = [];

  if (g1.length > 0) {
    groups.push({
      groupId: 'TABLE-01',
      tableName: 'Bàn 1',
      focusWeakness: skill1,
      studentCount: g1.length,
      students: g1.map((st) => ({
        id: st.id || st.studentId,
        name: st.name || st.studentName || 'Học sinh',
        currentScore: st.currentScore || (st.overallMastery != null ? `${Math.round(st.overallMastery * 100)}%` : '0%')
      })),
      worksheet: {
        code: 'BT-01',
        title: `Phiếu bài tập: 5 câu ${skill1}`,
        questionCount: 5,
        isDistributed: true
      }
    });
  }

  if (g2.length > 0) {
    groups.push({
      groupId: 'TABLE-02',
      tableName: 'Bàn 2',
      focusWeakness: skill2,
      studentCount: g2.length,
      students: g2.map((st) => ({
        id: st.id || st.studentId,
        name: st.name || st.studentName || 'Học sinh',
        currentScore: st.currentScore || (st.overallMastery != null ? `${Math.round(st.overallMastery * 100)}%` : '0%')
      })),
      worksheet: {
        code: 'BT-02',
        title: `Phiếu bài tập: 5 câu ${skill2}`,
        questionCount: 5,
        isDistributed: true
      }
    });
  }

  return groups;
}

/**
 * Tạo cấu trúc ban đầu cho buổi học dựa trên danh sách học sinh thật của lớp
 */
export function generateDefaultSessionPlan(session, realStudents = [], focusSkills = []) {
  const sessionId = session.sessionId || session.id;
  const topicTitle = session.topicTitle || session.skillName || '';
  const focusTopics = buildFocusTopicsFromSkills(focusSkills, topicTitle);
  const microGroups = buildMicroGroupsFromStudents(realStudents, focusSkills);

  return {
    sessionId,
    classId: session.classId,
    sessionNo: session.sessionNo || 1,
    sessionDate: session.sessionDate || '',
    status: 'PREPARED',
    isFlippedOffline: true,
    selfDeterminedByTeacher: true,

    // PHẦN 1: Chữa bài chung cả lớp
    part1: {
      title: 'Chữa bài chung cả lớp',
      durationMinutes: 50,
      focusTopics,
      preClassPreparationNote: 'Học sinh xem lại các câu làm sai trong Sổ tay lỗi sai trước khi vào lớp để cùng chữa bài.'
    },

    // PHẦN 2: Học tập theo nhóm tại bàn
    part2: {
      title: 'Nhóm học tập tại bàn',
      durationMinutes: 50,
      totalGroups: microGroups.length,
      microGroups
    },

    updatedAt: new Date().toISOString()
  };
}

