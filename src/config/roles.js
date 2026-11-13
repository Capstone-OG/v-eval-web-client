// These names match Identity Service SystemRoles. Order determines the default
// workspace for accounts assigned more than one role.
export const ROLE_LABELS = {
  student: 'Học sinh', teacher: 'Giáo viên', manager: 'Quản lý đào tạo',
  director: 'Giám đốc chuyên môn', administrator: 'Quản trị hệ thống', parent: 'Phụ huynh',
  unknown: 'Chưa được cấp vai trò',
};

const ROLE_ALIASES = {
  ADMINISTRATOR: 'administrator', ADMIN: 'administrator',
  ACADEMIC_DIRECTOR: 'director', ACADEMICDIRECTOR: 'director',
  ACADEMIC_MANAGER: 'manager', ACADEMICMANAGER: 'manager', MANAGER: 'manager',
  TEACHER: 'teacher', GIAOVIEN: 'teacher', PARENT: 'parent', PHUHUYNH: 'parent', STUDENT: 'student',
};

export function resolveRole(user) {
  const raw = user?.roles ?? user?.role ?? [];
  const values = (Array.isArray(raw) ? raw : [raw]).map((role) =>
    String(typeof role === 'object' ? role?.roleName ?? role?.name ?? '' : role).trim().toUpperCase().replace(/[\s-]+/g, '_'));
  const assigned = values.map((value) => ROLE_ALIASES[value]);
  return ['administrator', 'director', 'manager', 'teacher', 'parent', 'student']
    .find((role) => assigned.includes(role)) || 'unknown';
}

export const ROLE_MENUS = {
  teacher: [
    ['dashboard', 'Tổng quan giảng dạy'], ['teaching_classes', 'Lớp phụ trách'],
    ['teaching_schedule', 'Lịch dạy & Live Q&A'], ['attendance', 'Điểm danh học sinh'],
    ['teaching_materials', 'Bài giảng & Học liệu'], ['student_progress', 'Tiến độ học sinh'],
  ],
  manager: [
    ['dashboard', 'Tổng quan đào tạo'], ['class_management', 'Quản lý lớp học'],
    ['teacher_assignment', 'Phân công giáo viên'], ['live_management', 'Xếp lịch Live Q&A'],
    ['clustering', 'Phân lớp chuyên đề'], ['training_reports', 'Báo cáo đào tạo'],
  ],
  director: [
    ['dashboard', 'Tổng quan chuyên môn'], ['curriculum', 'Khung chương trình'],
    ['materials', 'Bài giảng & Học liệu'], ['content_questions', 'Ngân hàng câu hỏi'],
    ['content_exams', 'Đề thi & Quiz'], ['content_review', 'Rà soát nội dung'],
  ],
  administrator: [
    ['dashboard', 'Tổng quan hệ thống'], ['users', 'Quản lý tài khoản'],
    ['user_roles', 'Vai trò & Phân quyền'], ['campuses', 'Quản lý cơ sở'],
    ['system_settings', 'Cấu hình hệ thống'],
  ],
  parent: [
    ['dashboard', 'Tổng quan học tập của con'], ['children', 'Liên kết học sinh'],
    ['child_progress', 'Tiến độ & Kết quả'], ['child_schedule', 'Lịch học của con'],
  ],
  unknown: [['dashboard', 'Thông tin quyền truy cập']],
};

export function canAccessTab(role, tab) {
  if (tab === 'settings') return true;
  if (role === 'student') return ['dashboard', 'diagnostic', 'roadmap', 'adaptive', 'question_bank', 'ai_tutor', 'live_qa', 'analytics'].includes(tab);
  return (ROLE_MENUS[role] || ROLE_MENUS.unknown).some(([id]) => id === tab);
}
