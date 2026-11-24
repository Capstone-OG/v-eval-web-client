/**
 * aiTutorScoping.js
 * Scopes AI Tutor interactions strictly to a teacher's assigned classes and students.
 * Prevents teachers from viewing unassigned classes or system-wide chat sessions.
 */

export function scopeInteractions({
  interactions = [],
  isTeacher = false,
  selectedClassId = '',
  selectedClassName = '',
  classStudentIds = null,
  teacherClasses = []
}) {
  if (!Array.isArray(interactions)) return [];

  // Academic Director: if a specific class is selected, filter by it; otherwise return all
  if (!isTeacher) {
    if (selectedClassId && selectedClassId !== 'all') {
      const targetId = String(selectedClassId).toLowerCase();
      const targetName = String(selectedClassName || '').toLowerCase();
      return interactions.filter((item) => {
        const itemClassId = String(item.class_id || item.classId || '').toLowerCase();
        const itemClassName = String(item.class_name || item.className || '').toLowerCase();
        return itemClassId === targetId || (targetName && itemClassName === targetName);
      });
    }
    return interactions;
  }

  // Teacher role: strictly scope to assigned classes and students
  if (!selectedClassId && teacherClasses.length === 0) {
    return [];
  }

  const targetClassId = String(selectedClassId || '').toLowerCase();
  const targetClassName = String(selectedClassName || '').toLowerCase();

  // Normalized set of student IDs belonging to the active class
  const studentIdSet = classStudentIds
    ? new Set(
        (Array.isArray(classStudentIds) ? classStudentIds : Array.from(classStudentIds))
          .map((id) => String(id || '').toLowerCase())
          .filter(Boolean)
      )
    : null;

  return interactions.filter((item) => {
    const itemClassId = String(item.class_id || item.classId || '').toLowerCase();
    const itemClassName = String(item.class_name || item.className || '').toLowerCase();
    const itemStudentId = String(item.student_id || item.studentId || '').toLowerCase();

    // 1. If student roster is known for this class, verify student belongs to this class
    if (studentIdSet && studentIdSet.size > 0) {
      if (studentIdSet.has(itemStudentId)) {
        return true;
      }
    }

    // 2. Class match
    if (targetClassId && targetClassId !== 'all' && itemClassId === targetClassId) {
      return true;
    }
    if (targetClassName && targetClassName !== 'all' && itemClassName === targetClassName) {
      return true;
    }

    return false;
  });
}

