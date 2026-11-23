const sameId = (a, b) => Boolean(a && b) && String(a).toLowerCase() === String(b).toLowerCase();

export function studentOfflineSessions(timetable, studentId, readPlan, remedialSessions = []) {
  const classes = timetable?.enrolledClasses || [];
  const sessions = (timetable?.sessions || []).map((session) => {
    const plan = readPlan(session.sessionId);
    const topics = (plan?.part1?.focusTopics || []).map((topic) => topic.skillName).filter(Boolean);
    const group = (plan?.part2?.microGroups || []).find((item) =>
      (item.students || []).some((student) => sameId(student.id || student.studentId, studentId)));
    return {
      ...session,
      // Curriculum titles are not evidence of a teacher-assigned offline plan.
      topicTitle: topics.join(' · ') || 'Chờ giảng viên giao chuyên đề chữa đề / sửa lỗi',
      teacherName: session.teacherName || session.primaryTeacherName || '',
      microGroupName: group?.tableName || session.microGroupName || '',
      groupFocus: group?.focusWeakness || '',
      assignedWorksheetTitle: group?.worksheet?.isDistributed ? group.worksheet.title : session.assignedWorksheetTitle,
      preparationNote: plan?.part1?.preClassPreparationNote || '',
      hasTeacherPlan: topics.length > 0
    };
  });
  for (const item of remedialSessions) {
    const cls = classes.find((entry) => sameId(entry.classId, item.classId));
    const members = item.members || item.students || [];
    if (!cls || !members.some((member) => sameId(member.studentId || member.id, studentId))) continue;
    if (sessions.some((session) => session.sessionId === item.id)) continue;
    sessions.push({
      ...cls, sessionId: item.id, sessionNo: 'Phụ đạo', sessionDate: item.sessionDate,
      startTime: item.startTime || item.timeSlot?.split(' - ')[0] || '',
      endTime: item.endTime || item.timeSlot?.split(' - ')[1] || '',
      room: item.room || '', teacherName: item.teacherName || '',
      topicTitle: item.focusSkill || item.topic || 'Chờ giảng viên giao chuyên đề phụ đạo',
      microGroupName: item.groupName || item.groupId || '', groupFocus: item.focusSkill || '',
      skillId: item.focusSkillId || null, skillName: item.focusSkill || '',
      status: item.status || 'SCHEDULED', attendanceStatus: 'NOT_RECORDED', isRemedial: true
    });
  }
  return sessions;
}
