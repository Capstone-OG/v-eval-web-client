const LABELS = {
  STUDENT: 'Học sinh', PARENT: 'Phụ huynh', TEACHER: 'Giáo viên',
  ACADEMIC_MANAGER: 'Quản lý học vụ', ACADEMIC_DIRECTOR: 'Giám đốc học thuật',
  ADMINISTRATOR: 'Quản trị viên hệ thống', ADMIN: 'Quản trị viên hệ thống',
};

export function getAccountRoles(user) {
  const sources = [user?.roles, user?.roleNames, user?.roleName, user?.role];
  for (const source of sources) {
    const values = (Array.isArray(source) ? source : [source]).map(role =>
      String(typeof role === 'object' && role ? role.roleName ?? role.name ?? '' : role ?? '').trim().toUpperCase()
    ).filter(Boolean);
    if (values.length) return [...new Set(values)];
  }
  return [];
}

export function accountRoleLabel(user) {
  const roles = getAccountRoles(user);
  return roles.length ? roles.map(role => LABELS[role] || role).join(', ') : 'Chưa có thông tin vai trò';
}
