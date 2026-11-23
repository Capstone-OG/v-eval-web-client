// Utility store for two-way communication between Parents and Teachers (TCH-04)
// Persists message threads across parent portal and teacher portal with reactive dispatch

const STORAGE_KEY = 'veval_parent_teacher_messages';
const EVENT_NAME = 'veval:parent-teacher-message';

export const parentTeacherMessagingStore = {
  getAllMessages() {
    try {
      if (typeof window === 'undefined') return [];
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  getMessagesForStudent(studentId) {
    if (!studentId) return [];
    const all = this.getAllMessages();
    return all.filter((m) => String(m.studentId) === String(studentId));
  },

  getMessagesForTeacher(teacherId = null) {
    const all = this.getAllMessages();
    if (!teacherId) return all;
    return all.filter((m) => !m.teacherId || String(m.teacherId) === String(teacherId));
  },

  getMessagesForAlert(alertId) {
    if (!alertId) return [];
    const all = this.getAllMessages();
    return all.filter((m) => String(m.alertId) === String(alertId));
  },

  getUnreadCountForTeacher(teacherId = null) {
    const messages = this.getMessagesForTeacher(teacherId);
    return messages.filter((m) => m.status === 'unread' || !m.reply).length;
  },

  sendMessage({
    studentId,
    studentName = 'Học sinh',
    parentName = 'Phụ huynh',
    parentId = null,
    teacherId = null,
    teacherName = 'Giảng viên phụ trách',
    alertId = null,
    alertTitle = null,
    content = ''
  }) {
    if (!content || !content.trim()) return null;

    const all = this.getAllMessages();
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      studentId: String(studentId),
      studentName,
      parentName,
      parentId: parentId ? String(parentId) : null,
      teacherId: teacherId ? String(teacherId) : null,
      teacherName,
      alertId: alertId ? String(alertId) : null,
      alertTitle: alertTitle || null,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      status: 'unread',
      reply: null
    };

    const updated = [newMessage, ...all];
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { type: 'NEW_MESSAGE', message: newMessage } }));
      }
    } catch (e) {
      console.warn('[parentTeacherMessagingStore] Failed to save message:', e);
    }

    return newMessage;
  },

  replyToMessage(messageId, { text, teacherName = 'Giảng viên phụ trách', teacherId = null }) {
    if (!messageId || !text || !text.trim()) return null;

    const all = this.getAllMessages();
    let repliedMsg = null;

    const updated = all.map((m) => {
      if (String(m.id) === String(messageId)) {
        repliedMsg = {
          ...m,
          status: 'replied',
          reply: {
            text: text.trim(),
            teacherName,
            teacherId: teacherId ? String(teacherId) : m.teacherId,
            repliedAt: new Date().toISOString()
          }
        };
        return repliedMsg;
      }
      return m;
    });

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { type: 'MESSAGE_REPLIED', message: repliedMsg } }));
      }
    } catch (e) {
      console.warn('[parentTeacherMessagingStore] Failed to reply message:', e);
    }

    return repliedMsg;
  },

  subscribe(callback) {
    if (typeof window === 'undefined' || typeof callback !== 'function') {
      return () => {};
    }
    const handler = (e) => callback(e.detail);
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }
};

export default parentTeacherMessagingStore;
