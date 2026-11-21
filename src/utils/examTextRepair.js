// Bộ sửa lỗi văn bản đề thi dùng chung cho `MathText.jsx` và `examParserUtils.js`.
// Tách riêng để hai lớp chuẩn hóa luôn cho cùng một kết quả.
// v20112026-r3 — force HMR reload

/** Ký hiệu độ C/F/K bị vỡ: `^{\circC}`, `^\circC`, `\circC`, `^{\circ C}` -> `^\circ\text{C}`. */
export function repairDegreeUnits(input) {
  let s = String(input || '');
  // 1. Chuẩn hóa lệnh LaTeX bị sai trước (bất kể trong hay ngoài math)
  s = s.replace(/\^\s*\{?\s*\\circ\s*([CFKcfk])\s*\}?(?![A-Za-z])/gi, '^\\circ\\text{$1}');
  s = s.replace(/\\circ\s*([CFKcfk])(?![A-Za-z])/gi, '^\\circ\\text{$1}');
  s = s.replace(/\^\s*\{\\circ\}\s*([CFKcfk])(?![A-Za-z])/gi, '^\\circ\\text{$1}');

  // 2. Chỉ bọc $...$ cho các số + độ C/F/K nằm NGOÀI vùng $...$ hoặc $$...$$ (tránh tạo $$$ thừa làm hỏng KaTeX)
  const parts = s.split(/(\$\$[\s\S]*?\$\$|\$[^$]+?\$)/g);
  for (let i = 0; i < parts.length; i += 2) {
    parts[i] = parts[i].replace(
      /(?<![a-zA-Z0-9_\\])(\d+(?:[.,]\d+)?)\s*\^\s*\\circ\s*\\text\{([CFKcfk])\}/g,
      (_, n, u) => `$${n}^\\circ\\text{${u}}$`
    );
  }
  return parts.join('');
}

/**
 * Chuẩn hóa thẻ gạch chân `<u>` và loại bỏ chữ ABCD đánh dấu trên đề (A), (B), (C), (D)
 * để văn bản hiển thị tự nhiên (in đậm + gạch chân), còn việc chọn đáp án để các nút A/B/C/D bên dưới đảm nhiệm.
 */
export function repairUnderlineTags(input) {
  let s = String(input || '');
  s = s.replace(/<\\+\s*\//g, '</'); // `<\/u>` (JSON escape còn sót)
  s = s.replace(/<\s*u\b[^>]*>/gi, '<u>');

  // Chuẩn hóa thẻ đóng và loại bỏ các nhãn (A), (B), (C), (D) kèm theo
  s = s.replace(/\$\s*<\s*\/\s*u\b[^>]*>/gi, '</u>');
  s = s.replace(/<\s*\/\s*\$?\s*u\b[^>]*>/gi, '</u>');

  // Loại bỏ các nhãn (A), (B), (C), (D) kèm theo hoặc đứng ngay sau thẻ </u> (kể cả có $, ngoặc, hoặc khoảng trắng)
  // Ví dụ: `</u> (C)`, `</u> ($C$)`, `</u> $(C)$`, `</u> $C$`, `</u> C.`
  s = s.replace(/<\/u>\s*(?:\$?\s*\(\s*\$?[A-F]\$?[\s.,]*\)\$?|\$\s*[A-F]\s*\$|\([A-F]\))\s*/gi, '</u> ');

  // Xóa bỏ nhãn (A), (B), (C), (D) đứng sau từ tiếng Anh nếu trong câu có thẻ <u>
  if (/<u>/i.test(s)) {
    s = s.replace(/(?:<\/u>|[a-zA-Z0-9_\x27])\s*(?:\(\s*\$?[A-F]\$?[\s.,]*\)|\$\s*[A-F]\s*\$)(?=\s|[,.?!:;]|$)/gi, (match) => {
      return match.startsWith('</u>') ? '</u>' : match.replace(/\s*(?:\(\s*\$?[A-F]\$?[\s.,]*\)|\$\s*[A-F]\s*\$).*/, '');
    });
    s = s.replace(/<\/u>\s+([,.?!:;])/g, '</u>$1');
  }

  // Thu gọn khoảng trắng thừa
  s = s.replace(/\s{2,}/g, ' ');
  return s.trim();
}

/** Chuẩn hóa Unicode NFC để các chữ tiếng Việt dạng tổ hợp (`a` + dấu) không bị coi là ranh giới từ. */
export function normalizeVietnameseUnicode(input) {
  const s = String(input || '');
  return typeof s.normalize === 'function' ? s.normalize('NFC') : s;
}

/**
 * Nối chữ cái hoa đầu từ bị PDF tách rời khỏi phần còn lại (`B ài`, `V âng`, `T ôi`)
 * khi nó đứng sau đầu câu / dấu gạch / dấu câu — tránh việc `15 - B` bị bọc thành công thức.
 */
export function repairSplitCapitalLetters(input) {
  const s = String(input || '');
  return s.replace(
    /(^|[\-–−—.!?:;"“”(]\s*|\n\s*)([A-ZĐ])[ \u00a0](?=[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ][\p{L}]*)/gu,
    '$1$2'
  );
}
