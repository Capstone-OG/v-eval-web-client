export function accountRoleLabel(role, user) {
  const roles = (user?.roles || []).map((value) => String(value).toUpperCase());
  if (role === 'manager' && roles.includes('ACADEMIC_DIRECTOR')) return 'Giám đốc học thuật';
  return { student: 'Học viên', parent: 'Phụ huynh', teacher: 'Thầy/cô',
    manager: 'Quản lý học thuật', admin: 'Quản trị viên' }[role] || 'Thành viên';
}

export function accountGreeting(role, user) {
  const name = user?.fullName?.trim();
  const label = accountRoleLabel(role, user).toLocaleLowerCase('vi');
  return name ? `Chào ${label} ${name}!` : `Chào ${label}!`;
}
