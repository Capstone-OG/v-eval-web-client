/**
 * Bộ kiểm tra tính hợp lệ thực tế của địa chỉ Email (Multi-layer Email Validator):
 * 1. Cú pháp chuẩn RFC 5322 & cấu trúc TLD quốc tế
 * 2. Phát hiện lỗi gõ sai tên miền phổ biến (gmial.com, gamil.com, gmail.con...) kèm gợi ý sửa
 * 3. Chặn dịch vụ email ảo / dùng 1 lần (Disposable Email: yopmail, mailinator, tempmail...)
 * 4. Quy tắc chuẩn của Google Gmail (6-30 ký tự, chỉ chữ/số/dấu chấm, không chỉ gồm chữ số)
 * 5. Chống email giả mạo gõ phím lặp bất thường (ví dụ: '22222', '1111', 'aaaa', 'test', '123456')
 * 6. Kiểm tra trực tuyến bản ghi máy chủ nhận thư DNS MX (Mail Exchange) & trạng thái tồn tại trong CSDL
 */

const STRICT_EMAIL_REGEX =
  /^[a-zA-Z0-9]+([._+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*(\.[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)*\.[a-zA-Z]{2,10}$/;

const GMAIL_LOCAL_REGEX = /^[a-zA-Z0-9.]+$/;
const REPETITIVE_CHARS_REGEX = /(.)\1{3,}/i;
const ONLY_DIGITS_REGEX = /^\d+$/;

const COMMON_DOMAIN_TYPOS = {
  'gmial.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.vn': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmail.om': 'gmail.com',
  'gmail.net': 'gmail.com',
  'gmail.org': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outllook.com': 'outlook.com',
  'outlook.con': 'outlook.com',
  'icloud.con': 'icloud.com',
  'iclod.com': 'icloud.com',
  'fpt.edu.v': 'fpt.edu.vn',
  'fpt.edu.cm': 'fpt.edu.vn',
  'fe.edu.v': 'fe.edu.vn'
};

const DISPOSABLE_DOMAINS = new Set([
  'yopmail.com',
  'mailinator.com',
  '10minutemail.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'trashmail.com',
  'sharklasers.com',
  'getnada.com',
  'maildrop.cc',
  'dispostable.com',
  'fakeinbox.com',
  'throwawaymail.com',
  'mohmal.com',
  'mailnesia.com',
  'emailondeck.com',
  'tempmailo.com',
  'burnermail.io',
  'example.com',
  'localhost',
  'invalid.com',
  'fake.com'
]);

const BLOCKED_FAKE_LOCAL_PARTS = new Set([
  'test',
  'testing',
  'tester',
  'abc',
  'abcd',
  'abcde',
  'abcdef',
  '123',
  '1234',
  '12345',
  '123456',
  '1234567',
  '12345678',
  '123456789',
  'qwerty',
  'qwertyuiop',
  'asdf',
  'asdfgh',
  'asdfghjkl',
  'zxcvbn',
  'fake',
  'fakeemail',
  'none',
  'null',
  'khongco',
  'demo'
]);

export function validateEmailSyntaxAndRules(rawEmail) {
  if (!rawEmail || !String(rawEmail).trim()) {
    return {
      isValid: false,
      message: 'Vui lòng nhập địa chỉ Email.',
      email: '',
      domain: ''
    };
  }

  const email = String(rawEmail).trim().toLowerCase();

  if (email.length > 150) {
    return {
      isValid: false,
      message: 'Địa chỉ Email không được vượt quá 150 ký tự.',
      email,
      domain: ''
    };
  }

  if (/\s/.test(email)) {
    return {
      isValid: false,
      message: 'Địa chỉ Email không được chứa khoảng trắng.',
      email,
      domain: ''
    };
  }

  const parts = email.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return {
      isValid: false,
      message: 'Email không đúng định dạng (ví dụ: hoten@gmail.com).',
      email,
      domain: ''
    };
  }

  const [localPart, domain] = parts;

  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return {
      isValid: false,
      message:
        'Phần tên tài khoản trước dấu "@" không được bắt đầu/kết thúc bằng dấu chấm hoặc có 2 dấu chấm liên tiếp.',
      email,
      domain
    };
  }

  if (COMMON_DOMAIN_TYPOS[domain]) {
    const suggestedDomain = COMMON_DOMAIN_TYPOS[domain];
    const suggestedEmail = `${localPart}@${suggestedDomain}`;
    return {
      isValid: false,
      message: `Tên miền "@${domain}" không tồn tại (sai chính tả). Ý của bạn có phải là "${suggestedEmail}"?`,
      email,
      domain,
      suggestedEmail
    };
  }

  if (!STRICT_EMAIL_REGEX.test(email)) {
    return {
      isValid: false,
      message: 'Định dạng Email không hợp lệ (ví dụ: hoten@gmail.com).',
      email,
      domain
    };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      message: `Hệ thống không chấp nhận dịch vụ email ảo/tạm thời ("@${domain}"). Vui lòng sử dụng email cá nhân hoặc trường học thật.`,
      email,
      domain
    };
  }

  const cleanLocal = localPart.replace(/\./g, '');

  if (BLOCKED_FAKE_LOCAL_PARTS.has(cleanLocal)) {
    return {
      isValid: false,
      message:
        'Địa chỉ Email thử nghiệm hoặc giả lập không hợp lệ. Vui lòng nhập địa chỉ Email thật của bạn.',
      email,
      domain
    };
  }

  const repeatMatch = cleanLocal.match(REPETITIVE_CHARS_REGEX);
  if (repeatMatch) {
    return {
      isValid: false,
      message: `Địa chỉ Email không hợp lệ: Phát hiện chuỗi ký tự lặp bất thường ("${repeatMatch[0]}"). Vui lòng nhập đúng địa chỉ Email thật đang sử dụng.`,
      email,
      domain
    };
  }

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    if (!GMAIL_LOCAL_REGEX.test(localPart)) {
      return {
        isValid: false,
        message: 'Tài khoản Gmail chỉ được phép chứa chữ cái (a-z), chữ số (0-9) và dấu chấm (.).',
        email,
        domain
      };
    }

    if (cleanLocal.length < 6 || cleanLocal.length > 30) {
      return {
        isValid: false,
        message:
          'Tài khoản Gmail hợp lệ phải có độ dài tên người dùng từ 6 đến 30 ký tự (không tính dấu chấm).',
        email,
        domain
      };
    }

    if (ONLY_DIGITS_REGEX.test(cleanLocal)) {
      return {
        isValid: false,
        message:
          'Tài khoản Gmail không hợp lệ (không thể chỉ bao gồm toàn chữ số). Vui lòng nhập Gmail thật của bạn.',
        email,
        domain
      };
    }
  }

  return {
    isValid: true,
    message: 'Cú pháp Email hợp lệ.',
    email,
    domain
  };
}

export async function verifyEmailDnsMxAsync(domain) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { hasMx: true, message: null };
    }

    const data = await res.json();
    if (data.Status === 3) {
      return {
        hasMx: false,
        message: `Tên miền email "@${domain}" không tồn tại trên hệ thống tên miền quốc tế (DNS NXDOMAIN).`
      };
    }
    if (data.Status !== 0) {
      return {
        hasMx: false,
        message: `Không thể xác minh máy chủ nhận thư của tên miền "@${domain}".`
      };
    }

    const answers = Array.isArray(data.Answer) ? data.Answer : [];
    const validMx = answers.some(
      (r) => r.type === 15 && r.data && String(r.data).trim() !== '0 .'
    );

    if (!validMx) {
      return {
        hasMx: false,
        message: `Tên miền "@${domain}" không có máy chủ nhận thư (MX Record). Vui lòng nhập email thật có thể nhận mã OTP.`
      };
    }

    return { hasMx: true, message: null };
  } catch {
    return { hasMx: true, message: null };
  }
}

export async function validateEmailComprehensive(rawEmail, backendValidateFn) {
  const syncResult = validateEmailSyntaxAndRules(rawEmail);
  if (!syncResult.isValid) {
    return syncResult;
  }

  // 1. Ưu tiên gọi Backend API (/api/auth/validate-email) để kiểm tra cả DNS MX và trùng lặp tài khoản trong DB
  if (typeof backendValidateFn === 'function') {
    try {
      const beRes = await backendValidateFn(syncResult.email);
      if (beRes && typeof beRes.isValid === 'boolean') {
        return {
          isValid: beRes.isValid && beRes.isAvailable !== false,
          hasMxRecord: Boolean(beRes.hasMxRecord),
          isAvailable: beRes.isAvailable !== false,
          email: beRes.email || syncResult.email,
          domain: beRes.domain || syncResult.domain,
          message:
            beRes.message ||
            (beRes.isValid
              ? 'Email hợp lệ (Đã xác minh máy chủ nhận thư MX & sẵn sàng đăng ký).'
              : 'Email không hợp lệ.'),
          suggestedEmail: beRes.suggestedEmail || null
        };
      }
    } catch {
      // Nếu gọi BE gặp lỗi tạm thời, tiếp tục kiểm tra DNS MX trực tiếp qua Google DoH
    }
  }

  // 2. Dự phòng kiểm tra trực tiếp bản ghi DNS MX qua Google DNS-over-HTTPS
  const mxCheck = await verifyEmailDnsMxAsync(syncResult.domain);
  if (!mxCheck.hasMx) {
    return {
      isValid: false,
      hasMxRecord: false,
      email: syncResult.email,
      domain: syncResult.domain,
      message: mxCheck.message
    };
  }

  return {
    isValid: true,
    hasMxRecord: true,
    isAvailable: true,
    email: syncResult.email,
    domain: syncResult.domain,
    message: 'Email hợp lệ (Đã xác minh máy chủ nhận thư MX).'
  };
}

