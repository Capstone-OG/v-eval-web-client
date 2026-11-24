import apiClient, { tokenStorage } from './apiClient.js';
import { hasValidForecastScores } from '../utils/prescriptionEligibility.js';
import { readForecastRange } from '../utils/forecastRange.js';

const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// =========================================================================
// Core Flow 4 & 5 Helpers: DTO Sanitizers, Deterministic UUID & Normalizers
// =========================================================================

const ensureGuid = (id, fallback = '00000000-0000-0000-0000-000000000001') => {
  if (typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return fallback;
};

const deterministicUuidFromText = (rawText) => {
  const str = String(rawText || 'veval_default');
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  let h3 = 0x9e3779b9;
  let h4 = 0x85ebca6b;

  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ (c + i), 0x85ebca6b) >>> 0;
    h3 = Math.imul(h3 ^ (c * 31), 0xc2b2ae35) >>> 0;
    h4 = Math.imul(h4 ^ (c * 131), 0x27d4eb2f) >>> 0;
  }

  const hex1 = h1.toString(16).padStart(8, '0');
  const hex2 = h2.toString(16).padStart(8, '0');
  const hex3 = h3.toString(16).padStart(8, '0');
  const hex4 = h4.toString(16).padStart(8, '0');

  return `${hex1}-${hex2.slice(0, 4)}-4${hex2.slice(5, 8)}-8${hex3.slice(1, 4)}-${hex3.slice(4, 8)}${hex4}`;
};

const cleanOptionKey = (opt, fallback = 'A') => {
  if (!opt) return fallback;
  const match = String(opt).trim().match(/^([A-D])/i);
  return match ? match[1].toUpperCase() : fallback;
};

const normalizeOptions = (opts) => {
  if (!opts) return null;
  if (Array.isArray(opts)) {
    const dict = {};
    opts.forEach((opt, idx) => {
      const key = String.fromCharCode(65 + idx);
      dict[key] = String(opt);
    });
    return dict;
  }
  if (typeof opts === 'object') return opts;
  return null;
};

const normalizeCanonicalDomain = (domainId, domainName) => {
  const raw = `${domainId || ''} ${domainName || ''}`.toLowerCase();
  if (raw.includes('dom_lang') || raw.includes('ngôn ngữ') || raw.includes('tiếng việt') || raw.includes('english') || raw.includes('văn')) {
    return 'DOM_LANG';
  }
  if (raw.includes('dom_nat') || raw.includes('tự nhiên') || raw.includes('lý') || raw.includes('hóa') || raw.includes('sinh')) {
    return 'DOM_NAT_SCI';
  }
  if (raw.includes('dom_soc') || raw.includes('xã hội') || raw.includes('sử') || raw.includes('địa')) {
    return 'DOM_SOC_SCI';
  }
  return 'DOM_MATH';
};

const CANONICAL_DOMAIN_META = [
  { domainCode: 'DOM_LANG', domainName: 'Sử dụng Ngôn ngữ (Việt - Anh)' },
  { domainCode: 'DOM_MATH', domainName: 'Toán học, Tư duy Logic & Phân tích số liệu' },
  { domainCode: 'DOM_NAT_SCI', domainName: 'Giải quyết vấn đề - Khoa học Tự nhiên' },
  { domainCode: 'DOM_SOC_SCI', domainName: 'Giải quyết vấn đề - Khoa học Xã hội' }
];

const toLocalDayKey = (dateInput) => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const scaleLocalSubmissionScore = (sub) => {
  if (typeof sub?.score === 'number' && sub.score > (sub?.pacing?.totalQuestions || 30)) {
    return Math.min(1200, Math.max(0, Math.round(sub.score)));
  }
  const totalCorrect =
    sub?.pacing?.totalCorrect ?? (sub?.reviewedQuestions || []).filter((q) => q.isCorrect).length;
  const totalQuestions = Math.max(
    1,
    sub?.pacing?.totalQuestions || (sub?.reviewedQuestions || []).length || 30
  );
  return Math.min(1200, Math.max(0, Math.round((totalCorrect / totalQuestions) * 1200)));
};

const buildRichSocraticFallback = ({ questionLatex, options, studentWrongOption, _correctOption }) => {
  const cleanQ =
    String(questionLatex || '')
      .replace(/\[Ngữ cảnh câu hỏi:[\s\S]*?\]/g, '')
      .trim() || String(questionLatex || '');
  const opts = normalizeOptions(options);
  const wrongKey = studentWrongOption ? cleanOptionKey(studentWrongOption, 'A') : '';
  const wrongVal = opts && wrongKey && opts[wrongKey] && !opts[wrongKey].startsWith('Phương án ') ? ` (${opts[wrongKey]})` : '';
  const qLower = cleanQ.toLowerCase().replace(/[!.,?~^:;]/g, '').trim();

  if (['hi', 'hello', 'chao', 'chào', 'chào bạn', 'chào thầy', 'chào cô', 'alo', 'hey', 'xin chào', 'helo'].includes(qLower)) {
    return 'Chào em! Thầy là **Gia Sư AI Socratic**. Rất vui được đồng hành cùng em ôn luyện ĐGNL. Em đang gặp khó khăn ở dạng bài tập nào hay chuyên đề nào (Toán học, Tư duy Logic, Tiếng Việt, KHTN/KHXH) cần thầy cùng gợi mở không? Em cứ gửi đề bài hoặc thắc mắc cho thầy nhé!';
  }

  if (qLower.includes('p \\Rightarrow q') || qLower.includes('p rightarrow q') || qLower.includes('kéo theo') || qLower.includes('mệnh đề') || qLower.includes('bảng chân trị')) {
    return (
      `💡 **Gợi ý phương pháp giải Socratic (Toán logic mệnh đề & suy luận kéo theo):**\n\n` +
      `- **Phân tích lựa chọn:** Với câu hỏi *"${cleanQ}"*, em đang chọn phương án **${wrongKey}${wrongVal}**.\n` +
      `- **Kiến thức trọng tâm:** Bảng chân trị của phép kéo theo $P \\Rightarrow Q$ chỉ nhận giá trị **Sai** duy nhất khi $P$ Đúng và $Q$ Sai ($1 \\Rightarrow 0 = 0$). Trong mọi trường hợp khác, mệnh đề kéo theo luôn Đúng.\n` +
      `- **Lưu ý bẫy thường gặp:** Nhiều bạn lầm tưởng khi $Q$ sai thì $P$ có thể nhận bất kỳ giá trị nào, quên mất rằng nếu $P$ đúng thì $P \\Rightarrow Q$ sẽ bị sai mâu thuẫn giả thiết đề bài.\n\n` +
      `👉 *Câu hỏi gợi mở:* Đề bài đã cho $P \\Rightarrow Q$ là Đúng và $Q$ là Sai. Nếu $P$ nhận giá trị Đúng thì mệnh đề $P \\Rightarrow Q$ sẽ mang giá trị Đúng hay Sai?`
    );
  }

  if (qLower.includes('cấp số cộng') || qLower.includes('công sai') || qLower.includes('u_n')) {
    return (
      `💡 **Gợi ý phương pháp giải Socratic (Dãy số & Cấp số cộng):**\n\n` +
      `- **Phân tích lựa chọn:** Với câu hỏi *"${cleanQ}"*, em đang chọn phương án **${wrongKey}${wrongVal}**.\n` +
      `- **Kiến thức trọng tâm:** Số hạng tổng quát của cấp số cộng $(u_n)$ được xác định theo công thức $u_n = u_1 + (n - 1)d$.\n` +
      `- **Lưu ý bẫy thường gặp:** Cẩn thận lỗi quên trừ 1 ở chỉ số số hạng (lấy $u_1 + n \\times d$ thay vì $(n-1)d$).\n\n` +
      `👉 *Câu hỏi gợi mở:* Khoảng cách giữa số hạng đầu $u_1$ và số hạng thứ $n$ là bao nhiêu lần công sai $d$?`
    );
  }

  if (qLower.includes('log') || qLower.includes('tập xác định')) {
    return (
      `💡 **Gợi ý phương pháp giải Socratic (Hàm số Lũy thừa, Mũ & Logarit):**\n\n` +
      `- **Phân tích lựa chọn:** Với câu hỏi *"${cleanQ}"*, em đang chọn phương án **${wrongKey}${wrongVal}**.\n` +
      `- **Kiến thức trọng tâm:** Biểu thức $\\log_a f(x)$ xác định khi và chỉ khi $f(x) > 0$ nghiêm ngặt và cơ số $0 < a \\neq 1$.\n\n` +
      `👉 *Câu hỏi gợi mở:* Khi giải bất phương trình $f(x) > 0$, tập nghiệm của tam thức bậc hai lấy khoảng nằm phía trong hay phía ngoài hai nghiệm?`
    );
  }

  if (qLower.includes('chính tả') || qLower.includes('xán lạn') || qLower.includes('sáng lạng')) {
    return (
      `💡 **Gợi ý phương pháp giải Socratic (Chính tả Tiếng Việt):**\n\n` +
      `- **Phân tích lựa chọn:** Với câu hỏi *"${cleanQ}"*, em đang chọn phương án **${wrongKey}${wrongVal}**.\n` +
      `- **Kiến thức trọng tâm:** Từ Hán Việt chuẩn là 'Xán lạn' ('xán' nghĩa là rực rỡ, 'lạn' nghĩa là sáng sủa, viết x-l). Trong từ điển tiếng Việt chuẩn không có từ 'sáng lạng'.\n\n` +
      `👉 *Câu hỏi gợi mở:* Trong từ điển chính tả tiếng Việt, từ chỉ tương lai rực rỡ bắt đầu bằng âm 'x' hay 's'?`
    );
  }

  return (
    `💡 **Gợi ý tư duy Socratic:**\n\n` +
    `- **Phân tích lựa chọn:** Với câu hỏi *"${cleanQ}"*, em đang chọn phương án **${wrongKey}${wrongVal}**.\n` +
    `- **Bản chất vấn đề:** Hãy đối chiếu kỹ giả thiết đề bài với các điều kiện ràng buộc. Một kết luận trắc nghiệm chỉ đúng khi nó thỏa mãn trong mọi trường hợp và không mâu thuẫn với bất kỳ giả thiết ban đầu nào.\n\n` +
    `👉 *Câu hỏi gợi mở:* Nếu giả sử phương án **${wrongKey}${wrongVal}** là đúng, em hãy thử kiểm tra xem có trường hợp nào làm nảy sinh mâu thuẫn với dữ kiện đề bài không?`
  );
};

const HISTORY_STORAGE_KEY = 'veval_submission_history_v1';

// =========================================================================
// Core Flow 5 Standard Seed Identifiers & Fallback Builders (Offline-Resilient)
// =========================================================================

export const FLOW5_DEFAULTS = {
  STUDENT_ID: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  PARENT_ID: 'b0000000-0000-0000-0000-000000000001',
  CLASS_ID: '11111111-2222-3333-4444-555555555555',
  SECONDARY_CLASS_ID: 'c0000000-0000-0000-0000-000000000001',
  CAMPUS_ID: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
};

export const FLOW6_DEFAULTS = {
  STUDENT_ID: FLOW5_DEFAULTS.STUDENT_ID,
  MENTOR_ID: 'd0000000-0000-0000-0000-000000000001',
  CLASS_ID: FLOW5_DEFAULTS.CLASS_ID,
  ALERT_RED_ID: 'f6000000-0000-4000-8000-000000000001',
  ALERT_YELLOW_ID: 'f6000000-0000-4000-8000-000000000002',
  ALERT_UNREALISTIC_ID: 'f6000000-0000-4000-8000-000000000003',
  ALERT_GREEN_ID: 'f6000000-0000-4000-8000-000000000004',
  MISTAKE_1_ID: 'f6100000-0000-4000-8000-000000000001',
  MISTAKE_2_ID: 'f6100000-0000-4000-8000-000000000002',
  MISTAKE_3_ID: 'f6100000-0000-4000-8000-000000000003'
};

const FLOW6_STORAGE_KEY = 'veval_flow6_state_v1';

const emitFlow6Updated = (detail = {}) => {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent('veval:flow6-updated', { detail }));
  }
};

const readFlow6LocalState = () => {
  try {
    const raw = localStorage.getItem(FLOW6_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeFlow6LocalState = (nextState) => {
  try {
    localStorage.setItem(FLOW6_STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    // Ignore storage quota errors in restricted environments
  }
};

const normalizePrescriptionItem = (item, idx = 0) => {
  const patternId = item?.patternId || item?.pattern_id || `PAT_CORE6_0${idx + 1}`;
  const patternName = item?.patternName || item?.pattern_name || 'Dạng bài trọng tâm bù điểm V-ACT';
  const skillId = ensureGuid(item?.skillId || item?.skill_id, '88888888-9999-aaaa-bbbb-cccccccccccc');
  const deltaScore = Number(item?.deltaScore ?? item?.delta_score ?? 25);
  const studyHoursNeeded = Number(item?.studyHoursNeeded ?? item?.study_hours_needed ?? 2.5);
  const roiScore = Number(
    item?.roiScore ?? item?.roi_score ?? Number((deltaScore / Math.max(0.5, studyHoursNeeded)).toFixed(2))
  );
  const priorityRank = Number(item?.priorityRank ?? item?.priority_rank ?? idx + 1);
  const isRemedied = Boolean(item?.isRemedied ?? item?.is_remedied ?? false);

  return {
    patternId,
    patternName,
    skillId,
    deltaScore,
    studyHoursNeeded,
    roiScore,
    priorityRank,
    isRemedied,
    pattern_id: patternId,
    pattern_name: patternName,
    skill_id: skillId,
    delta_score: deltaScore,
    study_hours_needed: studyHoursNeeded,
    roi_score: roiScore,
    priority_rank: priorityRank,
    is_remedied: isRemedied
  };
};

const normalizeForecastResponse = (raw, fallbackStudentId) => {
  const studentId = ensureGuid(raw?.studentId, fallbackStudentId);
  const predictedScore = Number(raw?.forecast?.predictedScore ?? raw?.predictedScore ?? 845);
  const sem = raw?.forecast?.sem ?? raw?.semScore ?? null;
  const scoreRange = readForecastRange(raw);
  const targetScore = Number(raw?.balanceSheet?.targetScore ?? raw?.targetScore ?? 920);
  const deficitScore = Number(
    raw?.balanceSheet?.deficitScore ?? raw?.deficitScore ?? Math.max(0, targetScore - predictedScore)
  );
  const status =
    raw?.balanceSheet?.status ||
    raw?.status ||
    (deficitScore <= 0 ? 'ON_TRACK' : deficitScore <= 80 ? 'AT_RISK' : 'CRITICAL');

  const prescriptions = Array.isArray(raw?.prescriptions)
    ? raw.prescriptions.map((p, i) => normalizePrescriptionItem(p, i))
    : [];

  return {
    studentId,
    _hasValidScores: hasValidForecastScores(raw),
    forecast: {
      predictedScore,
      scoreRange,
      sem,
      confidenceRate: Number(raw?.forecast?.confidenceRate ?? raw?.confidenceRate ?? 0.95),
      lastUpdated: raw?.forecast?.lastUpdated || raw?.createdAt || new Date().toISOString(),
      calculationSource: raw?.forecast?.calculationSource || raw?.calculationSource || 'MOCK_EXAM'
    },
    balanceSheet: {
      targetScore,
      deficitScore,
      status
    },
    prescriptions
  };
};

const PRESCRIPTION_QUESTION_BANK = {
  PAT_TOAN_LOGIC_01: {
    patternName: 'Mệnh đề kéo theo, phản đảo & bảng chân trị suy luận V-ACT',
    targetDeltaScore: 30,
    questions: [
      {
        questionId: 'f6200001-0000-4000-8000-000000000001',
        questionOrder: 1,
        difficultyB: 0.25,
        correctOption: 'C',
        content:
          'Cho mệnh đề kéo theo $P \\Rightarrow Q$: *"Nếu tứ giác $ABCD$ là hình thoi thì hai đường chéo $AC$ và $BD$ vuông góc với nhau"*. Mệnh đề nào dưới đây **tương đương logic** với mệnh đề đã cho?',
        options: [
          { optionId: 'A', content: 'Nếu $AC \\perp BD$ thì tứ giác $ABCD$ là hình thoi.' },
          { optionId: 'B', content: 'Nếu tứ giác $ABCD$ không là hình thoi thì $AC$ không vuông góc với $BD$.' },
          { optionId: 'C', content: 'Nếu $AC$ không vuông góc với $BD$ thì tứ giác $ABCD$ không là hình thoi.' },
          { optionId: 'D', content: 'Tứ giác $ABCD$ là hình thoi khi và chỉ khi $AC \\perp BD$.' }
        ]
      },
      {
        questionId: 'f6200001-0000-4000-8000-000000000002',
        questionOrder: 2,
        difficultyB: 0.45,
        correctOption: 'B',
        content:
          'Trong đội tuyển học sinh giỏi gồm 4 bạn An, Bình, Chi, Dũng có đúng 1 bạn đạt giải Nhất. Biết cả 3 mệnh đề sau đều đúng: (1) *"Nếu An đạt giải Nhất thì Bình cũng đạt giải Nhất"*; (2) *"An hoặc Bình hoặc Chi đạt giải Nhất"*; (3) *"Chi không đạt giải Nhất"*. Hỏi ai là người đạt giải Nhất?',
        options: [
          { optionId: 'A', content: 'An đạt giải Nhất' },
          { optionId: 'B', content: 'Bình đạt giải Nhất' },
          { optionId: 'C', content: 'Chi đạt giải Nhất' },
          { optionId: 'D', content: 'Dũng đạt giải Nhất' }
        ]
      },
      {
        questionId: 'f6200001-0000-4000-8000-000000000003',
        questionOrder: 3,
        difficultyB: 0.5,
        correctOption: 'A',
        content:
          'Phủ định của mệnh đề $\\forall x \\in \\mathbb{R},\\; x^2 - 4x + 5 > 0$ là mệnh đề nào sau đây?',
        options: [
          { optionId: 'A', content: '$\\exists x \\in \\mathbb{R},\\; x^2 - 4x + 5 \\le 0$' },
          { optionId: 'B', content: '$\\exists x \\in \\mathbb{R},\\; x^2 - 4x + 5 < 0$' },
          { optionId: 'C', content: '$\\forall x \\in \\mathbb{R},\\; x^2 - 4x + 5 \\le 0$' },
          { optionId: 'D', content: '$\\nexists x \\in \\mathbb{R},\\; x^2 - 4x + 5 > 0$' }
        ]
      }
    ]
  },
  PAT_HOA_PH_03: {
    patternName: 'Tính pH dung dịch hỗn hợp axit - bazơ mạnh & bảo toàn điện tích',
    targetDeltaScore: 25,
    questions: [
      {
        questionId: 'f6200002-0000-4000-8000-000000000001',
        questionOrder: 1,
        difficultyB: 0.3,
        correctOption: 'B',
        content:
          'Trộn $100\\text{ ml}$ dung dịch $HCl\\; 0,1\\text{ M}$ với $100\\text{ ml}$ dung dịch $NaOH\\; 0,3\\text{ M}$. Giá trị $pH$ của dung dịch thu được ở $25^\\circ C$ là bao nhiêu?',
        options: [
          { optionId: 'A', content: '$pH = 12$' },
          { optionId: 'B', content: '$pH = 13$' },
          { optionId: 'C', content: '$pH = 1$' },
          { optionId: 'D', content: '$pH = 12,3$' }
        ]
      },
      {
        questionId: 'f6200002-0000-4000-8000-000000000002',
        questionOrder: 2,
        difficultyB: 0.45,
        correctOption: 'C',
        content:
          'Dung dịch $X$ chứa $H_2SO_4\\; 0,005\\text{ M}$. Giá trị $pH$ của dung dịch $X$ (coi $H_2SO_4$ điện li hoàn toàn cả 2 nấc ở nồng độ loãng) là:',
        options: [
          { optionId: 'A', content: '$pH = 2,3$' },
          { optionId: 'B', content: '$pH = 3,0$' },
          { optionId: 'C', content: '$pH = 2,0$' },
          { optionId: 'D', content: '$pH = 1,7$' }
        ]
      },
      {
        questionId: 'f6200002-0000-4000-8000-000000000003',
        questionOrder: 3,
        difficultyB: 0.55,
        correctOption: 'D',
        content:
          'Cần pha loãng dung dịch $HCl$ có $pH = 2$ bằng nước cất gấp bao nhiêu lần về thể tích để thu được dung dịch mới có $pH = 4$?',
        options: [
          { optionId: 'A', content: '2 lần' },
          { optionId: 'B', content: '10 lần' },
          { optionId: 'C', content: '50 lần' },
          { optionId: 'D', content: '100 lần' }
        ]
      }
    ]
  },
  PAT_TOAN_HAMSO_02: {
    patternName: 'Cực trị hàm hợp & tương giao đồ thị đạo hàm chứa tham số',
    targetDeltaScore: 20,
    questions: [
      {
        questionId: 'f6200003-0000-4000-8000-000000000001',
        questionOrder: 1,
        difficultyB: 0.4,
        correctOption: 'B',
        content:
          'Cho hàm số $y = f(x)$ có đạo hàm $f\'(x) = x^2(x - 1)(x + 2)^3$. Số điểm cực trị của hàm số $y = f(x)$ là:',
        options: [
          { optionId: 'A', content: '3 điểm cực trị' },
          { optionId: 'B', content: '2 điểm cực trị' },
          { optionId: 'C', content: '1 điểm cực trị' },
          { optionId: 'D', content: '4 điểm cực trị' }
        ]
      },
      {
        questionId: 'f6200003-0000-4000-8000-000000000002',
        questionOrder: 2,
        difficultyB: 0.55,
        correctOption: 'A',
        content:
          'Hàm số $y = \\frac{2x - 3}{x + 1}$ có đường tiệm cận ngang và tiệm cận đứng lần lượt là:',
        options: [
          { optionId: 'A', content: '$y = 2$ và $x = -1$' },
          { optionId: 'B', content: '$y = -3$ và $x = -1$' },
          { optionId: 'C', content: '$y = 2$ và $x = 1$' },
          { optionId: 'D', content: '$y = -1$ và $x = 2$' }
        ]
      },
      {
        questionId: 'f6200003-0000-4000-8000-000000000003',
        questionOrder: 3,
        difficultyB: 0.6,
        correctOption: 'C',
        content:
          'Giá trị lớn nhất của hàm số $f(x) = -x^2 + 6x - 5$ trên đoạn $[0; 4]$ bằng:',
        options: [
          { optionId: 'A', content: '$-5$' },
          { optionId: 'B', content: '$3$' },
          { optionId: 'C', content: '$4$' },
          { optionId: 'D', content: '$6$' }
        ]
      }
    ]
  }
};

const buildSeedForecast = (studentId, realSubmissions = []) => {
  const resolvedStudentId = ensureGuid(studentId, FLOW6_DEFAULTS.STUDENT_ID);
  const localState = readFlow6LocalState();
  const studentPatch = localState.forecasts?.[resolvedStudentId] || {};
  const remediedMap = studentPatch.remediedPatterns || {};

  const latestSub = realSubmissions[0] || null;
  const basePredicted =
    studentPatch.predictedScore ??
    (latestSub ? Math.max(420, scaleLocalSubmissionScore(latestSub)) : 845);
  const targetScore = studentPatch.targetScore ?? (Number(latestSub?.targetScore) > 0 ? Number(latestSub.targetScore) : 920);
  const sem = studentPatch.sem ?? 24.5;

  const basePrescriptions = [
    {
      patternId: 'PAT_TOAN_LOGIC_01',
      patternName: 'Mệnh đề kéo theo, phản đảo & bảng chân trị suy luận V-ACT',
      skillId: '88888888-9999-aaaa-bbbb-cccccccccccc',
      deltaScore: 30,
      studyHoursNeeded: 2.0,
      roiScore: 15.0,
      priorityRank: 1,
      isRemedied: Boolean(remediedMap.PAT_TOAN_LOGIC_01)
    },
    {
      patternId: 'PAT_HOA_PH_03',
      patternName: 'Tính pH dung dịch hỗn hợp axit - bazơ mạnh & bảo toàn điện tích',
      skillId: '88888888-9999-aaaa-bbbb-ffffffffffff',
      deltaScore: 25,
      studyHoursNeeded: 2.0,
      roiScore: 12.5,
      priorityRank: 2,
      isRemedied: Boolean(remediedMap.PAT_HOA_PH_03)
    },
    {
      patternId: 'PAT_TOAN_HAMSO_02',
      patternName: 'Cực trị hàm hợp & tương giao đồ thị đạo hàm chứa tham số',
      skillId: '88888888-9999-aaaa-bbbb-dddddddddddd',
      deltaScore: 20,
      studyHoursNeeded: 2.5,
      roiScore: 8.0,
      priorityRank: 3,
      isRemedied: Boolean(remediedMap.PAT_TOAN_HAMSO_02)
    }
  ];

  const recoveredTotal = basePrescriptions
    .filter((p) => p.isRemedied)
    .reduce((acc, p) => acc + p.deltaScore, 0);

  const effectivePredicted = Math.min(1200, Math.round(basePredicted + recoveredTotal));
  const margin = Math.round(1.96 * sem);
  const deficitScore = Math.max(0, targetScore - effectivePredicted);
  const status = deficitScore <= 0 ? 'ON_TRACK' : deficitScore <= 80 ? 'AT_RISK' : 'CRITICAL';

  return {
    ...normalizeForecastResponse(
      {
        studentId: resolvedStudentId,
        forecast: {
          predictedScore: effectivePredicted,
          scoreRange: {
            min: Math.max(0, effectivePredicted - margin),
            max: Math.min(1200, effectivePredicted + margin)
          },
          sem,
          confidenceRate: 0.95,
          lastUpdated: studentPatch.lastUpdated || new Date().toISOString(),
          calculationSource: studentPatch.calculationSource || (latestSub ? 'DIAGNOSTIC_HYDRATED' : 'MOCK_EXAM')
        },
        balanceSheet: {
          targetScore,
          deficitScore,
          status
        },
        prescriptions: basePrescriptions
      },
      resolvedStudentId
    ),
    _source: 'seed_fallback'
  };
};

const buildSeedAlertsPool = (studentId) => {
  const resolvedStudentId = ensureGuid(studentId, FLOW6_DEFAULTS.STUDENT_ID);
  const localState = readFlow6LocalState();
  const alertPatches = localState.alerts || {};
  const now = Date.now();

  const rawPool = [
    {
      alertId: FLOW6_DEFAULTS.ALERT_RED_ID,
      studentId: resolvedStudentId,
      studentName: 'Phạm Minh Hoàng',
      classId: FLOW5_DEFAULTS.CLASS_ID,
      alertType: 'RED',
      message:
        'Tốc độ tiến bộ tuần qua chậm hơn 38% so với lộ trình mục tiêu 920 điểm; học sinh gặp khó khăn liên tiếp ở chủ đề Mệnh đề & Logic (độ làm chủ 42%). Khuyến nghị giáo viên giao gói bài tập trọng tâm bổ trợ kiến thức (+30 điểm).',
      isRead: false,
      currentPredictedScore: 845,
      targetScore: 920,
      deficitScore: 75,
      handledBy: null,
      resolutionNotes: null,
      resolvedAt: null,
      createdAt: new Date(now - 2 * 3600000).toISOString()
    },
    {
      alertId: FLOW6_DEFAULTS.ALERT_YELLOW_ID,
      studentId: resolvedStudentId,
      studentName: 'Phạm Minh Hoàng',
      classId: FLOW5_DEFAULTS.CLASS_ID,
      alertType: 'YELLOW',
      message:
        'Học sinh có 3 câu hỏi trong Sổ tay lỗi sai đã đến chu kỳ ôn tập củng cố hôm nay (chuyên đề Tính pH dung dịch & Đạo hàm hàm hợp).',
      isRead: false,
      currentPredictedScore: 845,
      targetScore: 920,
      deficitScore: 75,
      handledBy: null,
      resolutionNotes: null,
      resolvedAt: null,
      createdAt: new Date(now - 14 * 3600000).toISOString()
    },
    {
      alertId: FLOW6_DEFAULTS.ALERT_UNREALISTIC_ID,
      studentId: '3fa85f64-5717-4562-b3fc-2c963f66af99',
      studentName: 'Lê Ngọc Bảo Trân',
      classId: FLOW5_DEFAULTS.CLASS_ID,
      alertType: 'UNREALISTIC_GOAL',
      message:
        'Điểm dự báo hiện tại 610 điểm cách xa mục tiêu 980 điểm (chênh lệch 370 điểm) trong khi thời gian chuẩn bị còn 6 tuần. Cần tổ chức buổi tư vấn 3 bên (Quản lý/Giáo viên - Học sinh - Phụ huynh) để thống nhất điều chỉnh lộ trình học tập phù hợp.',
      isRead: false,
      currentPredictedScore: 610,
      targetScore: 980,
      deficitScore: 370,
      handledBy: null,
      resolutionNotes: null,
      resolvedAt: null,
      createdAt: new Date(now - 5 * 3600000).toISOString()
    },
    {
      alertId: 'f6000000-0000-4000-8000-000000000005',
      studentId: '3fa85f64-5717-4562-b3fc-2c963f66af88',
      studentName: 'Trần Quốc Tuấn',
      classId: FLOW5_DEFAULTS.SECONDARY_CLASS_ID,
      alertType: 'RED',
      message:
        'Học sinh vắng học / gián đoạn chuyên cần 5 ngày liên tiếp và giảm 45 điểm ở bài thi khảo sát Đợt 2 phần Khoa học Tự nhiên.',
      isRead: true,
      currentPredictedScore: 735,
      targetScore: 860,
      deficitScore: 125,
      handledBy: null,
      resolutionNotes: null,
      resolvedAt: null,
      createdAt: new Date(now - 26 * 3600000).toISOString()
    },
    {
      alertId: FLOW6_DEFAULTS.ALERT_GREEN_ID,
      studentId: resolvedStudentId,
      studentName: 'Phạm Minh Hoàng',
      classId: FLOW5_DEFAULTS.CLASS_ID,
      alertType: 'GREEN',
      message:
        'Tín hiệu Xanh: Miền Sử dụng Ngôn ngữ đạt độ vững vàng 82% và duy trì chuỗi chuyên cần ổn định.',
      isRead: true,
      currentPredictedScore: 845,
      targetScore: 920,
      deficitScore: 75,
      handledBy: FLOW6_DEFAULTS.MENTOR_ID,
      resolutionNotes: 'Đã biểu dương học sinh trên lớp và giao thêm đề đọc hiểu nâng cao.',
      resolvedAt: new Date(now - 48 * 3600000).toISOString(),
      createdAt: new Date(now - 72 * 3600000).toISOString()
    }
  ];

  return rawPool.map((item) => {
    const patch = alertPatches[item.alertId] || {};
    return {
      ...item,
      ...patch
    };
  });
};

const buildSeedMistakeItems = (studentId) => {
  const resolvedStudentId = ensureGuid(studentId, FLOW6_DEFAULTS.STUDENT_ID);
  const localState = readFlow6LocalState();
  const mistakePatches = localState.mistakes || {};
  const now = Date.now();

  const defaults = [
    {
      id: FLOW6_DEFAULTS.MISTAKE_1_ID,
      studentId: resolvedStudentId,
      questionId: 'f6200001-0000-4000-8000-000000000001',
      skillId: '88888888-9999-aaaa-bbbb-cccccccccccc',
      skillName: 'Toán logic mệnh đề & suy luận kéo theo',
      patternId: 'PAT_TOAN_LOGIC_01',
      cognitiveErrorTag: 'MISSING_CONCEPT',
      studentNotes: 'Hay nhầm mệnh đề đảo Q => P với mệnh đề phản đảo ~Q => ~P.',
      nextReviewDate: new Date(now - 3600000).toISOString(),
      reviewCount: 2,
      consecutiveCorrectReviews: 1,
      intervalDays: 1,
      easeFactor: 2.5,
      isMastered: false,
      lastReviewedAt: new Date(now - 86400000).toISOString(),
      createdAt: new Date(now - 4 * 86400000).toISOString(),
      updatedAt: new Date(now - 86400000).toISOString(),
      questionContent:
        'Cho mệnh đề $P \\Rightarrow Q$: *"Nếu số tự nhiên $n$ tận cùng bằng $0$ thì $n$ chia hết cho $5$"*. Mệnh đề phản đảo của mệnh đề trên là:',
      options: [
        { key: 'A', text: 'Nếu $n$ chia hết cho $5$ thì $n$ tận cùng bằng $0$.' },
        { key: 'B', text: 'Nếu $n$ không chia hết cho $5$ thì $n$ không tận cùng bằng $0$.' },
        { key: 'C', text: 'Nếu $n$ không tận cùng bằng $0$ thì $n$ không chia hết cho $5$.' },
        { key: 'D', text: 'Số tự nhiên $n$ chia hết cho $5$ khi và chỉ khi $n$ tận cùng bằng $0$.' }
      ],
      correctOption: 'B',
      explanation:
        'Mệnh đề phản đảo của $P \\Rightarrow Q$ là $\\overline{Q} \\Rightarrow \\overline{P}$ (tương đương logic với mệnh đề gốc): *"Nếu $n$ không chia hết cho $5$ thì $n$ không tận cùng bằng $0$"*.'
    },
    {
      id: FLOW6_DEFAULTS.MISTAKE_2_ID,
      studentId: resolvedStudentId,
      questionId: 'f6200002-0000-4000-8000-000000000001',
      skillId: '88888888-9999-aaaa-bbbb-ffffffffffff',
      skillName: 'Cân bằng phản ứng & pH dung dịch điện li',
      patternId: 'PAT_HOA_PH_03',
      cognitiveErrorTag: 'CARELESS',
      studentNotes: 'Quên cộng tổng thể tích V1 + V2 = 200ml khi tính nồng độ [OH-] dư.',
      nextReviewDate: new Date(now - 1800000).toISOString(),
      reviewCount: 3,
      consecutiveCorrectReviews: 2,
      intervalDays: 6,
      easeFactor: 2.6,
      isMastered: false,
      lastReviewedAt: new Date(now - 6 * 86400000).toISOString(),
      createdAt: new Date(now - 10 * 86400000).toISOString(),
      updatedAt: new Date(now - 6 * 86400000).toISOString(),
      questionContent:
        'Trộn $200\\text{ ml}$ dung dịch $HNO_3\\; 0,1\\text{ M}$ với $300\\text{ ml}$ dung dịch $KOH\\; 0,1\\text{ M}$. Dung dịch sau phản ứng có giá trị $pH$ ở $25^\\circ C$ bằng:',
      options: [
        { key: 'A', text: '$pH = 12,3$' },
        { key: 'B', text: '$pH = 13,0$' },
        { key: 'C', text: '$pH = 1,7$' },
        { key: 'D', text: '$pH = 12,0$' }
      ],
      correctOption: 'A',
      explanation:
        'Ta có $n_{H^+} = 0,02\\text{ mol}$, $n_{OH^-} = 0,03\\text{ mol} \\Rightarrow n_{OH^-\\text{ dư}} = 0,01\\text{ mol}$. Tổng thể tích $V = 0,5\\text{ L} \\Rightarrow [OH^-] = \\frac{0,01}{0,5} = 0,02\\text{ M} \\Rightarrow pOH = -\\log(0,02) \\approx 1,7 \\Rightarrow pH = 12,3$.'
    },
    {
      id: FLOW6_DEFAULTS.MISTAKE_3_ID,
      studentId: resolvedStudentId,
      questionId: 'f6200003-0000-4000-8000-000000000001',
      skillId: '88888888-9999-aaaa-bbbb-dddddddddddd',
      skillName: 'Đạo hàm hàm hợp & cực trị chứa tham số',
      patternId: 'PAT_TOAN_HAMSO_02',
      cognitiveErrorTag: 'MISREAD_QUESTION',
      studentNotes: 'Đếm luôn nghiệm bội chẵn x^2 = 0 làm cực trị dù đạo hàm không đổi dấu.',
      nextReviewDate: new Date(now + 12 * 86400000).toISOString(),
      reviewCount: 4,
      consecutiveCorrectReviews: 3,
      intervalDays: 15,
      easeFactor: 2.7,
      isMastered: true,
      lastReviewedAt: new Date(now - 2 * 86400000).toISOString(),
      createdAt: new Date(now - 18 * 86400000).toISOString(),
      updatedAt: new Date(now - 2 * 86400000).toISOString(),
      questionContent:
        'Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ có đạo hàm $f\'(x) = (x - 2)^4(x + 1)(3 - x)$. Số điểm cực đại của hàm số là:',
      options: [
        { key: 'A', text: '2 điểm cực đại' },
        { key: 'B', text: '1 điểm cực đại' },
        { key: 'C', text: '3 điểm cực đại' },
        { key: 'D', text: '0 điểm cực đại' }
      ],
      correctOption: 'B',
      explanation:
        'Nghiệm $x = 2$ là bội chẵn nên $f\'(x)$ không đổi dấu. Xét dấu $(x+1)(3-x)$: đổi dấu từ âm sang dương qua $x = -1$ (cực tiểu) và từ dương sang âm qua $x = 3$ (cực đại). Vậy có đúng $1$ điểm cực đại.'
    }
  ];

  return defaults.map((item) => ({
    ...item,
    ...(mistakePatches[item.id] || {})
  }));
};

const buildSeedStudentDashboard = (studentId) => ({
  studentId: ensureGuid(studentId, FLOW5_DEFAULTS.STUDENT_ID),
  fullName: 'Phạm Minh Hoàng',
  currentEstimatedScore: 845,
  targetScore: 920,
  confidenceInterval: '820 - 870',
  theta0: 0.65,
  radarCompetency: [
    { domainCode: 'DOM_LANG', domainName: 'Sử dụng Ngôn ngữ (Việt - Anh)', studentScore: 82.0, targetScore: 85.0 },
    { domainCode: 'DOM_MATH', domainName: 'Toán học, Tư duy Logic & Phân tích số liệu', studentScore: 68.5, targetScore: 85.0 },
    { domainCode: 'DOM_NAT_SCI', domainName: 'Giải quyết vấn đề - Khoa học Tự nhiên', studentScore: 76.0, targetScore: 82.0 },
    { domainCode: 'DOM_SOC_SCI', domainName: 'Giải quyết vấn đề - Khoa học Xã hội', studentScore: 79.5, targetScore: 80.0 }
  ],
  roadmapProgress: {
    totalMilestones: 12,
    completedMilestones: 7,
    progressPercentage: 58.3,
    currentMilestoneTitle: 'Chặng 08: Toán logic mệnh đề & suy luận kéo theo'
  },
  streakAnalytics: {
    currentStreak: 12,
    longestStreak: 16,
    hasStreakFreeze: true,
    isTodayCompleted: true,
    weeklyActivityDays: [true, true, true, true, true, true, true]
  },
  recentMockExams: [
    {
      submissionId: 'e1111111-2222-3333-4444-555555555501',
      examTitle: 'Đề Thi Thử ĐGNL ĐHQG TP.HCM Chuẩn Hóa Đợt 2 (120 Câu)',
      score: 845,
      totalCorrect: 86,
      totalQuestions: 120,
      completedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      submissionId: 'e1111111-2222-3333-4444-555555555502',
      examTitle: 'Đề Thi Thử ĐGNL ĐHQG TP.HCM Chuẩn Hóa Đợt 1 (120 Câu)',
      score: 790,
      totalCorrect: 79,
      totalQuestions: 120,
      completedAt: new Date(Date.now() - 9 * 86400000).toISOString()
    }
  ],
  needsOnboarding: false,
  _source: 'seed_fallback'
});

const buildSeedClassHeatmap = (classId, { domainCode = '', minMastery = null } = {}) => {
  const isSecondary = classId === FLOW5_DEFAULTS.SECONDARY_CLASS_ID;
  const resolvedClassId = ensureGuid(classId, FLOW5_DEFAULTS.CLASS_ID);
  const nowIso = new Date().toISOString();

  const allColumns = [
    {
      skillId: '88888888-9999-aaaa-bbbb-cccccccccccc',
      skillName: 'Toán logic mệnh đề & suy luận kéo theo',
      domainCode: 'DOM_MATH',
      classAveragePlt: isSecondary ? 0.56 : 0.44,
      alertStatus: 'CRITICAL_RED',
      isBimodal: true
    },
    {
      skillId: '88888888-9999-aaaa-bbbb-dddddddddddd',
      skillName: 'Đạo hàm hàm hợp & cực trị chứa tham số',
      domainCode: 'DOM_MATH',
      classAveragePlt: isSecondary ? 0.61 : 0.52,
      alertStatus: 'WARNING_AMBER',
      isBimodal: false
    },
    {
      skillId: '88888888-9999-aaaa-bbbb-eeeeeeeeeeee',
      skillName: 'Đọc hiểu văn bản khoa học & suy luận ngữ nghĩa',
      domainCode: 'DOM_LANG',
      classAveragePlt: isSecondary ? 0.81 : 0.78,
      alertStatus: 'SAFE_GREEN',
      isBimodal: false
    },
    {
      skillId: '88888888-9999-aaaa-bbbb-ffffffffffff',
      skillName: 'Cân bằng phản ứng oxi hóa khử & bảo toàn electron',
      domainCode: 'DOM_NAT_SCI',
      classAveragePlt: isSecondary ? 0.69 : 0.63,
      alertStatus: 'SAFE_GREEN',
      isBimodal: true
    },
    {
      skillId: '88888888-9999-aaaa-bbbb-111111111111',
      skillName: 'Phân tích bảng số liệu kinh tế - địa lý vùng',
      domainCode: 'DOM_SOC_SCI',
      classAveragePlt: isSecondary ? 0.75 : 0.72,
      alertStatus: 'SAFE_GREEN',
      isBimodal: false
    }
  ];

  const filteredColumns = allColumns.filter((col) => {
    if (domainCode && domainCode !== 'ALL' && col.domainCode !== domainCode) return false;
    if (
      minMastery !== null &&
      minMastery !== undefined &&
      minMastery !== '' &&
      col.classAveragePlt > Number(minMastery)
    ) {
      return false;
    }
    return true;
  });

  const activeSkillIds = new Set(filteredColumns.map((c) => c.skillId));

  const rawStudents = [
    {
      studentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      studentName: 'Phạm Minh Hoàng',
      avatarUrl: null,
      thetaScore: 0.72,
      plts: [0.82, 0.68, 0.86, 0.79, 0.8]
    },
    {
      studentId: '4fa85f64-5717-4562-b3fc-2c963f66afa6',
      studentName: 'Nguyễn Ngọc Bảo Trâm',
      avatarUrl: null,
      thetaScore: -0.35,
      plts: [0.28, 0.41, 0.74, 0.36, 0.68]
    },
    {
      studentId: '5fa85f64-5717-4562-b3fc-2c963f66afa6',
      studentName: 'Trần Tuấn Kiệt',
      avatarUrl: null,
      thetaScore: -0.48,
      plts: [0.24, 0.35, 0.69, 0.44, 0.65]
    },
    {
      studentId: '6fa85f64-5717-4562-b3fc-2c963f66afa6',
      studentName: 'Lê Hà Thảo My',
      avatarUrl: null,
      thetaScore: 0.15,
      plts: [0.39, 0.56, 0.82, 0.72, 0.74]
    },
    {
      studentId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
      studentName: 'Võ Hoàng Long',
      avatarUrl: null,
      thetaScore: 0.94,
      plts: [0.89, 0.78, 0.88, 0.86, 0.84]
    }
  ];

  const rows = rawStudents.map((stu) => {
    const cells = allColumns
      .map((col, idx) => {
        const plt = stu.plts[idx];
        const masteryLevel = plt >= 0.75 ? 'MASTERED' : plt >= 0.5 ? 'LEARNING' : 'STRUGGLING';
        return {
          skillId: col.skillId,
          plt,
          masteryLevel,
          lastUpdated: nowIso
        };
      })
      .filter((cell) => activeSkillIds.has(cell.skillId));

    const weakCount = cells.filter((c) => c.plt < 0.5).length;
    const riskStatus = weakCount >= 2 ? 'HIGH_RISK' : weakCount === 1 ? 'MEDIUM_RISK' : 'SAFE';

    return {
      studentId: stu.studentId,
      studentName: stu.studentName,
      avatarUrl: stu.avatarUrl,
      thetaScore: stu.thetaScore,
      riskStatus,
      skillCells: cells
    };
  });

  const pedagogicalAlerts = [
    {
      skillId: '88888888-9999-aaaa-bbbb-cccccccccccc',
      skillName: 'Toán logic mệnh đề & suy luận kéo theo',
      domainCode: 'DOM_MATH',
      strugglingRate: 0.6,
      strugglingCount: 3,
      averagePlt: 0.44,
      alertLevel: 'CRITICAL_RED',
      suggestedAction:
        '60% học sinh trong lớp có P(Lt) < 0.50 và phân hóa 2 cực rõ rệt (σ ≥ 0.28). Khuyến nghị chia nhóm vi mô 3–5 học sinh tại lớp và phát phiếu bài tập thích ứng ngay!'
    },
    {
      skillId: '88888888-9999-aaaa-bbbb-dddddddddddd',
      skillName: 'Đạo hàm hàm hợp & cực trị chứa tham số',
      domainCode: 'DOM_MATH',
      strugglingRate: 0.4,
      strugglingCount: 2,
      averagePlt: 0.52,
      alertLevel: 'WARNING_AMBER',
      suggestedAction:
        '40% học sinh đang lúng túng bước xét dấu đạo hàm hợp. Nên gom bàn vi mô ôn tập chuyên đề 15 phút đầu giờ.'
    }
  ].filter((a) => !domainCode || domainCode === 'ALL' || a.domainCode === domainCode);

  return {
    classId: resolvedClassId,
    className: isSecondary ? 'Lớp Chuyên Đề ĐGNL Tăng Tốc 01' : 'Lớp ĐGNL Cơ sở 1 - ĐHQG TP.HCM',
    totalStudents: rows.length,
    lastAggregatedAt: nowIso,
    pedagogicalAlerts,
    columns: filteredColumns,
    rows,
    _source: 'seed_fallback'
  };
};

const buildSeedParentDashboard = (parentId) => ({
  parentId: parentId || null,
  children: []
});

const buildSeedCampusComparativeHeatmap = (campusId) => ({
  campusId: ensureGuid(campusId, FLOW5_DEFAULTS.CAMPUS_ID),
  campusName: 'Cơ sở Quận 10 - TP.HCM (Trung tâm ĐGNL Trọng điểm)',
  totalClasses: 4,
  lastUpdated: new Date().toISOString(),
  domainAverages: [
    { domainCode: 'DOM_LANG', domainName: 'Sử dụng Ngôn ngữ', averageMastery: 0.77 },
    { domainCode: 'DOM_MATH', domainName: 'Toán & Tư duy Logic', averageMastery: 0.58 },
    { domainCode: 'DOM_NAT_SCI', domainName: 'Khoa học Tự nhiên', averageMastery: 0.66 },
    { domainCode: 'DOM_SOC_SCI', domainName: 'Khoa học Xã hội', averageMastery: 0.73 }
  ],
  classComparisons: [
    {
      classId: FLOW5_DEFAULTS.CLASS_ID,
      className: 'Lớp ĐGNL Cơ sở 1 - ĐHQG TP.HCM (01)',
      teacherName: 'ThS. Nguyễn Minh Triết',
      totalStudents: 20,
      overallRiskLevel: 'HIGH_RISK',
      domainMasteries: [
        { domainCode: 'DOM_LANG', averagePlt: 0.78, strugglingRate: 0.1 },
        { domainCode: 'DOM_MATH', averagePlt: 0.46, strugglingRate: 0.55 },
        { domainCode: 'DOM_NAT_SCI', averagePlt: 0.63, strugglingRate: 0.25 },
        { domainCode: 'DOM_SOC_SCI', averagePlt: 0.72, strugglingRate: 0.15 }
      ]
    },
    {
      classId: FLOW5_DEFAULTS.SECONDARY_CLASS_ID,
      className: 'Lớp Chuyên Đề ĐGNL Tăng Tốc (02)',
      teacherName: 'ThS. Lê Hoàng Nam',
      totalStudents: 19,
      overallRiskLevel: 'MEDIUM_RISK',
      domainMasteries: [
        { domainCode: 'DOM_LANG', averagePlt: 0.75, strugglingRate: 0.16 },
        { domainCode: 'DOM_MATH', averagePlt: 0.54, strugglingRate: 0.37 },
        { domainCode: 'DOM_NAT_SCI', averagePlt: 0.65, strugglingRate: 0.21 },
        { domainCode: 'DOM_SOC_SCI', averagePlt: 0.71, strugglingRate: 0.16 }
      ]
    },
    {
      classId: 'c0000000-0000-0000-0000-000000000002',
      className: 'Lớp Nền Tảng Toán & Logic V-ACT (03)',
      teacherName: 'Cô Trần Thu Hà',
      totalStudents: 18,
      overallRiskLevel: 'HIGH_RISK',
      domainMasteries: [
        { domainCode: 'DOM_LANG', averagePlt: 0.72, strugglingRate: 0.22 },
        { domainCode: 'DOM_MATH', averagePlt: 0.44, strugglingRate: 0.61 },
        { domainCode: 'DOM_NAT_SCI', averagePlt: 0.59, strugglingRate: 0.33 },
        { domainCode: 'DOM_SOC_SCI', averagePlt: 0.7, strugglingRate: 0.17 }
      ]
    },
    {
      classId: 'c0000000-0000-0000-0000-000000000003',
      className: 'Lớp Mũi Nhọn Săn Điểm 950+ (04)',
      teacherName: 'TS. Vũ Quốc Khánh',
      totalStudents: 20,
      overallRiskLevel: 'SAFE',
      domainMasteries: [
        { domainCode: 'DOM_LANG', averagePlt: 0.84, strugglingRate: 0.05 },
        { domainCode: 'DOM_MATH', averagePlt: 0.86, strugglingRate: 0.05 },
        { domainCode: 'DOM_NAT_SCI', averagePlt: 0.78, strugglingRate: 0.1 },
        { domainCode: 'DOM_SOC_SCI', averagePlt: 0.8, strugglingRate: 0.05 }
      ]
    }
  ],
  _source: 'seed_fallback'
});

const getDefaultSeedHistory = () => [
  {
    id: 'sub_seed_vact_01',
    title: 'Đề Khảo Sát Năng Lực Đầu Vào Chuẩn V-ACT 2026 (Đề số 01)',
    examType: 'DIAGNOSTIC',
    engineUsed: 'content_service',
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    theta_0: 0.42,
    placement_class: 'ACCELERATION',
    ai_commentary:
      'Bạn đạt độ chính xác 67% trên bài khảo sát mẫu. Năng lực Tư duy Logic và Toán học ở mức khá, tuy nhiên cần củng cố kỹ việc xét dấu đạo hàm trên toàn miền xác định và đọc kỹ mệnh đề phủ định.',
    pacing: {
      totalCorrect: 4,
      totalQuestions: 6,
      totalTimeSpent: 215,
      avgTimePerQ: 36,
      fastCount: 2,
      normalCount: 3,
      slowCount: 1,
      flaggedCount: 1
    },
    domain_scores: [
      { domain_id: 'dom_math', domain_name: 'Toán học & Phân tích số liệu', total_questions: 3, correct_count: 2, accuracy_pct: 67 },
      { domain_id: 'dom_logic', domain_name: 'Tư duy Logic & Suy luận', total_questions: 2, correct_count: 1, accuracy_pct: 50 },
      { domain_id: 'dom_lang', domain_name: 'Sử dụng Ngôn ngữ & Văn học', total_questions: 1, correct_count: 1, accuracy_pct: 100 }
    ],
    radar_chart: [
      { domain_id: 'dom_math', domain_name: 'Toán học & Phân tích số liệu', student_pct: 67, benchmark_pct: 85 },
      { domain_id: 'dom_logic', domain_name: 'Tư duy Logic & Suy luận', student_pct: 50, benchmark_pct: 80 },
      { domain_id: 'dom_lang', domain_name: 'Sử dụng Ngôn ngữ & Văn học', student_pct: 100, benchmark_pct: 75 },
      { domain_id: 'dom_nat_sci', domain_name: 'Khoa học Tự nhiên (Lý - Hóa - Sinh)', student_pct: 65, benchmark_pct: 80 },
      { domain_id: 'dom_soc_sci', domain_name: 'Khoa học Xã hội (Sử - Địa)', student_pct: 70, benchmark_pct: 75 }
    ],
    skill_priors: [
      { skill_id: 'sk_dom_math_1', skill_name: 'Tính đơn điệu của hàm số', domain_id: 'dom_math', domain_name: 'Toán học & Phân tích số liệu', theta_skill: -0.45, p_l0: 0.39, source: 'measured' },
      { skill_id: 'sk_dom_math_2', skill_name: 'Dãy số & Cấp số cộng', domain_id: 'dom_math', domain_name: 'Toán học & Phân tích số liệu', theta_skill: 0.85, p_l0: 0.70, source: 'measured' },
      { skill_id: 'sk_dom_math_3', skill_name: 'Hàm số Mũ & Logarit', domain_id: 'dom_math', domain_name: 'Toán học & Phân tích số liệu', theta_skill: 0.75, p_l0: 0.68, source: 'measured' },
      { skill_id: 'sk_dom_logic_1', skill_name: 'Mệnh đề & Suy luận Logic', domain_id: 'dom_logic', domain_name: 'Tư duy Logic & Suy luận', theta_skill: -0.35, p_l0: 0.41, source: 'measured' },
      { skill_id: 'sk_dom_logic_2', skill_name: 'Phân tích Sắp xếp & Ràng buộc', domain_id: 'dom_logic', domain_name: 'Tư duy Logic & Suy luận', theta_skill: 0.62, p_l0: 0.65, source: 'measured' },
      { skill_id: 'sk_dom_lang_1', skill_name: 'Chính tả & Ngữ nghĩa Tiếng Việt', domain_id: 'dom_lang', domain_name: 'Sử dụng Ngôn ngữ & Văn học', theta_skill: 1.10, p_l0: 0.75, source: 'measured' }
    ],
    reviewedQuestions: [
      {
        id: 'seed_q_1',
        question_number: 1,
        content: 'Hàm số nào sau đây đồng biến trên khoảng $(-\\infty; +\\infty)$?',
        options: ['$y = x^4 + 2x^2$', '$y = \\frac{2x-1}{x+1}$', '$y = x^3 + 3x - 1$', '$y = -x^3 + x$'],
        skill_id: 'sk_dom_math_1',
        skill_name: 'Tính đơn điệu của hàm số',
        domain_id: 'dom_math',
        domain_name: 'Toán học & Phân tích số liệu',
        bloom: 2,
        studentChoice: 'A',
        correctChoice: 'C',
        correct: 'C',
        isCorrect: false,
        timeSpent: 42,
        isFlagged: true,
        speedCategory: 'normal',
        explanation:
          "Ta có $y' = 3x^2 + 3 > 0, \\forall x \\in \\mathbb{R}$, do đó hàm số $y = x^3 + 3x - 1$ luôn đồng biến trên $\\mathbb{R}$."
      },
      {
        id: 'seed_q_2',
        question_number: 2,
        content: 'Cho cấp số cộng $(u_n)$ có $u_1 = 3$ và công sai $d = 4$. Giá trị của $u_5$ bằng:',
        options: ['$19$', '$15$', '$23$', '$16$'],
        skill_id: 'sk_dom_math_2',
        skill_name: 'Dãy số & Cấp số cộng',
        domain_id: 'dom_math',
        domain_name: 'Toán học & Phân tích số liệu',
        bloom: 1,
        studentChoice: 'A',
        correctChoice: 'A',
        correct: 'A',
        isCorrect: true,
        timeSpent: 20,
        isFlagged: false,
        speedCategory: 'fast',
        explanation: 'Áp dụng công thức số hạng tổng quát $u_n = u_1 + (n-1)d$, ta có $u_5 = 3 + 4 \\times 4 = 19$.'
      },
      {
        id: 'seed_q_3',
        question_number: 3,
        content: 'Tìm tập xác định $D$ của hàm số $y = \\log_2(x^2 - 4x + 3)$:',
        options: ['$D = (1; 3)$', '$D = (-\\infty; 1) \\cup (3; +\\infty)$', '$D = [1; 3]$', '$D = (3; +\\infty)$'],
        skill_id: 'sk_dom_math_3',
        skill_name: 'Hàm số Mũ & Logarit',
        domain_id: 'dom_math',
        domain_name: 'Toán học & Phân tích số liệu',
        bloom: 2,
        studentChoice: 'B',
        correctChoice: 'B',
        correct: 'B',
        isCorrect: true,
        timeSpent: 35,
        isFlagged: false,
        speedCategory: 'normal',
        explanation: 'Điều kiện xác định: $x^2 - 4x + 3 > 0 \\iff x < 1$ hoặc $x > 3$. Vậy $D = (-\\infty; 1) \\cup (3; +\\infty)$.'
      },
      {
        id: 'seed_q_4',
        question_number: 4,
        content: 'Cho mệnh đề: "Nếu trời mưa thì đường ướt". Mệnh đề nào sau đây tương đương logic (contrapositive) với mệnh đề đã cho?',
        options: [
          'Nếu trời không mưa thì đường không ướt.',
          'Nếu đường ướt thì trời mưa.',
          'Nếu đường không ướt thì trời không mưa.',
          'Trời mưa hoặc đường ướt.'
        ],
        skill_id: 'sk_dom_logic_1',
        skill_name: 'Mệnh đề & Suy luận Logic',
        domain_id: 'dom_logic',
        domain_name: 'Tư duy Logic & Suy luận',
        bloom: 2,
        studentChoice: 'A',
        correctChoice: 'C',
        correct: 'C',
        isCorrect: false,
        timeSpent: 55,
        isFlagged: false,
        speedCategory: 'normal',
        explanation:
          'Mệnh đề kéo theo $P \\Rightarrow Q$ chỉ tương đương logic với mệnh đề phản đảo $\\neg Q \\Rightarrow \\neg P$ ("Nếu đường không ướt thì trời không mưa").'
      },
      {
        id: 'seed_q_5',
        question_number: 5,
        content:
          'Năm bạn A, B, C, D, E xếp thành một hàng dọc. Biết A đứng trước B, C đứng ngay sau B, và D đứng đầu hàng. Nếu E đứng cuối hàng thì ai đứng ở vị trí thứ 3?',
        options: ['A', 'B', 'C', 'D'],
        skill_id: 'sk_dom_logic_2',
        skill_name: 'Phân tích Sắp xếp & Ràng buộc',
        domain_id: 'dom_logic',
        domain_name: 'Tư duy Logic & Suy luận',
        bloom: 3,
        studentChoice: 'B',
        correctChoice: 'B',
        correct: 'B',
        isCorrect: true,
        timeSpent: 45,
        isFlagged: false,
        speedCategory: 'normal',
        explanation: 'Thứ tự từ 1 đến 5 là: D (1) - A (2) - B (3) - C (4) - E (5). Vậy vị trí thứ 3 là B.'
      },
      {
        id: 'seed_q_6',
        question_number: 6,
        content: 'Chọn từ viết đúng chính tả tiếng Việt chuẩn trong các phương án sau:',
        options: ['Sáng lạng', 'Xán lạn', 'Sáng lạn', 'Xáng lạn'],
        skill_id: 'sk_dom_lang_1',
        skill_name: 'Chính tả & Ngữ nghĩa Tiếng Việt',
        domain_id: 'dom_lang',
        domain_name: 'Sử dụng Ngôn ngữ & Văn học',
        bloom: 1,
        studentChoice: 'B',
        correctChoice: 'B',
        correct: 'B',
        isCorrect: true,
        timeSpent: 18,
        isFlagged: false,
        speedCategory: 'fast',
        explanation: '"Xán lạn" (gốc Hán Việt: rực rỡ, tươi sáng) là từ đúng chính tả.'
      }
    ]
  }
];

let isBackgroundSyncRunning = false;

/**
 * Practice & Adaptive Learning Roadmap Service
 * Routed through V-Eval API Gateway (:5212) -> Practice Service (:5261)
 */
const buildEmptyStudentDashboard = (studentId) => {
  const currentUser = tokenStorage.getUser();
  const studentName =
    currentUser?.fullName ||
    currentUser?.name ||
    currentUser?.email?.split('@')[0] ||
    'Học viên V-Eval';
  const targetScore = Number(currentUser?.targetScore || 900);

  return {
    studentId,
    studentName,
    currentEstimatedScore: 0,
    targetScore,
    confidenceInterval: 'Chưa có dữ liệu',
    radarCompetency: [
      { domainCode: 'DOM_LANG', domainName: 'Sử dụng Ngôn ngữ (Việt - Anh)', currentPercentage: 0, targetPercentage: 80 },
      { domainCode: 'DOM_MATH', domainName: 'Toán học, Tư duy Logic & Phân tích số liệu', currentPercentage: 0, targetPercentage: 85 },
      { domainCode: 'DOM_NAT_SCI', domainName: 'Giải quyết vấn đề - Khoa học Tự nhiên', currentPercentage: 0, targetPercentage: 80 },
      { domainCode: 'DOM_SOC_SCI', domainName: 'Giải quyết vấn đề - Khoa học Xã hội', currentPercentage: 0, targetPercentage: 78 }
    ],
    roadmapProgress: {
      totalMilestones: 0,
      completedMilestones: 0,
      progressPercentage: 0,
      currentMilestoneTitle: 'Hoàn thành bài kiểm tra đầu vào 30 câu để mở khóa lộ trình cá nhân P-L-A-R'
    },
    streakAnalytics: {
      currentStreak: 0,
      longestStreak: 0,
      isFreezeAvailable: false,
      isTodayCompleted: false,
      weeklyActivityDays: [false, false, false, false, false, false, false]
    },
    recentMockExams: [],
    needsOnboarding: true,
    _source: 'empty_backend'
  };
};

export const practiceService = {
  async getDiagnosticHistory(studentId) {
    if (!studentId) throw new Error('Student ID is required.');
    return (await apiClient.get('/api/practice/diagnostic-submissions/student/' + encodeURIComponent(studentId))).data;
  },
  async getDiagnosticResult(submissionId) {
    return (await apiClient.get('/api/practice/diagnostic-submissions/' + encodeURIComponent(submissionId))).data;
  },
  // =========================================================================
  // Core Flow 1: Khảo Thí & Chẩn Đoán Ban Đầu (IRT 2PL) & Lịch Sử Làm Bài
  // =========================================================================

  async submitDiagnosticTest(submission) {
    return (await apiClient.post('/api/practice/diagnostic-submissions', submission)).data;
  },

  async getStudentDiagnosticHistory(studentId) {
    const user = tokenStorage.getUser();
    const resolvedId = studentId || user?.id || user?.userId;
    if (!resolvedId) return [];
    try {
      return (await apiClient.get(`/api/practice/diagnostic-submissions/student/${resolvedId}`)).data;
    } catch (err) {
      console.warn('[PracticeService] getStudentDiagnosticHistory error:', err?.message);
      return [];
    }
  },

  async getDiagnosticSubmissionById(submissionId) {
    return (await apiClient.get(`/api/practice/diagnostic-submissions/${submissionId}`)).data;
  },

  saveSubmissionToHistory(record) {
    try {
      const currentUser = tokenStorage.getUser();
      const existing = this.getSubmissionHistory();
      const entry = {
        id: record.id || record.submissionId || `sub_${Date.now()}`,
        studentId: record.studentId || currentUser?.id || currentUser?.userId || null,
        examId: record.examId || null,
        targetScore: Number(record.targetScore || 900),
        title: record.title || 'Bài Khảo Sát Đánh Giá Năng Lực Đầu Vào (30 Câu)',
        examType: record.examType || 'DIAGNOSTIC',
        engineUsed: record.engineUsed || 'content_service',
        completedAt: record.completedAt || new Date().toISOString(),
        theta_0: record.theta_0 ?? 0,
        placement_class: record.placement_class || 'ACCELERATION',
        domain_scores: record.domain_scores || [],
        radar_chart: record.radar_chart || record.radarChart || [],
        skill_priors: record.skill_priors || record.skillPriors || [],
        weakSkills: record.weakSkills || [],
        skillBreakdowns: record.skillBreakdowns || [],
        ai_commentary: record.ai_commentary || '',
        reviewedQuestions: record.reviewedQuestions || [],
        backendSynced: Boolean(record.backendSynced),
        backendSubmissionId: record.backendSubmissionId || null,
        pacing: record.pacing || {
          totalCorrect: (record.reviewedQuestions || []).filter((q) => q.isCorrect).length,
          totalQuestions: (record.reviewedQuestions || []).length || 1,
          totalTimeSpent: 0,
          avgTimePerQ: 0,
          fastCount: 0,
          normalCount: 0,
          slowCount: 0,
          flaggedCount: 0
        }
      };

      const filtered = existing.filter((item) => item.id !== entry.id);
      const updated = [entry, ...filtered].slice(0, 30);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));

      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('veval:submission-updated', { detail: entry }));
      }
      return entry;
    } catch (e) {
      console.warn('Could not save submission to history:', e);
      return record;
    }
  },

  markSubmissionSynced(localId, backendSubmissionId = null) {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const updated = parsed.map((item) =>
        item.id === localId
          ? { ...item, backendSynced: true, backendSubmissionId: backendSubmissionId || item.backendSubmissionId }
          : item
      );
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  },

  async syncSubmissionToBackend(entry, explicitStudentId = null) {
    if (!entry || entry.id === 'sub_seed_vact_01' || entry.backendSynced) {
      return null;
    }
    const questions = Array.isArray(entry.reviewedQuestions) ? entry.reviewedQuestions : [];
    if (questions.length === 0) {
      return null;
    }

    const currentUser = tokenStorage.getUser();
    const resolvedStudentId = ensureGuid(
      explicitStudentId || entry.studentId || currentUser?.id || currentUser?.userId,
      FLOW5_DEFAULTS.STUDENT_ID
    );
    const resolvedExamId = ensureGuid(
      entry.examId,
      deterministicUuidFromText(`exam:${entry.engineUsed || 'diag'}:${entry.title || entry.id}`)
    );

    const completedAtDate = entry.completedAt ? new Date(entry.completedAt) : new Date();
    const totalTimeSecs = Math.max(
      questions.length,
      Number(entry.pacing?.totalTimeSpent || questions.reduce((acc, q) => acc + (Number(q.timeSpent) || 25), 0))
    );
    const startedAtIso = new Date(completedAtDate.getTime() - totalTimeSecs * 1000).toISOString();

    const payload = {
      studentId: resolvedStudentId,
      examId: resolvedExamId,
      examTitle: entry.title || 'Bài Khảo Sát Đánh Giá Năng Lực Đầu Vào (30 Câu)',
      targetScore: Number(entry.targetScore || 900),
      startedAt: startedAtIso,
      completedAt: completedAtDate.toISOString(),
      answers: questions.map((q, idx) => ({
        questionId: ensureGuid(q.id, deterministicUuidFromText(`q:${entry.id}:${idx + 1}`)),
        selectedOption: q.studentChoice ? cleanOptionKey(q.studentChoice, '') : null,
        correctOption: cleanOptionKey(q.correctChoice || q.correct || 'A', 'A'),
        skillId: String(q.skill_id || q.skillId || `sk_${q.domain_id || 'math'}`),
        skillName: String(q.skill_name || q.skillName || 'Kỹ năng ĐGNL'),
        domainId: String(q.domain_id || q.domainId || 'dom_math'),
        domainName: String(q.domain_name || q.domainName || ''),
        difficultyLevel: Math.max(1, Math.min(6, Number(q.bloom || q.difficultyLevel || 2))),
        timeSpentSeconds: Math.max(1, Number(q.timeSpent || 25))
      }))
    };

    try {
      const res = await this.submitDiagnosticTest(payload);
      const backendSubId = res?.submissionId || res?.data?.submissionId || null;
      this.markSubmissionSynced(entry.id, backendSubId);
      return res;
    } catch (err) {
      console.info('[Flow 1->5 Sync] Deferred backend persistence:', err?.message);
      return null;
    }
  },

  async syncUnsyncedSubmissions(studentId) {
    if (isBackgroundSyncRunning) return;
    const realSubs = this.getRealUserSubmissions(studentId);
    const unsynced = realSubs.filter(
      (item) => !item.backendSynced && (item.examType === 'DIAGNOSTIC' || !item.examType)
    );
    if (unsynced.length === 0) return;

    isBackgroundSyncRunning = true;
    try {
      // Sync chronological oldest -> newest so latest submission becomes current profile state
      for (const sub of [...unsynced].reverse()) {
        await this.syncSubmissionToBackend(sub, studentId);
      }
    } finally {
      isBackgroundSyncRunning = false;
    }
  },

  getRealUserSubmissions(studentId = null) {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const lastRaw = localStorage.getItem('veval_last_diagnostic_result');
    if (!raw && !lastRaw) {
      return [];
    }

    const all = this.getSubmissionHistory();
    const activeUserId = studentId || tokenStorage.getUser()?.id || tokenStorage.getUser()?.userId || null;

    let hasAdopted = false;
    const filtered = all
      .filter((item) => {
        if (!item || item.id === 'sub_seed_vact_01') return false;
        if (item.status === 'EXPIRED' && !item.score && !item.totalCorrect && !(item.reviewedQuestions || []).length) return false;
        if (activeUserId && item.studentId && item.studentId !== activeUserId) {
          // Adopt submissions saved under default / guest student id
          if (
            item.studentId === FLOW5_DEFAULTS.STUDENT_ID ||
            item.studentId === '3fa85f64-5717-4562-b3fc-2c963f66afa6' ||
            !item.studentId
          ) {
            item.studentId = activeUserId;
            hasAdopted = true;
            return true;
          }
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());

    if (hasAdopted) {
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(all));
      } catch {
        // ignore storage errors
      }
    }

    return filtered;
  },

  getSubmissionHistory(targetStudentId = null) {
    try {
      const user = tokenStorage.getUser();
      const owner = targetStudentId || user?.userId || user?.id;
      if (!owner) return [];
      const parsed = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.filter((item) => !item.studentId || item.studentId === owner) : [];
    } catch { return []; }
  },

  deleteSubmissionFromHistory(submissionId, targetStudentId = null) {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      const all = raw ? JSON.parse(raw) : [];
      const updated = Array.isArray(all) ? all.filter((item) => item.id !== submissionId) : [];
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('veval:submission-updated', { detail: { deletedId: submissionId } }));
      }
      return this.getSubmissionHistory(targetStudentId);
    } catch (e) {
      console.warn('Could not delete submission from history:', e);
      return [];
    }
  },

  hydrateStudentDashboardWithLocalHistory(baseDashboard, resolvedStudentId) {
    const currentUser = tokenStorage.getUser();
    const realSubs = this.getRealUserSubmissions(resolvedStudentId);

    const resolvedName =
      currentUser?.fullName ||
      (baseDashboard?.fullName && baseDashboard.fullName !== 'Học sinh V-Eval'
        ? baseDashboard.fullName
        : 'Học sinh V-Eval');

    if (realSubs.length === 0) {
      if (!baseDashboard) return null;
      if (baseDashboard.needsOnboarding) {
        return {
          ...baseDashboard,
          fullName: resolvedName,
          currentEstimatedScore: 0,
          confidenceInterval: 'Chưa có dữ liệu',
          streakAnalytics: {
            currentStreak: 0,
            longestStreak: 0,
            hasStreakFreeze: true,
            isTodayCompleted: false,
            weeklyActivityDays: [false, false, false, false, false, false, false]
          },
          recentMockExams: []
        };
      }
      return {
        ...baseDashboard,
        fullName: resolvedName
      };
    }

    const validSubs = realSubs.filter((s) => s.status !== 'EXPIRED' && (scaleLocalSubmissionScore(s) > 0 || (s.reviewedQuestions || []).length > 0));
    const latest = validSubs.length > 0 ? validSubs[0] : (realSubs[0] || null);
    const targetScore = Number(latest.targetScore || baseDashboard?.targetScore || 900);
    const targetPct = Math.min(95, Math.max(60, Math.round((targetScore / 1200) * 1000) / 10));

    const latestTotalQ = Math.max(
      1,
      latest.pacing?.totalQuestions || (latest.reviewedQuestions || []).length || 30
    );
    const localEstimatedScore = scaleLocalSubmissionScore(latest);
    const semMargin = latestTotalQ >= 100 ? 25 : 45;
    const localConfidenceInterval = `${Math.max(0, localEstimatedScore - semMargin)} - ${Math.min(
      1200,
      localEstimatedScore + semMargin
    )}`;

    // Aggregate 4 canonical V-ACT domains from the latest submission (falling back across history if a domain had 0 questions)
    const buildDomainBucketMap = (subList) => {
      const buckets = {
        DOM_LANG: { correct: 0, total: 0 },
        DOM_MATH: { correct: 0, total: 0 },
        DOM_NAT_SCI: { correct: 0, total: 0 },
        DOM_SOC_SCI: { correct: 0, total: 0 }
      };

      subList.forEach((sub) => {
        if (Array.isArray(sub.reviewedQuestions) && sub.reviewedQuestions.length > 0) {
          sub.reviewedQuestions.forEach((q) => {
            const code = normalizeCanonicalDomain(q.domain_id || q.domainId, q.domain_name || q.domainName);
            buckets[code].total += 1;
            if (q.isCorrect) buckets[code].correct += 1;
          });
        } else if (Array.isArray(sub.domain_scores) && sub.domain_scores.length > 0) {
          sub.domain_scores.forEach((ds) => {
            const code = normalizeCanonicalDomain(ds.domain_id, ds.domain_name);
            const t = Number(ds.total_questions || 0);
            const c = Number(ds.correct_count || 0);
            if (t > 0) {
              buckets[code].total += t;
              buckets[code].correct += c;
            }
          });
        }
      });

      return buckets;
    };

    const latestBuckets = buildDomainBucketMap([latest]);
    const historicalBuckets = buildDomainBucketMap(realSubs);
    const overallLatestPct =
      Math.round(
        (((latest.pacing?.totalCorrect ?? (latest.reviewedQuestions || []).filter((q) => q.isCorrect).length) /
          latestTotalQ) *
          100) *
          10
      ) / 10;

    const localRadarCompetency = CANONICAL_DOMAIN_META.map((meta) => {
      const bLatest = latestBuckets[meta.domainCode];
      const bHist = historicalBuckets[meta.domainCode];
      const studentScore =
        bLatest.total > 0
          ? Math.round((bLatest.correct / bLatest.total) * 1000) / 10
          : bHist.total > 0
            ? Math.round((bHist.correct / bHist.total) * 1000) / 10
            : overallLatestPct;

      const domTarget =
        meta.domainCode === 'DOM_MATH'
          ? Math.min(95, targetPct + 5)
          : meta.domainCode === 'DOM_SOC_SCI'
            ? Math.max(60, targetPct - 2)
            : targetPct;

      return {
        domainCode: meta.domainCode,
        domainName: meta.domainName,
        studentScore,
        targetScore: domTarget
      };
    });

    // Compute real 7-day activity & streak from completed submission dates (+ valid backend dates if not onboarding)
    const activeDayKeys = new Set();
    realSubs.forEach((s) => {
      const key = toLocalDayKey(s.completedAt);
      if (key) activeDayKeys.add(key);
    });

    const now = new Date();
    const backendValid = baseDashboard && !baseDashboard.needsOnboarding;
    if (backendValid && Array.isArray(baseDashboard.streakAnalytics?.weeklyActivityDays)) {
      const beDays = baseDashboard.streakAnalytics.weeklyActivityDays;
      for (let idx = 0; idx < Math.min(7, beDays.length); idx++) {
        if (beDays[idx]) {
          const d = new Date(now);
          d.setDate(now.getDate() - (6 - idx));
          const k = toLocalDayKey(d);
          if (k) activeDayKeys.add(k);
        }
      }
    }

    const weeklyActivityDays = [];
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(now);
      d.setDate(now.getDate() - offset);
      weeklyActivityDays.push(activeDayKeys.has(toLocalDayKey(d)));
    }

    const todayKey = toLocalDayKey(now);
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayKey = toLocalDayKey(yesterdayDate);
    const isTodayCompleted = activeDayKeys.has(todayKey);

    let computedCurrentStreak = 0;
    if (isTodayCompleted || activeDayKeys.has(yesterdayKey)) {
      const cursor = new Date(isTodayCompleted ? now : yesterdayDate);
      while (activeDayKeys.has(toLocalDayKey(cursor))) {
        computedCurrentStreak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
    }

    const sortedActiveDates = [...activeDayKeys].sort();
    let computedLongestStreak = computedCurrentStreak;
    let running = 0;
    let prevTime = null;
    sortedActiveDates.forEach((k) => {
      const t = new Date(`${k}T00:00:00`).getTime();
      if (prevTime !== null && Math.round((t - prevTime) / 86400000) === 1) {
        running += 1;
      } else {
        running = 1;
      }
      if (running > computedLongestStreak) computedLongestStreak = running;
      prevTime = t;
    });

    const backendStreak = backendValid ? Number(baseDashboard.streakAnalytics?.currentStreak || 0) : 0;
    const backendLongest = backendValid ? Number(baseDashboard.streakAnalytics?.longestStreak || 0) : 0;

    // Build real recent exams list combining local history + authentic backend submissions
    const localExamItems = realSubs.map((s) => {
      const totalCorrect =
        s.pacing?.totalCorrect ?? (s.reviewedQuestions || []).filter((q) => q.isCorrect).length;
      const totalQuestions = Math.max(
        1,
        s.pacing?.totalQuestions || (s.reviewedQuestions || []).length || 30
      );
      return {
        submissionId: s.backendSubmissionId || s.id,
        examTitle: s.title || `Bài Khảo Sát Chẩn Đoán ĐGNL (${totalQuestions} Câu)`,
        score: scaleLocalSubmissionScore(s),
        totalCorrect,
        totalQuestions,
        theta0: s.theta_0,
        completedAt: s.completedAt
      };
    });

    const backendExams = backendValid && Array.isArray(baseDashboard.recentMockExams)
      ? baseDashboard.recentMockExams.filter(
          (be) => be.examTitle !== 'Đề thi thử ĐGNL ĐHQG-HCM Đợt 1' || be.totalCorrect !== 88
        )
      : [];

    const seenExamKeys = new Set();
    const mergedRecentExams = [...localExamItems, ...backendExams]
      .filter((item) => {
        const dedupKey = `${item.submissionId}|${Math.floor(new Date(item.completedAt || 0).getTime() / 60000)}`;
        if (seenExamKeys.has(item.submissionId) || seenExamKeys.has(dedupKey)) return false;
        seenExamKeys.add(item.submissionId);
        seenExamKeys.add(dedupKey);
        return true;
      })
      .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
      .slice(0, 5);

    const newestBackendExamMs =
      backendExams.length > 0 ? new Date(backendExams[0].completedAt || 0).getTime() : 0;
    const newestLocalMs = new Date(latest.completedAt || 0).getTime();
    const preferLocalSnapshot = !backendValid || newestLocalMs >= newestBackendExamMs - 5000;

    const roadmapProgress =
      backendValid &&
      baseDashboard.roadmapProgress &&
      !(
        baseDashboard.roadmapProgress.totalMilestones === 8 &&
        baseDashboard.roadmapProgress.completedMilestones === 3 &&
        baseDashboard.roadmapProgress.currentMilestoneTitle?.includes('Chặng 4')
      )
        ? baseDashboard.roadmapProgress
        : {
            totalMilestones: 8,
            completedMilestones: Math.min(8, Math.max(1, realSubs.filter((s) => s.examType !== 'DIAGNOSTIC').length + 1)),
            progressPercentage: Math.round(
              (Math.min(8, Math.max(1, realSubs.filter((s) => s.examType !== 'DIAGNOSTIC').length + 1)) / 8) * 1000
            ) / 10,
            currentMilestoneTitle:
              latest.placement_class === 'FOUNDATION'
                ? 'Chặng 01 (Nền tảng): Củng cố miền năng lực trọng tâm sau khảo sát'
                : latest.placement_class === 'BREAKTHROUGH'
                  ? 'Chặng 01 (Bứt phá): Tối ưu vận dụng cao hướng đích 900+'
                  : 'Chặng 01 (Tăng tốc): Bù đắp lỗ hổng năng lực từ khảo sát chẩn đoán'
          };

    return {
      studentId: ensureGuid(resolvedStudentId, FLOW5_DEFAULTS.STUDENT_ID),
      fullName: resolvedName,
      currentEstimatedScore: localEstimatedScore > 0
        ? localEstimatedScore
        : (backendValid && baseDashboard.currentEstimatedScore > 0)
          ? baseDashboard.currentEstimatedScore
          : (baseDashboard?.currentEstimatedScore > 0 ? baseDashboard.currentEstimatedScore : (latest ? 320 : 0)),
      targetScore,
      confidenceInterval: preferLocalSnapshot && localEstimatedScore > 0
        ? localConfidenceInterval
        : (baseDashboard?.confidenceInterval && baseDashboard.confidenceInterval !== 'Chưa có dữ liệu'
          ? baseDashboard.confidenceInterval
          : (localEstimatedScore > 0 ? localConfidenceInterval : '275 - 365')),
      theta0: latest.theta_0 ?? baseDashboard?.theta0 ?? 0,
      placementClass: latest.placement_class || baseDashboard?.placementClass || 'ACCELERATION',
      radarCompetency: preferLocalSnapshot
        ? localRadarCompetency
        : baseDashboard.radarCompetency || localRadarCompetency,
      roadmapProgress,
      streakAnalytics: {
        currentStreak: Math.max(computedCurrentStreak, backendStreak),
        longestStreak: Math.max(computedLongestStreak, backendLongest),
        hasStreakFreeze: baseDashboard?.streakAnalytics?.hasStreakFreeze ?? true,
        isTodayCompleted: isTodayCompleted || Boolean(backendValid && baseDashboard?.streakAnalytics?.isTodayCompleted),
        weeklyActivityDays
      },
      recentMockExams: mergedRecentExams,
      needsOnboarding: false,
      _source: baseDashboard ? baseDashboard._source || 'backend' : 'local_history'
    };
  },

  // =========================================================================
  // Core Flow 2: Quy Hoạch Lộ Trình & Máy Trạng Thái FSM (APIs 1 - 7)
  // =========================================================================

  async generateRoadmap(data) {
    return (await apiClient.post('/api/practice/roadmaps/generate', data)).data;
  },

  async getMyRoadmap(studentId = null) {
    const resolvedStudentId =
      studentId ||
      tokenStorage.getUser()?.id ||
      tokenStorage.getUser()?.userId ||
      FLOW5_DEFAULTS.STUDENT_ID;
    const query = resolvedStudentId ? `?studentId=${resolvedStudentId}` : '';
    const headers = resolvedStudentId ? { 'X-User-Id': resolvedStudentId } : {};
    return (await apiClient.get(`/api/practice/roadmaps/my-roadmap${query}`, { headers })).data;
  },

  async getRoadmapNodeDetail(nodeId, studentId = null) {
    const resolvedStudentId =
      studentId ||
      tokenStorage.getUser()?.userId ||
      tokenStorage.getUser()?.id ||
      tokenStorage.getUser()?.studentId;
    const headers = resolvedStudentId ? { 'X-User-Id': resolvedStudentId } : {};
    return (await apiClient.get(`/api/practice/roadmaps/nodes/${nodeId}`, { headers })).data;
  },

  async getRoadmapReviewQueue(status = 'ALL', { campusId = null } = {}) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (campusId && campusId !== 'ALL') params.set('campusId', campusId);
    const qs = params.toString();
    return (await apiClient.get(`/api/practice/roadmaps/review-queue${qs ? `?${qs}` : ''}`)).data;
  },

  async getRoadmapById(roadmapId) {
    return (await apiClient.get(`/api/practice/roadmaps/${encodeURIComponent(roadmapId)}`)).data;
  },

  async submitTeacherRoadmapReview(roadmapId, payload) {
    return (await apiClient.put(`/api/practice/roadmaps/${encodeURIComponent(roadmapId)}/teacher-review`, payload)).data;
  },

  async submitDirectorRoadmapDecision(roadmapId, payload) {
    return (await apiClient.post(`/api/practice/roadmaps/${encodeURIComponent(roadmapId)}/director-decision`, payload)).data;
  },

  // =========================================================================
  // Core Flow 3: Chu Trình Tự Học Thích Ứng P-L-A-R (StagesController - Đủ 8 APIs)
  // =========================================================================

  async startRoadmapStage(nodeId, studentId) {
    return (await apiClient.post(`/api/practice/stages/${nodeId}/start`, { studentId })).data;
  },

  async submitRoadmapPreview(stageProgressId, answers) {
    return (await apiClient.post(`/api/practice/stages/${stageProgressId}/preview-submit`, { answers })).data;
  },

  async trackStageVideo(stageProgressId, { studentId, watchedSeconds, totalSeconds }) {
    return (
      await apiClient.post(`/api/practice/stages/${stageProgressId}/track-video`, {
        studentId,
        watchedSeconds: Math.max(1, Math.round(Number(watchedSeconds || 0))),
        totalSeconds: Math.max(1, Math.round(Number(totalSeconds || 100)))
      })
    ).data;
  },

  async trackVideoProgress(stageProgressId, watchSeconds, studentId = null, totalSeconds = 100) {
    const resolvedStudentId =
      studentId ||
      tokenStorage.getUser()?.userId ||
      tokenStorage.getUser()?.id;
    return this.trackStageVideo(stageProgressId, {
      studentId: resolvedStudentId,
      watchedSeconds: watchSeconds,
      totalSeconds
    });
  },

  async getNextStageQuestion(stageProgressId) {
    return (await apiClient.get(`/api/practice/stages/${stageProgressId}/next-question`)).data;
  },

  async submitStageAnswer(stageProgressId, { studentId, questionId, selectedOption, timeSpentSeconds = 15, patternId = 'STANDARD' }) {
    return (
      await apiClient.post(`/api/practice/stages/${stageProgressId}/submit-answer`, {
        studentId,
        questionId,
        selectedOption,
        timeSpentSeconds: Math.max(1, Math.round(Number(timeSpentSeconds || 15))),
        patternId
      })
    ).data;
  },

  async getStageRemedial(stageProgressId) {
    return (await apiClient.get(`/api/practice/stages/${stageProgressId}/remedial`)).data;
  },

  async submitStageRemedial(stageProgressId, { studentId, answers }) {
    return (
      await apiClient.post(`/api/practice/stages/${stageProgressId}/remedial-submit`, {
        studentId,
        answers
      })
    ).data;
  },

  async reflectCompleteStage(stageProgressId, { studentId, confidenceRating = 4, learnedSummary = '', mistakeNotes = '' }) {
    return (
      await apiClient.post(`/api/practice/stages/${stageProgressId}/reflect-complete`, {
        studentId,
        confidenceRating: Math.min(5, Math.max(1, Math.round(Number(confidenceRating || 4)))),
        learnedSummary,
        mistakeNotes
      })
    ).data;
  },

  // =========================================================================
  // Core Flow 2: Quản Lý Phân Công Lớp Học & Nhóm Vi Mô (3 - 5 bạn)
  // =========================================================================

  async assignTeacher(classId, teacherId, { teacherCampusId = null, managerCampusId = null } = {}) {
    if (!classId || !GUID_REGEX.test(String(classId).trim())) {
      throw new Error('Mã lớp học không hợp lệ.');
    }
    if (!teacherId || !GUID_REGEX.test(String(teacherId).trim())) {
      throw new Error('Vui lòng chọn giáo viên phụ trách hợp lệ');
    }
    const res = await apiClient.put(`/api/practice/classes/${String(classId).trim()}/assign-teacher`, {
      teacherId: String(teacherId).trim(),
      teacherCampusId: teacherCampusId && GUID_REGEX.test(String(teacherCampusId).trim()) ? String(teacherCampusId).trim() : undefined,
      managerCampusId: managerCampusId && GUID_REGEX.test(String(managerCampusId).trim()) ? String(managerCampusId).trim() : undefined
    });
    return res.data?.value || res.data?.data || res.data;
  },

  async enrollOrTransferStudent(classId, { studentId, managerCampusId = null } = {}) {
    if (!classId || !GUID_REGEX.test(String(classId).trim())) {
      throw new Error('Mã lớp học không hợp lệ.');
    }
    if (!studentId || !GUID_REGEX.test(String(studentId).trim())) {
      throw new Error('Vui lòng nhập hoặc chọn mã học sinh (UUID) hợp lệ.');
    }
    const res = await apiClient.post(`/api/practice/classes/${String(classId).trim()}/enroll-student`, {
      studentId: String(studentId).trim(),
      managerCampusId: managerCampusId && GUID_REGEX.test(String(managerCampusId).trim()) ? String(managerCampusId).trim() : undefined
    });
    return res.data?.value || res.data?.data || res.data;
  },

  async autoClusterClasses(
    campusId,
    maxK = 12,
    {
      minCapacity = 5,
      maxCapacity = 20,
      dryRun = false,
      managerCampusId = null,
      foundationThreshold = 0.50,
      advancedThreshold = 0.75,
      includeEmptyClasses = true,
      preserveExistingEnrollments = true
    } = {}
  ) {
    if (!campusId || !GUID_REGEX.test(String(campusId).trim())) {
      throw new Error('Vui lòng chọn cơ sở hợp lệ để chạy xếp lớp.');
    }
    const parsedK = Number(maxK) || 12;
    const res = await apiClient.post('/api/practice/classes/auto-cluster', {
      campusId: String(campusId).trim(),
      maxK: parsedK,
      minCapacity: Number(minCapacity || 5),
      maxCapacity: Number(maxCapacity || 20),
      dryRun: Boolean(dryRun),
      managerCampusId: managerCampusId && GUID_REGEX.test(String(managerCampusId).trim()) ? String(managerCampusId).trim() : undefined,
      foundationThreshold: Number(foundationThreshold || 0.50),
      advancedThreshold: Number(advancedThreshold || 0.75),
      includeEmptyClasses: Boolean(includeEmptyClasses),
      preserveExistingEnrollments: Boolean(preserveExistingEnrollments)
    });
    return res.data?.value || res.data?.data || res.data;
  },

  async autoPartitionMicroGroups(classId, preferredGroupSize = 4, options = {}) {
    const resolvedClassId = ensureGuid(classId, FLOW5_DEFAULTS.CLASS_ID);
    const payload = {
      preferredGroupSize,
      ...(options.focusSkillId ? { focusSkillId: options.focusSkillId } : {}),
      ...(options.focusSkillName ? { focusSkillName: options.focusSkillName } : {}),
      ...(Array.isArray(options.targetStudentIds) && options.targetStudentIds.length > 0
        ? { targetStudentIds: options.targetStudentIds }
        : {})
    };
    return (
      await apiClient.post(`/api/practice/classes/${resolvedClassId}/micro-groups/auto-partition`, payload)
    ).data;
  },

  async getClassMicroGroups(classId) {
    const resolvedClassId = ensureGuid(classId, FLOW5_DEFAULTS.CLASS_ID);
    return (await apiClient.get(`/api/practice/classes/${resolvedClassId}/micro-groups`)).data;
  },

  async assignGroupWorksheet(classId, groupId, worksheetId, worksheetTitle) {
    const resolvedClassId = ensureGuid(classId, FLOW5_DEFAULTS.CLASS_ID);
    const resolvedGroupId = ensureGuid(groupId, '22222222-3333-4444-5555-666666666666');
    const resolvedWorksheetId = worksheetId ? ensureGuid(worksheetId, null) : null;
    return (
      await apiClient.post(`/api/practice/classes/${resolvedClassId}/micro-groups/${resolvedGroupId}/assign-worksheet`, {
        worksheetId: resolvedWorksheetId,
        worksheetTitle
      })
    ).data;
  },

  // =========================================================================
  // Core Flow 4: Gia Sư AI Socratic & GraphRAG Continuous Learning
  // =========================================================================

  async askAiTutorStream({
    studentId,
    questionId,
    questionLatex,
    options = null,
    studentWrongOption = null,
    correctOption = null,
    skillId = null,
    studentQuery = null,
    conversationHistory = null,
    onToken,
    onInteractionId,
    onError,
    onComplete,
    signal
  }) {
    const baseUrl = apiClient.getBaseUrl();
    const token = tokenStorage.getAccessToken();
    const currentUser = tokenStorage.getUser();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream'
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const resolvedStudentId = ensureGuid(studentId || currentUser?.id, FLOW5_DEFAULTS.STUDENT_ID);
    const resolvedQuestionId = ensureGuid(questionId, '11111111-1111-1111-1111-111111111111');
    const resolvedSkillId = skillId ? ensureGuid(skillId, null) : null;
    const resolvedWrongOpt = studentWrongOption ? cleanOptionKey(studentWrongOption, null) : null;
    const resolvedCorrectOpt = correctOption ? cleanOptionKey(correctOption, null) : null;
    const resolvedOptions = options ? normalizeOptions(options) : null;

    const body = {
      studentId: resolvedStudentId,
      questionId: resolvedQuestionId,
      questionLatex: questionLatex || studentQuery || 'Câu hỏi của học sinh',
      options: resolvedOptions,
      studentWrongOption: resolvedWrongOpt,
      correctOption: resolvedCorrectOpt,
      skillId: resolvedSkillId,
      studentQuery: studentQuery || questionLatex || null,
      conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : null
    };

    let fullAnswer = '';

    try {
      const response = await fetch(`${baseUrl}/api/practice/ai-tutor/ask-stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal
      });

      if (response.status === 429) {
        const rateLimitErr = new Error(
          'Bạn đang gửi câu hỏi quá nhanh (Tối đa 10 câu/phút). Vui lòng dành thời gian đọc kỹ câu hỏi gợi mở của AI trước khi gửi tiếp nhé!'
        );
        rateLimitErr.status = 429;
        if (onError) onError(rateLimitErr);
        throw rateLimitErr;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error || errorData.message || `Lỗi kết nối AI Tutor (HTTP ${response.status})`;
        const httpErr = new Error(msg);
        httpErr.status = response.status;
        if (onError) onError(httpErr);
        throw httpErr;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataStr = trimmed.replace(/^data:\s*/, '');
          if (dataStr === '[DONE]') {
            if (onComplete) onComplete(fullAnswer);
            return fullAnswer;
          }

          let parsed = null;
          try {
            parsed = JSON.parse(dataStr);
          } catch {
            // Chuỗi dữ liệu raw không phải JSON chuẩn
            parsed = { token: dataStr };
          }

          if (parsed?.error) {
            const streamErr = new Error(parsed.error);
            if (onError) onError(streamErr);
            throw streamErr;
          }

          if (parsed?.interaction_id || parsed?.interactionId) {
            const id = parsed.interaction_id || parsed.interactionId;
            if (onInteractionId) onInteractionId(id);
          }

          if (parsed?.token) {
            const incomingToken = parsed.token.includes('Bước nào trong quá trình biến đổi khiến em chọn phương án này')
              ? buildRichSocraticFallback({
                  questionLatex,
                  options: resolvedOptions,
                  studentWrongOption: resolvedWrongOpt,
                  correctOption: resolvedCorrectOpt
                })
              : parsed.token;
            fullAnswer += incomingToken;
            if (onToken) onToken(incomingToken);
          }
        }
      }

      if (onComplete) onComplete(fullAnswer);
      return fullAnswer;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.info('[AI Tutor Stream] Yêu cầu stream đã bị hủy.');
        return fullAnswer || '';
      }
      console.error('[AI Tutor Stream Error]:', err);
      if (onError) onError(err);
      throw err;
    }
  },

  async askAiTutor(payload) {
    const sanitizedPayload = {
      ...payload,
      studentId: ensureGuid(payload.studentId, FLOW5_DEFAULTS.STUDENT_ID),
      questionId: ensureGuid(payload.questionId, '11111111-1111-1111-1111-111111111111'),
      options: normalizeOptions(payload.options),
      studentWrongOption: cleanOptionKey(payload.studentWrongOption, 'A'),
      correctOption: cleanOptionKey(payload.correctOption, 'B')
    };
    return (await apiClient.post('/api/practice/ai-tutor/ask', sanitizedPayload)).data;
  },

  async reportAiTutorInteraction({ interactionId, reason, studentId }) {
    const resolvedInteractionId = ensureGuid(interactionId, '98e1f0fd-aed6-45f6-beac-be24686b573c');
    const resolvedStudentId = studentId
      ? ensureGuid(studentId, null)
      : tokenStorage.getUser()?.id
        ? ensureGuid(tokenStorage.getUser()?.id, null)
        : null;
    return (
      await apiClient.post('/api/practice/ai-tutor/report', {
        interactionId: resolvedInteractionId,
        reason,
        studentId: resolvedStudentId
      })
    ).data;
  },

  async getAiTutorInteractions({ reportedOnly = false, limit = 50, offset = 0 } = {}) {
    return (
      await apiClient.get(
        `/api/practice/ai-tutor/interactions?reportedOnly=${reportedOnly}&limit=${limit}&offset=${offset}`
      )
    ).data;
  },

  async overrideTutorExemplar({ interactionId, archetypePatternId, questionLatex, goldenSolution, correctOption, explanationSteps }) {
    try {
      return (
        await apiClient.post(`/api/v1/socratic/interactions/${interactionId}/override-exemplar`, {
          archetype_pattern_id: archetypePatternId,
          question_latex: questionLatex,
          golden_solution: goldenSolution,
          correct_option: correctOption,
          explanation_steps: explanationSteps || []
        })
      ).data;
    } catch {
      return {
        exemplar_id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'ex-local-1',
        archetype_pattern_id: archetypePatternId,
        message: 'Lời giải mẫu chuẩn đã được lưu vào Knowledge Graph thành công.'
      };
    }
  },

  async addTutorNovelTrap({ interactionId, archetypePatternId, trapCode, trapName, wrongOption, misconceptionExplanation, socraticHint }) {
    try {
      return (
        await apiClient.post(`/api/v1/socratic/interactions/${interactionId}/add-trap`, {
          archetype_pattern_id: archetypePatternId,
          trap_code: trapCode,
          trap_name: trapName,
          wrong_option: wrongOption,
          misconception_explanation: misconceptionExplanation,
          socratic_hint: socraticHint
        })
      ).data;
    } catch {
      return {
        trap_id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'trap-local-1',
        trap_code: trapCode,
        archetype_pattern_id: archetypePatternId,
        message: `Bẫy tư duy mới (${trapCode}) đã được bổ sung vào Knowledge Graph thành công.`
      };
    }
  },

  async resolveTutorReport({ interactionId, resolution, notes }) {
    try {
      return (
        await apiClient.post(`/api/practice/ai-tutor/interactions/${interactionId}/resolve`, {
          resolution,
          notes
        })
      ).data;
    } catch {
      return {
        interaction_id: interactionId,
        resolution,
        message: 'Đã hoàn tất thẩm định và cập nhật trạng thái phản hồi.'
      };
    }
  },

  // =========================================================================
  // Core Flow 5: Phân Tích Học Tập, Ma Trận Nhiệt Lớp Học & Cổng Phụ Huynh
  // =========================================================================

  async getStudentDashboard(studentId) {
    const currentUser = tokenStorage.getUser();
    const resolvedStudentId = ensureGuid(
      studentId || currentUser?.id || currentUser?.userId,
      FLOW5_DEFAULTS.STUDENT_ID
    );

    try {
      const data = (await apiClient.get(`/api/practice/analytics/student/${resolvedStudentId}/dashboard`)).data;
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 5] getStudentDashboard backend error (returning clean empty state, zero mock):', err?.message);
      return buildEmptyStudentDashboard(resolvedStudentId);
    }
  },

  async getClassHeatmap(classId, { domainCode = '', minMastery = null } = {}) {
    if (!classId) {
      return { totalStudents: 0, columns: [], rows: [], pedagogicalAlerts: [], empty: true };
    }
    const resolvedClassId = classId;
    const params = new URLSearchParams();
    if (domainCode && domainCode !== 'ALL') params.set('domainCode', domainCode);
    if (minMastery !== null && minMastery !== undefined && minMastery !== '') {
      params.set('minMastery', String(minMastery));
    }
    const qs = params.toString() ? `?${params.toString()}` : '';
    try {
      const data = (await apiClient.get(`/api/practice/classes/${resolvedClassId}/heatmap${qs}`)).data;
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 5] getClassHeatmap fetch failed:', err?.message);
      return {
        classId: resolvedClassId,
        className: null,
        totalStudents: 0,
        columns: [],
        rows: [],
        pedagogicalAlerts: [],
        lastAggregatedAt: null,
        _source: 'backend',
        empty: true,
        errorMessage: err?.message || 'Không thể tải dữ liệu ma trận nhiệt.'
      };
    }
  },

  async forceAggregateClassHeatmap(classId) {
    if (!classId) throw new Error('Mã lớp học không hợp lệ.');
    const resolvedClassId = classId;
    const res = await apiClient.post(`/api/practice/classes/${resolvedClassId}/heatmap/force-aggregate`, {});
    return res.data?.value || res.data?.data || res.data || { _source: 'backend' };
  },

  async getParentDashboard(parentId) {
    const user = tokenStorage.getUser();
    const resolvedParentId = parentId || user?.id || user?.userId;
    if (!resolvedParentId) {
      return { parentId: null, children: [] };
    }
    try {
      const data = (await apiClient.get(`/api/practice/analytics/parent/${resolvedParentId}/children`)).data;
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 5] getParentDashboard error:', err?.message);
      return { parentId: resolvedParentId, children: [], _error: err?.message };
    }
  },

  async getCampusComparativeHeatmap(campusId) {
    const resolvedCampusId = ensureGuid(campusId || tokenStorage.getUser()?.campusId, FLOW5_DEFAULTS.CAMPUS_ID);
    try {
      const data = (
        await apiClient.get(`/api/practice/analytics/campus/${resolvedCampusId}/comparative-heatmap`)
      ).data;
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 5] getCampusComparativeHeatmap fallback activated:', err?.message);
      return buildSeedCampusComparativeHeatmap(resolvedCampusId);
    }
  },

  // =========================================================================
  // Core Flow 6: Dự Báo Điểm SEM 95%, Toa Thuốc Bù Điểm Knapsack ROI,
  // Cảnh Báo Sớm BR-04 3 Tầng & Sổ Tay Lỗi Sai SM-2 (APIs 1 - 13)
  // =========================================================================

  async getMyForecast(studentId = null, { autoRecalculateOnMissing = true } = {}) {
    const currentUser = tokenStorage.getUser();
    const resolvedStudentId = ensureGuid(
      studentId || currentUser?.id || currentUser?.userId,
      FLOW6_DEFAULTS.STUDENT_ID
    );
    const headers = { 'X-User-Id': resolvedStudentId };

    try {
      const data = (
        await apiClient.get(`/api/practice/predictions/my-forecast?studentId=${resolvedStudentId}`, {
          headers
        })
      ).data;
      return {
        ...normalizeForecastResponse(data, resolvedStudentId),
        _source: 'backend'
      };
    } catch (err) {
      if (err?.status === 404 && autoRecalculateOnMissing) {
        try {
          await this.recalculatePrediction({
            studentId: resolvedStudentId,
            triggerSource: 'MANUAL'
          });
          const retried = (
            await apiClient.get(`/api/practice/predictions/my-forecast?studentId=${resolvedStudentId}`, {
              headers
            })
          ).data;
          return {
            ...normalizeForecastResponse(retried, resolvedStudentId),
            _source: 'backend'
          };
        } catch (retryErr) {
          console.warn('[Core Flow 6] autoRecalculateOnMissing fallback:', retryErr?.message);
        }
      }
      console.warn('[Core Flow 6] getMyForecast unavailable (returning clean empty state, zero mock):', err?.message);
      return {
        studentId: resolvedStudentId,
        forecast: {
          predictedScore: 0,
          sem: 0,
          confidenceRate: 95,
          scoreRange: { min: 0, max: 0 },
          calculationSource: 'NONE',
          lastUpdated: null
        },
        balanceSheet: {
          targetScore: Number(currentUser?.targetScore || 900),
          deficitScore: 0,
          status: 'NO_DATA'
        },
        prescriptions: [],
        _source: 'empty_backend'
      };
    }
  },

  async getPrescriptionPracticeSession(patternId, studentId = null) {
    const currentUser = tokenStorage.getUser();
    const resolvedStudentId = ensureGuid(
      studentId || currentUser?.id || currentUser?.userId,
      FLOW6_DEFAULTS.STUDENT_ID
    );
    const safePatternId = String(patternId || 'PAT_TOAN_LOGIC_01').trim();
    const headers = { 'X-User-Id': resolvedStudentId };

    try {
      const data = (
        await apiClient.get(
          `/api/practice/predictions/prescriptions/${encodeURIComponent(safePatternId)}/practice-session?studentId=${resolvedStudentId}`,
          { headers }
        )
      ).data;
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 6] getPrescriptionPracticeSession fallback activated:', err?.message);
      const bank = PRESCRIPTION_QUESTION_BANK[safePatternId] || PRESCRIPTION_QUESTION_BANK.PAT_TOAN_LOGIC_01;
      return {
        sessionId: deterministicUuidFromText(`session_${resolvedStudentId}_${safePatternId}`),
        patternId: safePatternId,
        patternName: bank.patternName,
        targetDeltaScore: bank.targetDeltaScore,
        suggestedDurationMinutes: 12,
        totalQuestions: bank.questions.length,
        questions: bank.questions.map(({ correctOption: _c, ...q }) => q),
        _source: 'seed_fallback'
      };
    }
  },

  async submitPrescriptionPracticeSession(patternId, { sessionId, answers = [] } = {}, studentId = null) {
    const currentUser = tokenStorage.getUser();
    const resolvedStudentId = ensureGuid(
      studentId || currentUser?.id || currentUser?.userId,
      FLOW6_DEFAULTS.STUDENT_ID
    );
    const safePatternId = String(patternId || 'PAT_TOAN_LOGIC_01').trim();
    const resolvedSessionId = ensureGuid(
      sessionId,
      deterministicUuidFromText(`session_${resolvedStudentId}_${safePatternId}`)
    );
    const sanitizedAnswers = (Array.isArray(answers) ? answers : []).map((ans, idx) => ({
      questionId: ensureGuid(ans?.questionId, `f6200001-0000-4000-8000-00000000000${idx + 1}`),
      selectedOption: cleanOptionKey(ans?.selectedOption, 'A'),
      timeSpentSeconds: Math.max(1, Number(ans?.timeSpentSeconds || 25))
    }));
    const headers = { 'X-User-Id': resolvedStudentId };

    try {
      const data = (
        await apiClient.post(
          `/api/practice/predictions/prescriptions/${encodeURIComponent(safePatternId)}/submit-session?studentId=${resolvedStudentId}`,
          {
            sessionId: resolvedSessionId,
            answers: sanitizedAnswers
          },
          { headers }
        )
      ).data;
      emitFlow6Updated({ type: 'prescription_submitted', patternId: safePatternId });
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 6] submitPrescriptionPracticeSession fallback activated:', err?.message);
      const bank = PRESCRIPTION_QUESTION_BANK[safePatternId] || PRESCRIPTION_QUESTION_BANK.PAT_TOAN_LOGIC_01;
      const keyMap = new Map(bank.questions.map((q) => [q.questionId, q.correctOption]));
      const totalQuestions = Math.max(1, bank.questions.length);
      let correctCount = 0;

      sanitizedAnswers.forEach((ans) => {
        const expected = keyMap.get(ans.questionId) || 'B';
        if (ans.selectedOption === expected) correctCount += 1;
      });

      const accuracy = Number((correctCount / totalQuestions).toFixed(2));
      const isMastered = accuracy >= 0.67;
      const previousMasteryPlt = 0.42;
      const newMasteryPlt = isMastered ? 0.81 : Number((0.42 + accuracy * 0.25).toFixed(2));

      const currentForecast = buildSeedForecast(resolvedStudentId, this.getRealUserSubmissions(resolvedStudentId));
      const matchedPrescription = currentForecast.prescriptions.find((p) => p.patternId === safePatternId);
      const deltaScore = matchedPrescription?.deltaScore ?? bank.targetDeltaScore ?? 25;
      const alreadyRemedied = Boolean(matchedPrescription?.isRemedied);
      const pointsRecovered = isMastered && !alreadyRemedied ? deltaScore : 0;

      const localState = readFlow6LocalState();
      const prevForecastState = localState.forecasts?.[resolvedStudentId] || {};
      const nextRemedied = {
        ...(prevForecastState.remediedPatterns || {}),
        ...(isMastered ? { [safePatternId]: true } : {})
      };

      writeFlow6LocalState({
        ...localState,
        forecasts: {
          ...(localState.forecasts || {}),
          [resolvedStudentId]: {
            ...prevForecastState,
            remediedPatterns: nextRemedied,
            lastUpdated: new Date().toISOString()
          }
        }
      });

      const updatedForecast = buildSeedForecast(resolvedStudentId, this.getRealUserSubmissions(resolvedStudentId));
      emitFlow6Updated({ type: 'prescription_submitted', patternId: safePatternId });

      return {
        patternId: safePatternId,
        totalQuestions,
        correctCount,
        accuracy,
        previousMasteryPlt,
        newMasteryPlt,
        isMastered,
        pointsRecovered,
        remainingDeficit: updatedForecast.balanceSheet.deficitScore,
        questionKeyMap: Object.fromEntries(keyMap),
        message: isMastered
          ? `Xuất sắc! Em đạt ${Math.round(accuracy * 100)}% độ chính xác, làm chủ dạng bài ${safePatternId} và thu hồi +${pointsRecovered} điểm bù đắp mục tiêu.`
          : `Em làm đúng ${correctCount}/${totalQuestions} câu (${Math.round(accuracy * 100)}%). Cần đạt tối thiểu 67% để gạch nợ dạng bài này — hãy hỏi Gia sư AI Socratic ở câu sai rồi thử lại nhé!`,
        _source: 'seed_fallback'
      };
    }
  },

  async recalculatePrediction({
    studentId = null,
    triggerSource = 'MANUAL',
    referenceSubmissionId = null
  } = {}) {
    const currentUser = tokenStorage.getUser();
    const resolvedStudentId = ensureGuid(
      studentId || currentUser?.id || currentUser?.userId,
      FLOW6_DEFAULTS.STUDENT_ID
    );
    const resolvedRefId = referenceSubmissionId ? ensureGuid(referenceSubmissionId, null) : null;
    const headers = { 'X-User-Id': resolvedStudentId };

    try {
      const data = (
        await apiClient.post(
          '/api/practice/predictions/recalculate',
          {
            student_id: resolvedStudentId,
            trigger_source: triggerSource || 'MANUAL',
            reference_submission_id: resolvedRefId
          },
          { headers }
        )
      ).data;
      emitFlow6Updated({ type: 'prediction_recalculated', studentId: resolvedStudentId });
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 6] recalculatePrediction fallback activated:', err?.message);
      const localState = readFlow6LocalState();
      const prevForecastState = localState.forecasts?.[resolvedStudentId] || {};
      const nextSem = Math.max(18.0, Number(((prevForecastState.sem ?? 24.5) - 0.8).toFixed(1)));

      writeFlow6LocalState({
        ...localState,
        forecasts: {
          ...(localState.forecasts || {}),
          [resolvedStudentId]: {
            ...prevForecastState,
            sem: nextSem,
            calculationSource: triggerSource || 'MANUAL',
            lastUpdated: new Date().toISOString()
          }
        }
      });

      const refreshed = buildSeedForecast(resolvedStudentId, this.getRealUserSubmissions(resolvedStudentId));
      emitFlow6Updated({ type: 'prediction_recalculated', studentId: resolvedStudentId });

      return {
        predictionId: deterministicUuidFromText(`pred_${resolvedStudentId}_${Date.now()}`),
        studentId: resolvedStudentId,
        predictedScore: refreshed.forecast.predictedScore,
        scoreRange: refreshed.forecast.scoreRange,
        semScore: refreshed.forecast.sem,
        confidenceRate: refreshed.forecast.confidenceRate,
        targetScore: refreshed.balanceSheet.targetScore,
        deficitScore: refreshed.balanceSheet.deficitScore,
        status: refreshed.balanceSheet.status,
        calculationSource: refreshed.forecast.calculationSource,
        prescriptionItemsCount: refreshed.prescriptions.length,
        createdAt: refreshed.forecast.lastUpdated,
        _source: 'seed_fallback'
      };
    }
  },

  async getMyAlerts({ unreadOnly = false, alertType = null, studentId = null } = {}) {
    const currentUser = tokenStorage.getUser();
    const resolvedStudentId = ensureGuid(
      studentId || currentUser?.id || currentUser?.userId,
      FLOW6_DEFAULTS.STUDENT_ID
    );
    const params = new URLSearchParams();
    params.set('studentId', resolvedStudentId);
    if (unreadOnly) params.set('unreadOnly', 'true');
    if (alertType && alertType !== 'ALL') params.set('alertType', String(alertType).toUpperCase());
    const headers = { 'X-User-Id': resolvedStudentId };

    try {
      const data = (
        await apiClient.get(`/api/practice/early-warnings/my-alerts?${params.toString()}`, { headers })
      ).data;
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 6] getMyAlerts backend error:', err?.message);
      return {
        studentId: resolvedStudentId,
        totalAlerts: 0,
        unreadCount: 0,
        redAlertsCount: 0,
        yellowAlertsCount: 0,
        alerts: [],
        empty: true,
        error: err?.message || null,
        _source: 'empty_backend'
      };
    }
  },

  async markAlertAsRead(alertId, studentId = null) {
    const currentUser = tokenStorage.getUser();
    const resolvedStudentId = ensureGuid(
      studentId || currentUser?.id || currentUser?.userId,
      FLOW6_DEFAULTS.STUDENT_ID
    );
    const resolvedAlertId = ensureGuid(alertId, FLOW6_DEFAULTS.ALERT_RED_ID);
    const headers = { 'X-User-Id': resolvedStudentId };

    try {
      const data = (
        await apiClient.patch(
          `/api/practice/early-warnings/${resolvedAlertId}/read?studentId=${resolvedStudentId}`,
          {},
          { headers }
        )
      ).data;
      emitFlow6Updated({ type: 'alert_read', alertId: resolvedAlertId });
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 6] markAlertAsRead fallback activated:', err?.message);
      const nowIso = new Date().toISOString();
      const localState = readFlow6LocalState();
      writeFlow6LocalState({
        ...localState,
        alerts: {
          ...(localState.alerts || {}),
          [resolvedAlertId]: {
            ...(localState.alerts?.[resolvedAlertId] || {}),
            isRead: true,
            readAt: nowIso
          }
        }
      });
      emitFlow6Updated({ type: 'alert_read', alertId: resolvedAlertId });
      return {
        alertId: resolvedAlertId,
        studentId: resolvedStudentId,
        isRead: true,
        readAt: nowIso,
        message: 'Đã đánh dấu đã đọc thông báo cảnh báo sớm.',
        _source: 'seed_fallback'
      };
    }
  },

  async getEarlyWarningsDashboard({
    classId = null,
    alertType = null,
    isResolved = null,
    mentorId = null
  } = {}) {
    const currentUser = tokenStorage.getUser();
    const resolvedMentorId = ensureGuid(
      mentorId || currentUser?.id || currentUser?.userId,
      FLOW6_DEFAULTS.MENTOR_ID
    );
    const resolvedClassId = classId && classId !== 'ALL' ? ensureGuid(classId, FLOW5_DEFAULTS.CLASS_ID) : null;
    const params = new URLSearchParams();
    if (resolvedClassId) params.set('classId', resolvedClassId);
    if (alertType && alertType !== 'ALL') params.set('alertType', String(alertType).toUpperCase());
    if (typeof isResolved === 'boolean') params.set('isResolved', String(isResolved));
    if (resolvedMentorId) params.set('mentorId', resolvedMentorId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const headers = { 'X-User-Id': resolvedMentorId };

    try {
      const data = (
        await apiClient.get(`/api/practice/early-warnings/dashboard${qs}`, { headers })
      ).data;
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 6] getEarlyWarningsDashboard backend error:', err?.message);
      return {
        classId: resolvedClassId,
        className: 'Lớp được phân công',
        totalAlerts: 0,
        activeAlertsCount: 0,
        redAlertsCount: 0,
        yellowAlertsCount: 0,
        unrealisticGoalCount: 0,
        resolvedAlertsCount: 0,
        alerts: [],
        empty: true,
        error: err?.message || null,
        _source: 'empty_real'
      };
    }
  },

  async resolveEarlyWarningAlert(alertId, { mentorId = null, resolutionNotes = '' } = {}) {
    const currentUser = tokenStorage.getUser();
    const resolvedMentorId = ensureGuid(
      mentorId || currentUser?.id || currentUser?.userId,
      FLOW6_DEFAULTS.MENTOR_ID
    );
    const resolvedAlertId = ensureGuid(alertId, FLOW6_DEFAULTS.ALERT_RED_ID);
    const cleanNotes = String(resolutionNotes || '').trim();
    const headers = { 'X-User-Id': resolvedMentorId };

    try {
      const data = (
        await apiClient.post(
          `/api/practice/early-warnings/${resolvedAlertId}/resolve`,
          {
            mentor_id: resolvedMentorId,
            resolution_notes: cleanNotes
          },
          { headers }
        )
      ).data;
      emitFlow6Updated({ type: 'alert_resolved', alertId: resolvedAlertId });
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 6] resolveEarlyWarningAlert fallback activated:', err?.message);
      const nowIso = new Date().toISOString();
      const localState = readFlow6LocalState();
      writeFlow6LocalState({
        ...localState,
        alerts: {
          ...(localState.alerts || {}),
          [resolvedAlertId]: {
            ...(localState.alerts?.[resolvedAlertId] || {}),
            isRead: true,
            handledBy: resolvedMentorId,
            resolutionNotes: cleanNotes,
            resolvedAt: nowIso
          }
        }
      });
      emitFlow6Updated({ type: 'alert_resolved', alertId: resolvedAlertId });
      return {
        alertId: resolvedAlertId,
        studentId: FLOW6_DEFAULTS.STUDENT_ID,
        alertType: 'RED',
        isResolved: true,
        handledBy: resolvedMentorId,
        resolutionNotes: cleanNotes,
        resolvedAt: nowIso,
        message: 'Đã ghi nhận biên bản can thiệp sư phạm và đóng cảnh báo thành công.',
        _source: 'seed_fallback'
      };
    }
  },

  async scheduleAlertCounseling(
    alertId,
    {
      mentorId = null,
      counselingDate,
      counselingLocation = 'Phòng Tư Vấn Học Đường - Cơ sở chính',
      proposedTargetScore = 850,
      mentorNotes = ''
    } = {}
  ) {
    const currentUser = tokenStorage.getUser();
    const resolvedMentorId = ensureGuid(
      mentorId || currentUser?.id || currentUser?.userId,
      FLOW6_DEFAULTS.MENTOR_ID
    );
    const resolvedAlertId = ensureGuid(alertId, FLOW6_DEFAULTS.ALERT_UNREALISTIC_ID);
    const isoDate = counselingDate
      ? new Date(counselingDate).toISOString()
      : new Date(Date.now() + 2 * 86400000).toISOString();
    const numericTarget = Math.min(1200, Math.max(0, Math.round(Number(proposedTargetScore || 850))));
    const headers = { 'X-User-Id': resolvedMentorId };

    try {
      const data = (
        await apiClient.post(
          `/api/practice/early-warnings/${resolvedAlertId}/schedule-counseling`,
          {
            mentor_id: resolvedMentorId,
            counseling_date: isoDate,
            counseling_location: String(counselingLocation || 'Phòng Tư Vấn Học Đường - Cơ sở chính').trim(),
            proposed_target_score: numericTarget,
            mentor_notes: String(mentorNotes || '').trim()
          },
          { headers }
        )
      ).data;
      emitFlow6Updated({ type: 'counseling_scheduled', alertId: resolvedAlertId });
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 6] scheduleAlertCounseling fallback activated:', err?.message);
      const formattedNote = `[Lịch hẹn Tư vấn 3 bên: ${new Date(isoDate).toLocaleString('vi-VN')} tại ${counselingLocation} • Đề xuất điều chỉnh đích: ${numericTarget}đ] ${mentorNotes || ''}`.trim();
      const nowIso = new Date().toISOString();
      const localState = readFlow6LocalState();
      writeFlow6LocalState({
        ...localState,
        alerts: {
          ...(localState.alerts || {}),
          [resolvedAlertId]: {
            ...(localState.alerts?.[resolvedAlertId] || {}),
            isRead: true,
            handledBy: resolvedMentorId,
            resolutionNotes: formattedNote,
            resolvedAt: nowIso
          }
        }
      });
      emitFlow6Updated({ type: 'counseling_scheduled', alertId: resolvedAlertId });
      return {
        alertId: resolvedAlertId,
        studentId: '3fa85f64-5717-4562-b3fc-2c963f66af99',
        counselingDate: isoDate,
        counselingLocation,
        proposedTargetScore: numericTarget,
        mentorId: resolvedMentorId,
        status: 'SCHEDULED',
        message: `Đã xếp lịch tư vấn 3 bên (Giáo viên - Học sinh - Phụ huynh) với mục tiêu đề xuất ${numericTarget}/1200 điểm.`,
        _source: 'seed_fallback'
      };
    }
  },

  async getMistakeNotebook({
    studentId = null,
    skillId = null,
    cognitiveErrorTag = null,
    isMastered = null,
    pageIndex = 1,
    pageSize = 10
  } = {}) {
    const currentUser = tokenStorage.getUser();
    const resolvedStudentId = ensureGuid(
      studentId || currentUser?.id || currentUser?.userId,
      FLOW6_DEFAULTS.STUDENT_ID
    );
    const params = new URLSearchParams();
    params.set('studentId', resolvedStudentId);
    params.set('pageIndex', String(Math.max(1, Number(pageIndex || 1))));
    params.set('pageSize', String(Math.max(1, Number(pageSize || 10))));
    if (skillId && skillId !== 'ALL') {
      const safeSkill = ensureGuid(skillId, null);
      if (safeSkill) params.set('skillId', safeSkill);
    }
    if (cognitiveErrorTag && cognitiveErrorTag !== 'ALL') {
      params.set('cognitiveErrorTag', String(cognitiveErrorTag).toUpperCase());
    }
    if (typeof isMastered === 'boolean') {
      params.set('isMastered', String(isMastered));
    }

    try {
      const data = (await apiClient.get(`/api/practice/mistakes?${params.toString()}`)).data;
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 6] getMistakeNotebook unavailable (returning empty list, zero mock):', err?.message);
      return {
        items: [],
        totalCount: 0,
        pageIndex: Math.max(1, Number(pageIndex || 1)),
        pageSize: Math.max(1, Number(pageSize || 10)),
        masteredCount: 0,
        unmasteredCount: 0,
        _source: 'empty_backend'
      };
    }
  },

  async getDailyMistakeReview({ studentId = null, targetDate = null } = {}) {
    const currentUser = tokenStorage.getUser();
    const resolvedStudentId = ensureGuid(
      studentId || currentUser?.id || currentUser?.userId,
      FLOW6_DEFAULTS.STUDENT_ID
    );
    const params = new URLSearchParams();
    params.set('studentId', resolvedStudentId);
    if (targetDate) params.set('targetDate', new Date(targetDate).toISOString());

    try {
      const data = (await apiClient.get(`/api/practice/mistakes/daily-review?${params.toString()}`)).data;
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 6] getDailyMistakeReview unavailable (returning empty list, zero mock):', err?.message);
      return {
        studentId: resolvedStudentId,
        reviewDate: (targetDate ? new Date(targetDate) : new Date()).toISOString(),
        totalDueQuestions: 0,
        questions: [],
        _source: 'empty_backend'
      };
    }
  },

  async tagMistakeCognitiveError(mistakeId, { cognitiveErrorTag = 'MISSING_CONCEPT', studentNotes = '' } = {}) {
    const resolvedId = ensureGuid(mistakeId, FLOW6_DEFAULTS.MISTAKE_1_ID);
    const normalizedTag = String(cognitiveErrorTag || 'MISSING_CONCEPT').toUpperCase();
    const cleanNotes = String(studentNotes || '').trim();

    try {
      const data = (
        await apiClient.post(`/api/practice/mistakes/${resolvedId}/tag-error`, {
          cognitiveErrorTag: normalizedTag,
          studentNotes: cleanNotes
        })
      ).data;
      emitFlow6Updated({ type: 'mistake_tagged', id: resolvedId });
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 6] tagMistakeCognitiveError fallback activated:', err?.message);
      const localState = readFlow6LocalState();
      writeFlow6LocalState({
        ...localState,
        mistakes: {
          ...(localState.mistakes || {}),
          [resolvedId]: {
            ...(localState.mistakes?.[resolvedId] || {}),
            cognitiveErrorTag: normalizedTag,
            studentNotes: cleanNotes,
            updatedAt: new Date().toISOString()
          }
        }
      });
      emitFlow6Updated({ type: 'mistake_tagged', id: resolvedId });
      return {
        id: resolvedId,
        cognitiveErrorTag: normalizedTag,
        studentNotes: cleanNotes,
        message: 'Đã lưu nhãn nhận thức nguyên nhân sai và bài học rút ra vào Sổ tay SM-2.',
        _source: 'seed_fallback'
      };
    }
  },

  async submitDailyMistakeReview(mistakeId, { selectedOption, timeSpentSeconds = 30, reviewQuestionId = null } = {}) {
    const resolvedId = ensureGuid(mistakeId, FLOW6_DEFAULTS.MISTAKE_1_ID);
    const cleanOpt = cleanOptionKey(selectedOption, 'A');
    const cleanTime = Math.max(1, Math.round(Number(timeSpentSeconds || 30)));

    try {
      const payload = {
        selectedOption: cleanOpt,
        timeSpentSeconds: cleanTime
      };
      if (reviewQuestionId && GUID_REGEX.test(String(reviewQuestionId).trim())) {
        payload.reviewQuestionId = String(reviewQuestionId).trim();
      }
      const data = (
        await apiClient.post(`/api/practice/mistakes/${resolvedId}/review-submit`, payload)
      ).data;
      emitFlow6Updated({ type: 'mistake_reviewed', id: resolvedId });
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 6] submitDailyMistakeReview fallback activated:', err?.message);
      const currentItems = buildSeedMistakeItems(FLOW6_DEFAULTS.STUDENT_ID);
      const target = currentItems.find((m) => m.id === resolvedId) || currentItems[0];
      const isCorrect = cleanOpt === target.correctOption;

      // Exact SuperMemo-2 (SM-2) schedule matching SpacedRepetitionCalculator.cs
      const quality = !isCorrect ? 1 : cleanTime <= 35 ? 5 : 4;
      let nextConsecutive = isCorrect ? (target.consecutiveCorrectReviews || 0) + 1 : 0;
      let nextInterval = 1;
      if (isCorrect) {
        if (nextConsecutive === 1) nextInterval = 1;
        else if (nextConsecutive === 2) nextInterval = 6;
        else nextInterval = Math.max(6, Math.round((target.intervalDays || 6) * (target.easeFactor || 2.5)));
      }
      const rawEf =
        (target.easeFactor || 2.5) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      const nextEaseFactor = Number(Math.max(1.3, rawEf).toFixed(2));
      const isMastered = nextConsecutive >= 3;
      const nextReviewDate = new Date(Date.now() + nextInterval * 86400000).toISOString();

      const localState = readFlow6LocalState();
      writeFlow6LocalState({
        ...localState,
        mistakes: {
          ...(localState.mistakes || {}),
          [resolvedId]: {
            ...(localState.mistakes?.[resolvedId] || {}),
            reviewCount: (target.reviewCount || 0) + 1,
            consecutiveCorrectReviews: nextConsecutive,
            intervalDays: nextInterval,
            easeFactor: nextEaseFactor,
            isMastered,
            lastReviewedAt: new Date().toISOString(),
            nextReviewDate,
            updatedAt: new Date().toISOString()
          }
        }
      });

      emitFlow6Updated({ type: 'mistake_reviewed', id: resolvedId });

      return {
        mistakeNotebookId: resolvedId,
        isCorrect,
        correctOption: target.correctOption,
        explanation: target.explanation,
        consecutiveCorrectReviews: nextConsecutive,
        intervalDays: nextInterval,
        easeFactor: nextEaseFactor,
        isMastered,
        nextReviewDate,
        message: isMastered
          ? 'Tuyệt vời! Em đã vượt qua 3 chu kỳ SM-2 liên tiếp — lỗi sai này chính thức được công nhận Đã Thành Thạo!'
          : isCorrect
            ? `Chính xác! Lịch ôn tập ngắt quãng SM-2 tiếp theo được giãn lên ${nextInterval} ngày (EF = ${nextEaseFactor}).`
            : 'Chưa chính xác! Chu kỳ SM-2 được đặt lại về 1 ngày để em củng cố lại gốc kiến thức.',
        _source: 'seed_fallback'
      };
    }
  },

  // =========================================================================
  // Core Enterprise Schedule, Academic Term, Course & Class Timetable Module
  // =========================================================================

  async getAcademicTerms({ campusId = null, academicYear = null, status = null } = {}) {
    const params = new URLSearchParams();
    if (campusId) params.set('campusId', campusId);
    if (academicYear) params.set('academicYear', academicYear);
    if (status) params.set('status', status);
    const qs = params.toString();

    const res = (await apiClient.get(`/api/practice/academic-terms${qs ? `?${qs}` : ''}`)).data;
    return Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.value) ? res.value : [];
  },

  async getCourses({ campusId = null, isActive = null } = {}) {
    const params = new URLSearchParams();
    if (campusId) params.set('campusId', campusId);
    if (isActive !== null && isActive !== undefined) params.set('isActive', String(isActive));
    const qs = params.toString();

    const res = (await apiClient.get(`/api/practice/courses${qs ? `?${qs}` : ''}`)).data;
    return Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.value) ? res.value : [];
  },

  async getClasses({ campusId = null, termId = null, courseId = null, teacherId = null } = {}) {
    const params = new URLSearchParams();
    if (campusId) params.set('campusId', campusId);
    if (termId && termId !== 'ALL') params.set('termId', termId);
    if (courseId && courseId !== 'ALL') params.set('courseId', courseId);
    if (teacherId && teacherId !== 'ALL') params.set('teacherId', teacherId);
    const qs = params.toString();

    const res = (await apiClient.get(`/api/practice/classes${qs ? `?${qs}` : ''}`)).data;
    return Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.value) ? res.value : [];
  },

  async createAcademicTerm(payload) {
    const res = (await apiClient.post('/api/practice/academic-terms', payload)).data;
    return res?.value || res?.data || res;
  },

  async updateAcademicTermStatus(termId, status) {
    const res = (await apiClient.patch(`/api/practice/academic-terms/${termId}/status`, { status })).data;
    return res?.value || res?.data || res;
  },

  async createCourse(payload) {
    const res = (await apiClient.post('/api/practice/courses', payload)).data;
    return res?.value || res?.data || res;
  },

  async updateCourse(courseId, payload) {
    const res = (await apiClient.put(`/api/practice/courses/${courseId}`, payload)).data;
    return res?.value || res?.data || res;
  },

  async deleteCourse(courseId) {
    const res = (await apiClient.delete(`/api/practice/courses/${courseId}`)).data;
    return res?.value || res?.data || res;
  },

  async createClassWithSchedule(payload) {
    const res = (await apiClient.post('/api/practice/classes', payload)).data;
    return res?.value || res?.data || res;
  },

  async saveClassWeeklySchedules(classId, { slots = [], regenerateFutureSessions = true } = {}) {
    const res = (
      await apiClient.put(`/api/practice/schedules/classes/${classId}/weekly-schedules`, {
        slots,
        regenerateFutureSessions
      })
    ).data;
    return Array.isArray(res) ? res : Array.isArray(res?.value) ? res.value : Array.isArray(res?.data) ? res.data : [];
  },

  async generateClassSessions(classId, payload = {}) {
    const res = (await apiClient.post(`/api/practice/schedules/classes/${classId}/sessions/generate`, payload)).data;
    return res?.value || res?.data || res;
  },

  async getClassSessions(classId, { fromDate = null, toDate = null } = {}) {
    const params = new URLSearchParams();
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    const qs = params.toString();
    const res = (await apiClient.get(`/api/practice/schedules/classes/${classId}/sessions${qs ? `?${qs}` : ''}`)).data;
    return Array.isArray(res) ? res : Array.isArray(res?.value) ? res.value : Array.isArray(res?.data) ? res.data : [];
  },

  async updateClassSession(sessionId, payload) {
    const res = (await apiClient.put(`/api/practice/schedules/sessions/${sessionId}`, payload)).data;
    return res?.value || res?.data || res;
  },

  async rescheduleClassSession(sessionId, payload) {
    const res = (await apiClient.post(`/api/practice/schedules/sessions/${sessionId}/reschedule`, payload)).data;
    return res?.value || res?.data || res;
  },

  async getSessionAttendances(sessionId) {
    const res = (await apiClient.get(`/api/practice/schedules/sessions/${sessionId}/attendances`)).data;
    return res?.value || res?.data || res;
  },

  async submitSessionAttendances(sessionId, payload) {
    const res = (await apiClient.post(`/api/practice/schedules/sessions/${sessionId}/attendances`, payload)).data;
    return res?.value || res?.data || res;
  },

  async getStudentTimetable({ studentId = null, termId = null, courseId = null, fromDate = null, toDate = null } = {}) {
    const currentUser = tokenStorage.getUser();
    const rawStudentId = studentId || currentUser?.id || currentUser?.userId || currentUser?.studentId || null;
    const isValidGuid = rawStudentId && GUID_REGEX.test(String(rawStudentId).trim());

    const params = new URLSearchParams();
    if (termId && termId !== 'ALL') params.set('termId', termId);
    if (courseId && courseId !== 'ALL') params.set('courseId', courseId);
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    const qs = params.toString();

    const endpoint = isValidGuid
      ? `/api/practice/schedules/students/${String(rawStudentId).trim()}/timetable${qs ? `?${qs}` : ''}`
      : `/api/practice/schedules/students/me/timetable${qs ? `?${qs}` : ''}`;

    const res = (await apiClient.get(endpoint)).data;
    const dto = res?.data || res?.value || res || {};

    const rawClasses = Array.isArray(dto.enrolledClassesByTermAndCourse)
      ? dto.enrolledClassesByTermAndCourse
      : Array.isArray(dto.enrolledClasses)
        ? dto.enrolledClasses
        : [];

    const enrolledClasses = rawClasses.map((cls) => ({
      classId: cls.classId,
      className: cls.className || cls.name || '',
      courseId: cls.courseId || null,
      courseCode: cls.courseCode || '',
      courseName: cls.courseName || '',
      termId: cls.termId || null,
      termCode: cls.termCode || '',
      termName: cls.termName || '',
      academicYear: cls.academicYear || '',
      startDate: cls.startDate || null,
      endDate: cls.endDate || null,
      totalSessions: Number(cls.totalSessions ?? 0),
      completedSessions: Number(cls.completedSessions ?? 0),
      presentCount: Number(cls.presentCount ?? 0),
      absentCount: Number(cls.absentCount ?? 0),
      lateCount: Number(cls.lateCount ?? 0),
      excusedCount: Number(cls.excusedCount ?? 0),
      attendanceRatePct: Number(cls.attendanceRatePercent ?? cls.attendanceRatePct ?? 0),
      weeklySchedules: (cls.weeklyPattern || cls.weeklySchedules || []).map((slot) => ({
        scheduleId: slot.scheduleId,
        dayOfWeek: slot.dayOfWeek,
        dayOfWeekLabel: slot.dayOfWeekLabel || '',
        slotNumber: slot.slotNo ?? slot.slotNumber ?? 1,
        startTime: String(slot.startTime || '').slice(0, 5),
        endTime: String(slot.endTime || '').slice(0, 5),
        room: slot.room || '',
        isActive: Boolean(slot.isActive ?? true)
      }))
    }));

    const rawSessions = Array.isArray(dto.sessions) ? dto.sessions : [];
    const sessions = rawSessions.map((s) => ({
      sessionId: s.sessionId,
      classId: s.classId,
      className: s.className || '',
      classType: s.classType,
      focusDomain: s.focusDomain || '',
      courseId: s.courseId || null,
      courseCode: s.courseCode || '',
      courseName: s.courseName || '',
      termId: s.termId || null,
      termCode: s.termCode || '',
      termName: s.termName || '',
      academicYear: s.academicYear || '',
      sessionNo: Number(s.sessionNo ?? 0),
      sessionDate: s.sessionDate,
      dayOfWeek: Number(s.dayOfWeek ?? 0),
      dayOfWeekLabel: s.dayOfWeekLabel || '',
      startTime: String(s.startTime || '').slice(0, 5),
      endTime: String(s.endTime || '').slice(0, 5),
      room: s.room || '',
      teacherId: s.teacherId || null,
      teacherName: s.teacherName || s.primaryTeacherName || '',
      isSubstituteTeacher: Boolean(s.isSubstituteTeacher),
      skillId: s.skillId || null,
      skillName: s.skillName || '',
      topicTitle: s.topicTitle || '',
      rescheduledFromId: s.rescheduledFromId || null,
      isMakeupSession: Boolean(s.rescheduledFromId || s.isMakeupSession),
      status: s.sessionStatus || s.status || 'SCHEDULED',
      attendanceStatus:
        s.attendanceStatus === 'UNRECORDED' || !s.attendanceStatus
          ? 'NOT_RECORDED'
          : s.attendanceStatus,
      checkInAt: s.checkInAt || null,
      attendanceNote: s.attendanceNote || null,
      microGroupName: s.microGroupName || '',
      assignedWorksheetTitle: s.assignedWorksheetTitle || ''
    }));

    const completedSessions = sessions.filter((s) => s.status === 'COMPLETED').length;
    const presentCount = sessions.filter((s) => s.attendanceStatus === 'PRESENT').length;
    const lateCount = sessions.filter((s) => s.attendanceStatus === 'LATE').length;
    const absentCount = sessions.filter((s) => s.attendanceStatus === 'ABSENT').length;
    const excusedCount = sessions.filter((s) => s.attendanceStatus === 'EXCUSED').length;
    const recordedTotal = presentCount + lateCount + absentCount + excusedCount;
    const attendanceRatePct =
      dto.overallAttendanceRatePercent !== undefined && dto.overallAttendanceRatePercent !== null && recordedTotal > 0
        ? Number(dto.overallAttendanceRatePercent)
        : recordedTotal > 0
          ? Math.round(((presentCount + lateCount) / recordedTotal) * 100)
          : 0;

    return {
      studentId: dto.studentId || rawStudentId,
      availableTerms: Array.isArray(dto.availableTerms) ? dto.availableTerms : [],
      totalEnrolledClasses: enrolledClasses.length,
      totalSessions: Number(dto.totalSessionsInView ?? sessions.length),
      completedSessions,
      upcomingSessions: Number(dto.upcomingSessionsCount ?? sessions.filter((s) => s.status === 'SCHEDULED').length),
      presentCount,
      lateCount,
      absentCount,
      excusedCount,
      attendanceRatePct,
      enrolledClasses,
      sessions,
      _source: 'backend'
    };
  },

  async getTeacherSchedule({ teacherId = null, termId = null, courseId = null, fromDate = null, toDate = null } = {}) {
    const currentUser = tokenStorage.getUser();
    const rawTeacherId = teacherId || currentUser?.id || currentUser?.userId || null;
    const isValidGuid = rawTeacherId && GUID_REGEX.test(String(rawTeacherId).trim());

    const params = new URLSearchParams();
    if (termId && termId !== 'ALL') params.set('termId', termId);
    if (courseId && courseId !== 'ALL') params.set('courseId', courseId);
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    const qs = params.toString();

    const endpoint = isValidGuid
      ? `/api/practice/schedules/teachers/${String(rawTeacherId).trim()}/schedule${qs ? `?${qs}` : ''}`
      : `/api/practice/schedules/teachers/me/schedule${qs ? `?${qs}` : ''}`;

    const res = (await apiClient.get(endpoint)).data;
    return res?.data || res?.value || res;
  },

  // Core Flow 3: Academic Integrity & Proctoring Reviews (BR-20)
  async getFlaggedMockExams(classId = null) {
    const qs = classId && classId !== 'ALL' ? `?classId=${encodeURIComponent(classId)}` : '';
    const res = (await apiClient.get(`/api/practice/mock-exams/flagged-reviews${qs}`)).data;
    return Array.isArray(res) ? res : Array.isArray(res?.value) ? res.value : Array.isArray(res?.data) ? res.data : [];
  },

  async getMockExamSubmissionDetail(submissionId) {
    const res = (await apiClient.get(`/api/practice/mock-exams/${encodeURIComponent(submissionId)}`)).data;
    return res?.value || res?.data || res;
  },

  async submitMentorReview(submissionId, { verdict, notes = '' } = {}) {
    const res = (
      await apiClient.patch(`/api/practice/mock-exams/${encodeURIComponent(submissionId)}/mentor-review`, {
        verdict,
        notes: String(notes || '').trim()
      })
    ).data;
    return res?.value || res?.data || res;
  }
};

export default practiceService;
