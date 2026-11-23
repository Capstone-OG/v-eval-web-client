import { normalizePhone, validateContact } from './formValidation.js';

export const PROVISIONING_FIELDS = {
  TEACHER: { campus: true, specialty: true, nameLabel: 'Họ và tên giáo viên', campusLabel: 'Cơ sở công tác' },
  ACADEMIC_MANAGER: { campus: true, specialty: false, nameLabel: 'Họ và tên quản lý', campusLabel: 'Cơ sở phụ trách' },
  STUDENT: { campus: true, specialty: false, nameLabel: 'Họ và tên học sinh', campusLabel: 'Cơ sở theo học' },
  PARENT: { campus: false, specialty: false, nameLabel: 'Họ và tên phụ huynh', note: 'Phụ huynh liên kết với học sinh sau khi được cấp tài khoản; không cần chọn cơ sở hay bộ môn.' },
  ACADEMIC_DIRECTOR: { campus: false, specialty: false, nameLabel: 'Họ và tên giám đốc học thuật', note: 'Vai trò quản lý chuyên môn toàn hệ thống, không gắn với một cơ sở hoặc bộ môn giảng dạy.' },
  ADMINISTRATOR: { campus: false, specialty: false, nameLabel: 'Họ và tên quản trị viên', note: 'Vai trò quản trị toàn hệ thống, không cần chọn cơ sở hoặc bộ môn.' },
};

export function buildProvisioningPayload(data) {
  const roleName = String(data.roleName || '').trim().toUpperCase();
  const fields = PROVISIONING_FIELDS[roleName];
  if (!fields) throw new Error('Vui lòng chọn vai trò hợp lệ.');
  const contactError = validateContact(data, { requireEmail: true });
  if (contactError) throw new Error(contactError);
  if (!String(data.password || '').trim()) throw new Error('Mật khẩu không được để trống.');
  if (data.password !== data.password.trim()) throw new Error('Mật khẩu không được có khoảng trắng ở đầu hoặc cuối.');
  if (data.password.length < 8 || !/[A-Z]/.test(data.password) || !/[a-z]/.test(data.password) || !/[0-9]/.test(data.password)) throw new Error('Mật khẩu cần ít nhất 8 ký tự, có chữ hoa, chữ thường và chữ số.');
  if (fields.campus && !String(data.campusId || '').trim()) throw new Error('Vui lòng chọn cơ sở cho vai trò này.');
  if (fields.specialty && !String(data.specialty || '').trim()) throw new Error('Vui lòng chọn bộ môn / chuyên môn cho giáo viên.');
  return {
    fullName: data.fullName.trim(), email: data.email.trim().toLowerCase(), phone: normalizePhone(data.phone),
    password: data.password, roleName,
    campusId: fields.campus ? data.campusId.trim() : null,
    specialty: fields.specialty ? data.specialty.trim() : null,
  };
}
