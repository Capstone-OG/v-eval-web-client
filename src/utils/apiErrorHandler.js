/**
 * Extracts and forwards error messages returned by the Backend directly to the UI,
 * falling back to clean user-facing text only when the response has no readable body
 * (e.g. empty 502/503/504 proxy responses or offline network errors).
 */

const EMPTY_RESPONSE_FALLBACKS = {
  0: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.',
  400: 'Yêu cầu chưa hợp lệ. Vui lòng kiểm tra lại thông tin.',
  401: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
  403: 'Bạn chưa có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu hoặc đường dẫn yêu cầu.',
  408: 'Hết thời gian chờ phản hồi từ máy chủ. Vui lòng thử lại.',
  409: 'Dữ liệu đã tồn tại trên hệ thống.',
  429: 'Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại.',
  500: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau ít phút.',
  502: 'Hệ thống đang tạm gián đoạn kết nối. Vui lòng thử lại sau ít phút.',
  503: 'Hệ thống đang bảo trì hoặc quá tải. Vui lòng thử lại sau ít phút.',
  504: 'Máy chủ phản hồi chậm. Vui lòng thử lại sau ít phút.',
};

function isMissingOrRawProtocolText(text) {
  if (typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (!trimmed) return true;
  return (
    /^HTTP\s*Error\s*\d+$/i.test(trimmed) ||
    /^\s*<(?:!doctype|html|head|body)\b/i.test(trimmed) ||
    /^One or more validation errors occurred\.?$/i.test(trimmed) ||
    /^(?:Failed to fetch|NetworkError|Load failed)$/i.test(trimmed)
  );
}

function extractValidationDictionary(errorsObj) {
  if (!errorsObj || typeof errorsObj !== 'object' || Array.isArray(errorsObj)) {
    return '';
  }

  const messages = [];
  for (const val of Object.values(errorsObj)) {
    if (Array.isArray(val)) {
      val.forEach((item) => {
        if (typeof item === 'string' && item.trim()) messages.push(item.trim());
      });
    } else if (typeof val === 'string' && val.trim()) {
      messages.push(val.trim());
    }
  }
  return messages.join('; ');
}

/**
 * Extract the exact error message returned by Backend across all API shapes:
 * Clean Architecture { error: { code, description } }, { errors: [...] },
 * ASP.NET ValidationProblemDetails { errors: { Field: [...] } }, { message }, { detail }, { title }, or plain string.
 */
export function extractBackendErrorMessage(errorOrPayload) {
  if (!errorOrPayload) return '';

  const data = errorOrPayload instanceof Error ? errorOrPayload.data : errorOrPayload;

  if (data && typeof data === 'object') {
    if (data.error && typeof data.error === 'object') {
      const msg = data.error.description || data.error.message || data.error.title || '';
      if (msg.trim()) return msg.trim();
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const joined = data.errors
        .map((e) => (typeof e === 'object' ? e?.description || e?.message || '' : String(e || '')))
        .map((s) => s.trim())
        .filter(Boolean)
        .join('; ');
      if (joined) return joined;
    }

    if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
      const dictMsg = extractValidationDictionary(data.errors);
      if (dictMsg) return dictMsg;
    }

    const directField =
      (typeof data.message === 'string' && data.message) ||
      (typeof data.detail === 'string' && data.detail) ||
      (typeof data.error === 'string' && data.error) ||
      (typeof data.title === 'string' && !isMissingOrRawProtocolText(data.title) && data.title) ||
      '';
    if (directField.trim()) return directField.trim();
  } else if (typeof data === 'string' && !isMissingOrRawProtocolText(data)) {
    return data.trim();
  }

  if (
    errorOrPayload instanceof Error &&
    typeof errorOrPayload.message === 'string' &&
    !isMissingOrRawProtocolText(errorOrPayload.message)
  ) {
    return errorOrPayload.message.trim();
  }

  return '';
}

/**
 * Return the Backend's own error message directly when present;
 * only fall back cleanly when Backend/proxy gave no readable message (empty 502, network drop, etc.).
 */
export function formatApiError(
  errorOrPayload,
  fallbackMessage = 'Không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau.',
  statusOverride = null
) {
  if (errorOrPayload?.name === 'AbortError') {
    return EMPTY_RESPONSE_FALLBACKS[408];
  }

  const backendMessage = extractBackendErrorMessage(errorOrPayload);
  if (backendMessage) {
    return backendMessage;
  }

  const status =
    typeof statusOverride === 'number'
      ? statusOverride
      : typeof errorOrPayload?.status === 'number'
        ? errorOrPayload.status
        : null;

  if (typeof status === 'number' && EMPTY_RESPONSE_FALLBACKS[status]) {
    return EMPTY_RESPONSE_FALLBACKS[status];
  }

  if (typeof status === 'number' && status >= 500) {
    return EMPTY_RESPONSE_FALLBACKS[500];
  }

  return fallbackMessage;
}
