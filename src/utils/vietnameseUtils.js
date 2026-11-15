/**
 * Chuẩn hóa và làm sạch triệt để các dấu thanh tiếng Việt bị lỗi rời rạc từ OCR / PDF hoặc font-serif rendering
 */
export function cleanVietnameseDiacritics(text) {
  if (!text || typeof text !== 'string') return '';
  let s = text.normalize('NFC');

  // 1. Loại bỏ các dấu thanh dư thừa đứng ngay sau nguyên âm đã có dấu
  s = s.replace(/([áắấéếíóốớúứýàằầèềìòồờùừỳảẳẩẻểỉỏổởủửỷãẵẫẽễĩõỗỡũữỹạặậẹệịọộợụựỵÁẮẤÉẾÍÓỐỚÚỨÝÀẰẦÈỀÌÒỒỜÙỪỲẢẲẨẺỂỈỎỔỞỦỬỶÃẴẪẼỄĨÕỖỠŨỮỸẠẶẬẸỆỊỌỘỢỤỰỴ])[\u00B4\u02CA\u0301`\u02CB\u0300']/g, '$1');

  // 2. Ghép dấu sắc lơ lửng (\u00B4, \u02CA, \u0301) vào nguyên âm chưa có dấu
  const acuteMap = {
    'a': 'á', 'ă': 'ắ', 'â': 'ấ', 'e': 'é', 'ê': 'ế', 'i': 'í', 'o': 'ó', 'ô': 'ố', 'ơ': 'ớ', 'u': 'ú', 'ư': 'ứ', 'y': 'ý',
    'A': 'Á', 'Ă': 'Ắ', 'Â': 'Ấ', 'E': 'É', 'Ê': 'Ế', 'I': 'Í', 'O': 'Ó', 'Ô': 'Ố', 'Ơ': 'Ớ', 'U': 'Ú', 'Ư': 'Ứ', 'Y': 'Ý'
  };
  s = s.replace(/([aăâeêioôơuưyAĂÂEÊIOÔƠUƯY])[\u00B4\u02CA\u0301]/g, (m, v) => acuteMap[v] || m);

  // 3. Ghép dấu huyền lơ lửng (` \u0060, \u02CB, \u0300) vào nguyên âm chưa có dấu
  const graveMap = {
    'a': 'à', 'ă': 'ằ', 'â': 'ầ', 'e': 'è', 'ê': 'ề', 'i': 'ì', 'o': 'ò', 'ô': 'ồ', 'ơ': 'ờ', 'u': 'ù', 'ư': 'ừ', 'y': 'ỳ',
    'A': 'À', 'Ă': 'Ằ', 'Â': 'Ầ', 'E': 'È', 'Ê': 'Ề', 'I': 'Ì', 'O': 'Ồ', 'Ơ': 'Ờ', 'U': 'Ù', 'Ư': 'Ừ', 'Y': 'Ỳ'
  };
  s = s.replace(/([aăâeêioôơuưyAĂÂEÊIOÔƠUƯY])[`\u02CB\u0300]/g, (m, v) => graveMap[v] || m);

  // 4. Ghép dấu hỏi lơ lửng (\u0309, \u02C0) vào nguyên âm chưa có dấu
  const hookMap = {
    'a': 'ả', 'ă': 'ẳ', 'â': 'ẩ', 'e': 'ẻ', 'ê': 'ể', 'i': 'ỉ', 'o': 'ỏ', 'ô': 'ổ', 'ơ': 'ở', 'u': 'ủ', 'ư': 'ử', 'y': 'ỷ',
    'A': 'Ả', 'Ă': 'Ẳ', 'Â': 'Ẩ', 'E': 'Ẻ', 'Ê': 'Ể', 'I': 'Ỉ', 'O': 'Ỏ', 'Ô': 'Ổ', 'Ơ': 'Ở', 'U': 'Ủ', 'Ư': 'Ử', 'Y': 'Ỷ'
  };
  s = s.replace(/([aăâeêioôơuưyAĂÂEÊIOÔƠUƯY])[\u0309\u02C0]/g, (m, v) => hookMap[v] || m);

  // 5. Ghép dấu ngã lơ lửng (\u0303) vào nguyên âm chưa có dấu
  const tildeMap = {
    'a': 'ã', 'ă': 'ẵ', 'â': 'ẫ', 'e': 'ẽ', 'ê': 'ễ', 'i': 'ĩ', 'o': 'õ', 'ô': 'ỗ', 'ơ': 'ỡ', 'u': 'ũ', 'ư': 'ữ', 'y': 'ỹ',
    'A': 'Ã', 'Ă': 'Ẵ', 'Â': 'Ẫ', 'E': 'Ẽ', 'Ê': 'Ễ', 'I': 'Ĩ', 'O': 'Õ', 'Ô': 'Ỗ', 'Ơ': 'Ỡ', 'U': 'Ũ', 'Ư': 'Ữ', 'Y': 'Ỹ'
  };
  s = s.replace(/([aăâeêioôơuưyAĂÂEÊIOÔƠUƯY])[\u0303]/g, (m, v) => tildeMap[v] || m);

  // 6. Ghép dấu nặng lơ lửng (\u0323) vào nguyên âm chưa có dấu
  const dotMap = {
    'a': 'ạ', 'ă': 'ặ', 'â': 'ậ', 'e': 'ẹ', 'ê': 'ệ', 'i': 'ị', 'o': 'ọ', 'ô': 'ộ', 'ơ': 'ợ', 'u': 'ụ', 'ư': 'ự', 'y': 'ỵ',
    'A': 'Ạ', 'Ă': 'Ặ', 'Â': 'Ậ', 'E': 'Ẹ', 'Ê': 'Ệ', 'I': 'Ị', 'O': 'Ọ', 'Ô': 'Ộ', 'Ơ': 'Ợ', 'U': 'Ụ', 'Ư': 'Ự', 'Y': 'Ỵ'
  };
  s = s.replace(/([aăâeêioôơuưyAĂÂEÊIOÔƠUƯY])[\u0323]/g, (m, v) => dotMap[v] || m);

  // 7. Xóa sạch mọi ký tự dấu lơ lửng còn sót lại
  s = s.replace(/[\u00B4\u02CA\u0301\u02CB\u0300\u0309\u02C0\u0303\u0323]/g, '');

  return s.normalize('NFC');
}
