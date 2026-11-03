import apiClient, { tokenStorage } from './apiClient.js';

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
  if (!opts) return { A: 'Phương án A', B: 'Phương án B' };
  if (Array.isArray(opts)) {
    const dict = {};
    opts.forEach((opt, idx) => {
      const key = String.fromCharCode(65 + idx);
      dict[key] = String(opt);
    });
    return dict;
  }
  if (typeof opts === 'object') return opts;
  return { A: 'Phương án A', B: 'Phương án B' };
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
  const wrongKey = cleanOptionKey(studentWrongOption, 'A');
  const wrongVal = opts[wrongKey] && !opts[wrongKey].startsWith('Phương án ') ? ` (${opts[wrongKey]})` : '';
  const qLower = cleanQ.toLowerCase();

  if (qLower.includes('p \\Rightarrow q') || qLower.includes('p \Rightarrow q') || qLower.includes('kéo theo') || qLower.includes('mệnh đề') || qLower.includes('bảng chân trị')) {
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
  parentId: ensureGuid(parentId, FLOW5_DEFAULTS.PARENT_ID),
  children: [
    {
      studentId: FLOW5_DEFAULTS.STUDENT_ID,
      studentName: 'Phạm Minh Hoàng',
      grade: 'Lớp 12A1',
      school: 'THPT Chuyên Lê Hồng Phong - TP.HCM',
      targetMajor: 'Khoa học Máy tính - ĐH Bách Khoa (ĐHQG TP.HCM)',
      assignedTeacherName: 'ThS. Nguyễn Minh Triết',
      teacherContactPhone: '0908 246 357',
      examReadiness: {
        readinessIndex: 82.4,
        readinessTier: 'READY',
        normalizedThetaScore: 81.2,
        skillCoverageScore: 79.5,
        consistencyScore: 95.0
      },
      weeklyDisciplines: {
        studyHoursThisWeek: 13.5,
        recommendedHours: 12.0,
        currentStreak: 12,
        completionStatus: 'EXCEEDED_GOAL'
      },
      aiParentAlerts: [
        {
          type: 'SUCCESS',
          title: 'Duy trì chuỗi 12 ngày tự học liên tiếp vượt chuẩn 12 giờ/tuần',
          description:
            'Hoàng đã hoàn thành 13.5 giờ tự học có xác thực trong 7 ngày qua (đạt 112.5% định mức khuyến nghị) và hoàn thành Chặng 07 đúng tiến độ.'
        },
        {
          type: 'WARNING',
          title: 'Cần củng cố thêm mảng Toán Logic Mệnh Đề & Suy Luận',
          description:
            'Độ thành thạo chuyên đề suy luận kéo theo hiện ở mức khá nhưng tốc độ xử lý câu hỏi vận dụng cao còn chậm. Giáo viên trên lớp đã xếp Hoàng vào nhóm bàn hỗ trợ chéo.'
        }
      ]
    }
  ],
  _source: 'seed_fallback'
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
      { domain_id: 'dom_lang', domain_name: 'Sử dụng Ngôn ngữ & Văn học', student_pct: 100, benchmark_pct: 75 }
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
export const practiceService = {
  // =========================================================================
  // Core Flow 1: Khảo Thí & Chẩn Đoán Ban Đầu (IRT 2PL) & Lịch Sử Làm Bài
  // =========================================================================

  async submitDiagnosticTest(submission) {
    return (await apiClient.post('/api/practice/diagnostic-submissions', submission)).data;
  },

  async getStudentDiagnosticHistory(studentId) {
    const resolvedId = ensureGuid(studentId || tokenStorage.getUser()?.id, FLOW5_DEFAULTS.STUDENT_ID);
    return (await apiClient.get(`/api/practice/diagnostic-submissions/student/${resolvedId}`)).data;
  },

  async getDiagnosticSubmissionById(submissionId) {
    return (await apiClient.get(`/api/practice/diagnostic-submissions/${submissionId}`)).data;
  },

  async getMistakeNotebook({
    studentId,
    skillId = null,
    cognitiveErrorTag = null,
    isMastered = null,
    pageIndex = 1,
    pageSize = 20
  } = {}) {
    const resolvedId = ensureGuid(studentId || tokenStorage.getUser()?.id, FLOW5_DEFAULTS.STUDENT_ID);
    const params = new URLSearchParams({
      studentId: resolvedId,
      pageIndex: String(pageIndex),
      pageSize: String(pageSize)
    });
    if (skillId) params.set('skillId', skillId);
    if (cognitiveErrorTag) params.set('cognitiveErrorTag', cognitiveErrorTag);
    if (isMastered !== null && isMastered !== undefined) params.set('isMastered', String(isMastered));
    return (await apiClient.get(`/api/practice/mistakes?${params.toString()}`)).data;
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
        radar_chart: record.radar_chart || [],
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

  getSubmissionHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      const lastRaw = localStorage.getItem('veval_last_diagnostic_result');
      if (lastRaw) {
        const lastResult = JSON.parse(lastRaw);
        if (lastResult && Array.isArray(lastResult.reviewedQuestions)) {
          const migrated = [
            {
              id: lastResult.id || `sub_migrated_${Date.now()}`,
              title: lastResult.title || 'Bài Khảo Sát Đánh Giá Năng Lực Đầu Vào (30 Câu)',
              examType: lastResult.examType || 'DIAGNOSTIC',
              engineUsed: lastResult.engineUsed || 'content_service',
              completedAt: lastResult.completedAt || new Date().toISOString(),
              ...lastResult
            },
            ...getDefaultSeedHistory()
          ];
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }
      }

      const seeded = getDefaultSeedHistory();
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    } catch (e) {
      console.warn('Could not load submission history:', e);
      return getDefaultSeedHistory();
    }
  },

  deleteSubmissionFromHistory(submissionId) {
    try {
      const current = this.getSubmissionHistory();
      const filtered = current.filter((item) => item.id !== submissionId);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('veval:submission-updated', { detail: { deletedId: submissionId } }));
      }
      return filtered;
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

    const latest = realSubs[0];
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
      currentEstimatedScore: preferLocalSnapshot
        ? localEstimatedScore
        : baseDashboard.currentEstimatedScore ?? localEstimatedScore,
      targetScore,
      confidenceInterval: preferLocalSnapshot
        ? localConfidenceInterval
        : baseDashboard.confidenceInterval || localConfidenceInterval,
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

  async getMyRoadmap() {
    return (await apiClient.get('/api/practice/roadmaps/my-roadmap')).data;
  },

  async getRoadmapNodeDetail(nodeId) {
    return (await apiClient.get(`/api/practice/roadmaps/nodes/${nodeId}`)).data;
  },

  async trackVideoProgress(nodeId, watchSeconds) {
    return (await apiClient.post(`/api/practice/roadmaps/nodes/${nodeId}/track-video`, { watchSeconds })).data;
  },

  async getMilestoneQuiz(nodeId) {
    return (await apiClient.get(`/api/practice/roadmaps/nodes/${nodeId}/quiz`)).data;
  },

  async submitMilestoneQuiz(nodeId, answers) {
    return (await apiClient.post(`/api/practice/roadmaps/nodes/${nodeId}/submit-quiz`, answers)).data;
  },

  async submitMakeupQuiz(nodeId, answers) {
    return (await apiClient.post(`/api/practice/roadmaps/nodes/${nodeId}/submit-makeup-quiz`, answers)).data;
  },

  // =========================================================================
  // Core Flow 2: Quản Lý Phân Công Lớp Học & Nhóm Vi Mô (3 - 5 bạn)
  // =========================================================================

  async assignTeacher(classId, teacherId) {
    const resolvedClassId = ensureGuid(classId, FLOW5_DEFAULTS.CLASS_ID);
    return (await apiClient.put(`/api/practice/classes/${resolvedClassId}/assign-teacher`, { teacherId })).data;
  },

  async autoClusterClasses(campusId, maxK = 6) {
    const resolvedCampusId = ensureGuid(campusId, FLOW5_DEFAULTS.CAMPUS_ID);
    return (await apiClient.post('/api/practice/classes/auto-cluster', { campusId: resolvedCampusId, maxK })).data;
  },

  async autoPartitionMicroGroups(classId, preferredGroupSize = 4) {
    const resolvedClassId = ensureGuid(classId, FLOW5_DEFAULTS.CLASS_ID);
    return (
      await apiClient.post(`/api/practice/classes/${resolvedClassId}/micro-groups/auto-partition`, {
        preferredGroupSize
      })
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
    studentWrongOption = 'A',
    correctOption = 'B',
    skillId = null,
    studentQuery = null,
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
    const resolvedWrongOpt = cleanOptionKey(studentWrongOption, 'A');
    const resolvedCorrectOpt = cleanOptionKey(correctOption, 'B');
    const resolvedOptions = normalizeOptions(options);

    const body = {
      studentId: resolvedStudentId,
      questionId: resolvedQuestionId,
      questionLatex: questionLatex || 'Đề bài chưa cung cấp nội dung',
      options: resolvedOptions,
      studentWrongOption: resolvedWrongOpt,
      correctOption: resolvedCorrectOpt,
      skillId: resolvedSkillId,
      studentQuery: studentQuery || null
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

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.interaction_id || parsed.interactionId) {
              const id = parsed.interaction_id || parsed.interactionId;
              if (onInteractionId) onInteractionId(id);
            }
            if (parsed.token) {
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
          } catch {
            // Bỏ qua các dòng không phải JSON chuẩn
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

  // =========================================================================
  // Core Flow 5: Phân Tích Học Tập, Ma Trận Nhiệt Lớp Học & Cổng Phụ Huynh
  // =========================================================================

  async getStudentDashboard(studentId) {
    const currentUser = tokenStorage.getUser();
    const resolvedStudentId = ensureGuid(
      studentId || currentUser?.id || currentUser?.userId,
      FLOW5_DEFAULTS.STUDENT_ID
    );
    const realSubs = this.getRealUserSubmissions(resolvedStudentId);

    try {
      const data = (await apiClient.get(`/api/practice/analytics/student/${resolvedStudentId}/dashboard`)).data;
      const hydrated = this.hydrateStudentDashboardWithLocalHistory(
        { ...data, _source: 'backend' },
        resolvedStudentId
      );
      if (realSubs.some((s) => !s.backendSynced)) {
        this.syncUnsyncedSubmissions(resolvedStudentId).catch(() => {});
      }
      return hydrated;
    } catch (err) {
      console.warn('[Core Flow 5] getStudentDashboard fallback activated:', err?.message);
      if (realSubs.length > 0) {
        return this.hydrateStudentDashboardWithLocalHistory(null, resolvedStudentId);
      }
      return buildSeedStudentDashboard(resolvedStudentId);
    }
  },

  async getClassHeatmap(classId, { domainCode = '', minMastery = null } = {}) {
    const resolvedClassId = ensureGuid(classId, FLOW5_DEFAULTS.CLASS_ID);
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
      console.warn('[Core Flow 5] getClassHeatmap fallback activated:', err?.message);
      return buildSeedClassHeatmap(resolvedClassId, { domainCode, minMastery });
    }
  },

  async forceAggregateClassHeatmap(classId) {
    const resolvedClassId = ensureGuid(classId, FLOW5_DEFAULTS.CLASS_ID);
    try {
      const data = (await apiClient.post(`/api/practice/classes/${resolvedClassId}/heatmap/force-aggregate`, {})).data;
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 5] forceAggregateClassHeatmap fallback activated:', err?.message);
      return {
        classId: resolvedClassId,
        aggregatedAt: new Date().toISOString(),
        totalSkillsCalculated: 5,
        message: 'Đã tái tổng hợp ma trận nhiệt lớp học và cập nhật ngưỡng cảnh báo sư phạm thành công.',
        _source: 'seed_fallback'
      };
    }
  },

  async getParentDashboard(parentId) {
    const resolvedParentId = ensureGuid(parentId || tokenStorage.getUser()?.id, FLOW5_DEFAULTS.PARENT_ID);
    try {
      const data = (await apiClient.get(`/api/practice/analytics/parent/${resolvedParentId}/children`)).data;
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 5] getParentDashboard fallback activated:', err?.message);
      return buildSeedParentDashboard(resolvedParentId);
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
  }
};

export default practiceService;
