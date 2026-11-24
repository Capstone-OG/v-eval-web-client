export const trimText = value => typeof value === 'string' ? value.trim() : value;
export const normalizePhone = value => String(value ?? '').trim().replace(/[\s.-]/g, '');
export const isVietnamesePhone = value => /^(0|\+84)[35789][0-9]{8}$/.test(normalizePhone(value));
export const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim());

export function validateContact({ fullName, phone, email }, { requireEmail = false } = {}) {
  if (!String(fullName ?? '').trim()) return 'Họ và tên không được để trống.';
  if (String(fullName).trim().length > 150) return 'Họ và tên không được vượt quá 150 ký tự.';
  if (!normalizePhone(phone)) return 'Số điện thoại không được để trống.';
  if (!isVietnamesePhone(phone)) return 'Số điện thoại không hợp lệ. Nhập số Việt Nam dạng 0912345678 hoặc +84912345678.';
  if (requireEmail && !String(email ?? '').trim()) return 'Email không được để trống.';
  if (String(email ?? '').trim() && !isEmail(email)) return 'Địa chỉ email không hợp lệ.';
  return '';
}

// Normalize JSON only; credentials remain byte-for-byte unchanged.
export function normalizeFormPayload(value, key = '') {
  if (/password|token|secret|apiKey/i.test(key)) return value;
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(item => normalizeFormPayload(item, key));
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, normalizeFormPayload(item, name)]));
  }
  return value;
}

export function getFormFieldError(field) {
  if (field.disabled || field.readOnly || ['hidden', 'submit', 'button', 'reset', 'file', 'checkbox', 'radio'].includes(field.type)) return '';
  const value = String(field.value ?? '').trim();
  if (field.required && !value) return 'Vui lòng nhập đầy đủ trường bắt buộc; không dùng toàn khoảng trắng.';
  if (!value) return '';
  if (field.type === 'password') return '';
  if (field.type === 'tel' && !isVietnamesePhone(value)) return 'Số điện thoại không hợp lệ. Ví dụ: 0912345678 hoặc +84912345678.';
  if (field.type === 'email' && value !== 'admin' && !isEmail(value)) return 'Địa chỉ email không hợp lệ.';
  if (field.validity?.badInput || field.validity?.rangeUnderflow || field.validity?.rangeOverflow || field.validity?.stepMismatch || field.validity?.tooLong) return field.validationMessage || 'Giá trị nằm ngoài giới hạn cho phép.';
  return '';
}

export function prepareFormBody(body) {
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    const normalized = new FormData();
    for (const [key, value] of body.entries()) normalized.append(key, normalizeFormPayload(value, key));
    return normalized;
  }
  return JSON.stringify(normalizeFormPayload(body));
}
