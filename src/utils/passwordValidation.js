export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  const errors = {};
  if (!currentPassword) errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
  if (!newPassword) errors.newPassword = 'Vui lòng nhập mật khẩu mới.';
  else if (newPassword === currentPassword) errors.newPassword = 'Mật khẩu mới không được trùng với mật khẩu hiện tại.';
  else {
    const missing = [];
    if (newPassword.length < 8) missing.push('ít nhất 8 ký tự');
    if (!/[A-Z]/.test(newPassword)) missing.push('1 chữ hoa');
    if (!/[a-z]/.test(newPassword)) missing.push('1 chữ thường');
    if (!/[0-9]/.test(newPassword)) missing.push('1 chữ số');
    if (missing.length) errors.newPassword = `Mật khẩu mới cần ${missing.join(', ')}.`;
  }
  if (!confirmPassword) errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
  else if (confirmPassword !== newPassword) errors.confirmPassword = 'Mật khẩu xác nhận chưa khớp với mật khẩu mới.';
  return errors;
}

export function passwordApiFieldErrors(data, message) {
  const errors = {};
  const code = data?.error?.code || data?.code || data?.title;
  if (code === 'User.InvalidCurrentPassword') errors.currentPassword = message;
  if (code === 'User.SamePassword') errors.newPassword = message;
  if (data?.errors && !Array.isArray(data.errors)) {
    for (const field of ['currentPassword', 'newPassword', 'confirmPassword']) {
      const key = Object.keys(data.errors).find((key) => key.toLowerCase() === field.toLowerCase());
      const value = key && data.errors[key];
      if (value) errors[field] = Array.isArray(value) ? value.join(' ') : String(value);
    }
  }
  return errors;
}
