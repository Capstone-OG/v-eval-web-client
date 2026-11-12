import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractBackendErrorMessage,
  formatApiError,
} from '../src/utils/apiErrorHandler.js';

test('formatApiError forwards Clean Architecture BE error.description directly', () => {
  const bePayload = {
    error: {
      code: 'Auth.InvalidCredentials',
      description: 'Thông tin đăng nhập email hoặc mật khẩu không chính xác.',
      type: 4,
    },
  };

  assert.equal(extractBackendErrorMessage(bePayload), 'Thông tin đăng nhập email hoặc mật khẩu không chính xác.');
  assert.equal(formatApiError(bePayload, 'fallback', 401), 'Thông tin đăng nhập email hoặc mật khẩu không chính xác.');
});

test('formatApiError forwards BE errors array and ValidationProblemDetails dictionary directly', () => {
  const arrayPayload = {
    errors: [
      { code: 'Password', description: 'Mật khẩu phải chứa ít nhất 8 ký tự.' },
      { code: 'Phone', description: 'Số điện thoại không hợp lệ.' },
    ],
  };
  assert.equal(
    formatApiError(arrayPayload, 'fallback', 400),
    'Mật khẩu phải chứa ít nhất 8 ký tự.; Số điện thoại không hợp lệ.'
  );

  const dictPayload = {
    title: 'One or more validation errors occurred.',
    status: 400,
    errors: {
      Email: ['Email không được để trống.'],
      Password: ['Mật khẩu yếu.'],
    },
  };
  assert.equal(
    formatApiError(dictPayload, 'fallback', 400),
    'Email không được để trống.; Mật khẩu yếu.'
  );
});

test('formatApiError handles empty 502/503/504 and network errors without exposing raw HTTP codes', () => {
  assert.doesNotMatch(formatApiError('', 'fallback', 502), /HTTP Error 502/);
  assert.doesNotMatch(formatApiError('<html><body>502 Bad Gateway</body></html>', 'fallback', 502), /<html>/i);
  assert.equal(
    formatApiError('', 'fallback', 502),
    'Hệ thống đang tạm gián đoạn kết nối. Vui lòng thử lại sau ít phút.'
  );

  const fetchErr = new TypeError('Failed to fetch');
  fetchErr.status = 0;
  assert.equal(
    formatApiError(fetchErr, 'fallback'),
    'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
  );
});

test('formatApiError preserves custom BE message even when HTTP status is 502 or 500', () => {
  const beGatewayMessage = {
    message: 'Dịch vụ xác thực đang khởi động lại, vui lòng thử lại sau 10 giây.',
  };
  assert.equal(
    formatApiError(beGatewayMessage, 'fallback', 502),
    'Dịch vụ xác thực đang khởi động lại, vui lòng thử lại sau 10 giây.'
  );
});

