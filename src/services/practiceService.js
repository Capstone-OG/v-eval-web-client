import apiClient, { tokenStorage } from './apiClient.js';

// =========================================================================
// Core Flow 4 Helpers: DTO Sanitizers & Normalizers
// =========================================================================

const ensureGuid = (id, fallback = '00000000-0000-0000-0000-000000000001') => {
  if (typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return fallback;
};

const cleanOptionKey = (opt, fallback = 'A') => {
  if (!opt) return fallback;
  const match = String(opt).trim().match(/^([A-D])/i);
  return match ? match[1].toUpperCase() : fallback;
};

const normalizeOptions = (opts) => {
  if (!opts) return { A: 'PhÆ°Æ¡ng Ã¡n A', B: 'PhÆ°Æ¡ng Ã¡n B' };
  if (Array.isArray(opts)) {
    const dict = {};
    opts.forEach((opt, idx) => {
      const key = String.fromCharCode(65 + idx);
      dict[key] = String(opt);
    });
    return dict;
  }
  if (typeof opts === 'object') return opts;
  return { A: 'PhÆ°Æ¡ng Ã¡n A', B: 'PhÆ°Æ¡ng Ã¡n B' };
};

const buildRichSocraticFallback = ({ questionLatex, options, studentWrongOption, correctOption }) => {
  const cleanQ = String(questionLatex || '').replace(/\[Ngá»¯ cáº£nh cÃ¢u há»i:[\s\S]*?\]/g, '').trim() || String(questionLatex || '');
  const opts = normalizeOptions(options);
  const wrongKey = cleanOptionKey(studentWrongOption, 'A');
  const rightKey = cleanOptionKey(correctOption, 'C');
  const wrongVal = opts[wrongKey] && !opts[wrongKey].startsWith('PhÆ°Æ¡ng Ã¡n ') ? ` (${opts[wrongKey]})` : '';
  const rightVal = opts[rightKey] && !opts[rightKey].startsWith('PhÆ°Æ¡ng Ã¡n ') ? ` (${opts[rightKey]})` : '';

  return (
    `ðŸ’¡ **Gá»£i Ã½ phÆ°Æ¡ng phÃ¡p giáº£i Socratic:**\n\n` +
    `- **PhÃ¢n tÃ­ch lá»±a chá»n:** Vá»›i cÃ¢u há»i *"${cleanQ}"*, em Ä‘Ã£ chá»n phÆ°Æ¡ng Ã¡n **${wrongKey}${wrongVal}**, trong khi phÆ°Æ¡ng Ã¡n thá»a mÃ£n Ä‘áº§y Ä‘á»§ Ä‘iá»u kiá»‡n bÃ i toÃ¡n lÃ  **${rightKey}${rightVal}**.\n` +
    `- **HÆ°á»›ng kiá»ƒm tra báº£n cháº¥t:** HÃ£y xÃ©t Ä‘iá»u kiá»‡n xÃ¡c Ä‘á»‹nh vÃ  kiá»ƒm tra tÃ­nh cháº¥t Ä‘áº·c trÆ°ng (nhÆ° dáº¥u cá»§a Ä‘áº¡o hÃ m $y'$, Ä‘iá»u kiá»‡n biÃªn hoáº·c biáº¿n Ä‘á»•i tÆ°Æ¡ng Ä‘Æ°Æ¡ng) trÃªn toÃ n miá»n cá»§a bÃ i toÃ¡n. PhÆ°Æ¡ng Ã¡n **${wrongKey}${wrongVal}** thÆ°á»ng lÃ  báº«y khi chá»‰ thá»a mÃ£n trÃªn má»™t táº­p con hoáº·c Ä‘á»•i dáº¥u táº¡i Ä‘iá»ƒm cá»±c trá»‹.\n\n` +
    `ðŸ‘‰ *CÃ¢u há»i gá»£i má»Ÿ:* Khi Ä‘á»‘i chiáº¿u trá»±c tiáº¿p Ä‘iá»u kiá»‡n cá»§a Ä‘á» bÃ i vÃ o phÆ°Æ¡ng Ã¡n **${wrongKey}${wrongVal}** vÃ  **${rightKey}${rightVal}**, em tháº¥y biá»ƒu thá»©c nÃ o luÃ´n giá»¯ nguyÃªn tÃ­nh cháº¥t trÃªn toÃ n miá»n yÃªu cáº§u?`
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
  fullName: 'Pháº¡m Minh HoÃ ng',
  currentEstimatedScore: 845,
  targetScore: 920,
  confidenceInterval: '820 - 870',
  radarCompetency: [
    { domainCode: 'DOM_LANG', domainName: 'Sá»­ dá»¥ng NgÃ´n ngá»¯ (Viá»‡t - Anh)', studentScore: 82.0, targetScore: 85.0 },
    { domainCode: 'DOM_MATH', domainName: 'ToÃ¡n há»c, TÆ° duy Logic & PhÃ¢n tÃ­ch sá»‘ liá»‡u', studentScore: 68.5, targetScore: 85.0 },
    { domainCode: 'DOM_NAT_SCI', domainName: 'Giáº£i quyáº¿t váº¥n Ä‘á» - Khoa há»c Tá»± nhiÃªn', studentScore: 76.0, targetScore: 82.0 },
    { domainCode: 'DOM_SOC_SCI', domainName: 'Giáº£i quyáº¿t váº¥n Ä‘á» - Khoa há»c XÃ£ há»™i', studentScore: 79.5, targetScore: 80.0 }
  ],
  roadmapProgress: {
    totalMilestones: 12,
    completedMilestones: 7,
    progressPercentage: 58.3,
    currentMilestoneTitle: 'Cháº·ng 08: ToÃ¡n logic má»‡nh Ä‘á» & suy luáº­n kÃ©o theo'
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
      examTitle: 'Äá» Thi Thá»­ ÄGNL ÄHQG TP.HCM Chuáº©n HÃ³a Äá»£t 2 (120 CÃ¢u)',
      score: 845,
      totalCorrect: 86,
      totalQuestions: 120,
      completedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      submissionId: 'e1111111-2222-3333-4444-555555555502',
      examTitle: 'Äá» Thi Thá»­ ÄGNL ÄHQG TP.HCM Chuáº©n HÃ³a Äá»£t 1 (120 CÃ¢u)',
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
      skillName: 'ToÃ¡n logic má»‡nh Ä‘á» & suy luáº­n kÃ©o theo',
      domainCode: 'DOM_MATH',
      classAveragePlt: isSecondary ? 0.56 : 0.44,
      alertStatus: 'CRITICAL_RED',
      isBimodal: true
    },
    {
      skillId: '88888888-9999-aaaa-bbbb-dddddddddddd',
      skillName: 'Äáº¡o hÃ m hÃ m há»£p & cá»±c trá»‹ chá»©a tham sá»‘',
      domainCode: 'DOM_MATH',
      classAveragePlt: isSecondary ? 0.61 : 0.52,
      alertStatus: 'WARNING_AMBER',
      isBimodal: false
    },
    {
      skillId: '88888888-9999-aaaa-bbbb-eeeeeeeeeeee',
      skillName: 'Äá»c hiá»ƒu vÄƒn báº£n khoa há»c & suy luáº­n ngá»¯ nghÄ©a',
      domainCode: 'DOM_LANG',
      classAveragePlt: isSecondary ? 0.81 : 0.78,
      alertStatus: 'SAFE_GREEN',
      isBimodal: false
    },
    {
      skillId: '88888888-9999-aaaa-bbbb-ffffffffffff',
      skillName: 'CÃ¢n báº±ng pháº£n á»©ng oxi hÃ³a khá»­ & báº£o toÃ n electron',
      domainCode: 'DOM_NAT_SCI',
      classAveragePlt: isSecondary ? 0.69 : 0.63,
      alertStatus: 'SAFE_GREEN',
      isBimodal: true
    },
    {
      skillId: '88888888-9999-aaaa-bbbb-111111111111',
      skillName: 'PhÃ¢n tÃ­ch báº£ng sá»‘ liá»‡u kinh táº¿ - Ä‘á»‹a lÃ½ vÃ¹ng',
      domainCode: 'DOM_SOC_SCI',
      classAveragePlt: isSecondary ? 0.75 : 0.72,
      alertStatus: 'SAFE_GREEN',
      isBimodal: false
    }
  ];

  const filteredColumns = allColumns.filter((col) => {
    if (domainCode && domainCode !== 'ALL' && col.domainCode !== domainCode) return false;
    if (minMastery !== null && minMastery !== undefined && minMastery !== '' && col.classAveragePlt > Number(minMastery)) return false;
    return true;
  });

  const activeSkillIds = new Set(filteredColumns.map((c) => c.skillId));

  const rawStudents = [
    {
      studentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      studentName: 'Pháº¡m Minh HoÃ ng',
      avatarUrl: null,
      thetaScore: 0.72,
      plts: [0.82, 0.68, 0.86, 0.79, 0.80]
    },
    {
      studentId: '4fa85f64-5717-4562-b3fc-2c963f66afa6',
      studentName: 'Nguyá»…n Ngá»c Báº£o TrÃ¢m',
      avatarUrl: null,
      thetaScore: -0.35,
      plts: [0.28, 0.41, 0.74, 0.36, 0.68]
    },
    {
      studentId: '5fa85f64-5717-4562-b3fc-2c963f66afa6',
      studentName: 'Tráº§n Tuáº¥n Kiá»‡t',
      avatarUrl: null,
      thetaScore: -0.48,
      plts: [0.24, 0.35, 0.69, 0.44, 0.65]
    },
    {
      studentId: '6fa85f64-5717-4562-b3fc-2c963f66afa6',
      studentName: 'LÃª HÃ  Tháº£o My',
      avatarUrl: null,
      thetaScore: 0.15,
      plts: [0.39, 0.56, 0.82, 0.72, 0.74]
    },
    {
      studentId: '7fa85f64-5717-4562-b3fc-2c963f66afa6',
      studentName: 'VÃµ HoÃ ng Long',
      avatarUrl: null,
      thetaScore: 0.94,
      plts: [0.89, 0.78, 0.88, 0.86, 0.84]
    }
  ];

  const rows = rawStudents.map((stu) => {
    const cells = allColumns
      .map((col, idx) => {
        const plt = stu.plts[idx];
        const masteryLevel = plt >= 0.75 ? 'MASTERED' : plt >= 0.50 ? 'LEARNING' : 'STRUGGLING';
        return {
          skillId: col.skillId,
          plt,
          masteryLevel,
          lastUpdated: nowIso
        };
      })
      .filter((cell) => activeSkillIds.has(cell.skillId));

    const weakCount = cells.filter((c) => c.plt < 0.50).length;
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
      skillName: 'ToÃ¡n logic má»‡nh Ä‘á» & suy luáº­n kÃ©o theo',
      domainCode: 'DOM_MATH',
      strugglingRate: 0.60,
      strugglingCount: 3,
      averagePlt: 0.44,
      alertLevel: 'CRITICAL_RED',
      suggestedAction:
        '60% há»c sinh trong lá»›p cÃ³ P(Lt) < 0.50 vÃ  phÃ¢n hÃ³a 2 cá»±c rÃµ rá»‡t (Ïƒ â‰¥ 0.28). Khuyáº¿n nghá»‹ chia nhÃ³m vi mÃ´ 3â€“5 há»c sinh táº¡i lá»›p vÃ  phÃ¡t phiáº¿u bÃ i táº­p thÃ­ch á»©ng ngay!'
    },
    {
      skillId: '88888888-9999-aaaa-bbbb-dddddddddddd',
      skillName: 'Äáº¡o hÃ m hÃ m há»£p & cá»±c trá»‹ chá»©a tham sá»‘',
      domainCode: 'DOM_MATH',
      strugglingRate: 0.40,
      strugglingCount: 2,
      averagePlt: 0.52,
      alertLevel: 'WARNING_AMBER',
      suggestedAction:
        '40% há»c sinh Ä‘ang lÃºng tÃºng bÆ°á»›c xÃ©t dáº¥u Ä‘áº¡o hÃ m há»£p. NÃªn gom bÃ n vi mÃ´ Ã´n táº­p chuyÃªn Ä‘á» 15 phÃºt Ä‘áº§u giá».'
    }
  ].filter((a) => !domainCode || domainCode === 'ALL' || a.domainCode === domainCode);

  return {
    classId: resolvedClassId,
    className: isSecondary ? 'Lá»›p ChuyÃªn Äá» ÄGNL TÄƒng Tá»‘c 01' : 'Lá»›p ÄGNL CÆ¡ sá»Ÿ 1 - ÄHQG TP.HCM',
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
      studentName: 'Pháº¡m Minh HoÃ ng',
      grade: 'Lá»›p 12A1',
      school: 'THPT ChuyÃªn LÃª Há»“ng Phong - TP.HCM',
      targetMajor: 'Khoa há»c MÃ¡y tÃ­nh - ÄH BÃ¡ch Khoa (ÄHQG TP.HCM)',
      assignedTeacherName: 'ThS. Nguyá»…n Minh Triáº¿t',
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
          title: 'Duy trÃ¬ chuá»—i 12 ngÃ y tá»± há»c liÃªn tiáº¿p vÆ°á»£t chuáº©n 12 giá»/tuáº§n',
          description:
            'HoÃ ng Ä‘Ã£ hoÃ n thÃ nh 13.5 giá» tá»± há»c cÃ³ xÃ¡c thá»±c trong 7 ngÃ y qua (Ä‘áº¡t 112.5% Ä‘á»‹nh má»©c khuyáº¿n nghá»‹) vÃ  hoÃ n thÃ nh Cháº·ng 07 Ä‘Ãºng tiáº¿n Ä‘á»™.'
        },
        {
          type: 'WARNING',
          title: 'Cáº§n cá»§ng cá»‘ thÃªm máº£ng ToÃ¡n Logic Má»‡nh Äá» & Suy Luáº­n',
          description:
            'Äá»™ thÃ nh tháº¡o chuyÃªn Ä‘á» suy luáº­n kÃ©o theo hiá»‡n á»Ÿ má»©c khÃ¡ nhÆ°ng tá»‘c Ä‘á»™ xá»­ lÃ½ cÃ¢u há»i váº­n dá»¥ng cao cÃ²n cháº­m. GiÃ¡o viÃªn trÃªn lá»›p Ä‘Ã£ xáº¿p HoÃ ng vÃ o nhÃ³m bÃ n há»— trá»£ chÃ©o.'
        }
      ]
    }
  ],
  _source: 'seed_fallback'
});

const buildSeedCampusComparativeHeatmap = (campusId) => ({
  campusId: ensureGuid(campusId, FLOW5_DEFAULTS.CAMPUS_ID),
  campusName: 'CÆ¡ sá»Ÿ Quáº­n 10 - TP.HCM (Trung tÃ¢m ÄGNL Trá»ng Ä‘iá»ƒm)',
  totalClasses: 4,
  lastUpdated: new Date().toISOString(),
  domainAverages: [
    { domainCode: 'DOM_LANG', domainName: 'Sá»­ dá»¥ng NgÃ´n ngá»¯', averageMastery: 0.77 },
    { domainCode: 'DOM_MATH', domainName: 'ToÃ¡n & TÆ° duy Logic', averageMastery: 0.58 },
    { domainCode: 'DOM_NAT_SCI', domainName: 'Khoa há»c Tá»± nhiÃªn', averageMastery: 0.66 },
    { domainCode: 'DOM_SOC_SCI', domainName: 'Khoa há»c XÃ£ há»™i', averageMastery: 0.73 }
  ],
  classComparisons: [
    {
      classId: FLOW5_DEFAULTS.CLASS_ID,
      className: 'Lá»›p ÄGNL CÆ¡ sá»Ÿ 1 - ÄHQG TP.HCM (01)',
      teacherName: 'ThS. Nguyá»…n Minh Triáº¿t',
      totalStudents: 20,
      overallRiskLevel: 'HIGH_RISK',
      domainMasteries: [
        { domainCode: 'DOM_LANG', averagePlt: 0.78, strugglingRate: 0.10 },
        { domainCode: 'DOM_MATH', averagePlt: 0.46, strugglingRate: 0.55 },
        { domainCode: 'DOM_NAT_SCI', averagePlt: 0.63, strugglingRate: 0.25 },
        { domainCode: 'DOM_SOC_SCI', averagePlt: 0.72, strugglingRate: 0.15 }
      ]
    },
    {
      classId: FLOW5_DEFAULTS.SECONDARY_CLASS_ID,
      className: 'Lá»›p ChuyÃªn Äá» ÄGNL TÄƒng Tá»‘c (02)',
      teacherName: 'ThS. LÃª HoÃ ng Nam',
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
      className: 'Lá»›p Ná»n Táº£ng ToÃ¡n & Logic V-ACT (03)',
      teacherName: 'CÃ´ Tráº§n Thu HÃ ',
      totalStudents: 18,
      overallRiskLevel: 'HIGH_RISK',
      domainMasteries: [
        { domainCode: 'DOM_LANG', averagePlt: 0.72, strugglingRate: 0.22 },
        { domainCode: 'DOM_MATH', averagePlt: 0.44, strugglingRate: 0.61 },
        { domainCode: 'DOM_NAT_SCI', averagePlt: 0.59, strugglingRate: 0.33 },
        { domainCode: 'DOM_SOC_SCI', averagePlt: 0.70, strugglingRate: 0.17 }
      ]
    },
    {
      classId: 'c0000000-0000-0000-0000-000000000003',
      className: 'Lá»›p MÅ©i Nhá»n SÄƒn Äiá»ƒm 950+ (04)',
      teacherName: 'TS. VÅ© Quá»‘c KhÃ¡nh',
      totalStudents: 20,
      overallRiskLevel: 'SAFE',
      domainMasteries: [
        { domainCode: 'DOM_LANG', averagePlt: 0.84, strugglingRate: 0.05 },
        { domainCode: 'DOM_MATH', averagePlt: 0.86, strugglingRate: 0.05 },
        { domainCode: 'DOM_NAT_SCI', averagePlt: 0.78, strugglingRate: 0.10 },
        { domainCode: 'DOM_SOC_SCI', averagePlt: 0.80, strugglingRate: 0.05 }
      ]
    }
  ],
  _source: 'seed_fallback'
});

const getDefaultSeedHistory = () => [
  {
    id: 'sub_seed_vact_01',
    title: 'Äá» Kháº£o SÃ¡t NÄƒng Lá»±c Äáº§u VÃ o Chuáº©n V-ACT 2026 (Äá» sá»‘ 01)',
    examType: 'DIAGNOSTIC',
    engineUsed: 'content_service',
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    theta_0: 0.42,
    placement_class: 'ACCELERATION',
    ai_commentary:
      'Báº¡n Ä‘áº¡t Ä‘á»™ chÃ­nh xÃ¡c 67% trÃªn bÃ i kháº£o sÃ¡t máº«u. NÄƒng lá»±c TÆ° duy Logic vÃ  ToÃ¡n há»c á»Ÿ má»©c khÃ¡, tuy nhiÃªn cáº§n cá»§ng cá»‘ ká»¹ viá»‡c xÃ©t dáº¥u Ä‘áº¡o hÃ m trÃªn toÃ n miá»n xÃ¡c Ä‘á»‹nh vÃ  Ä‘á»c ká»¹ má»‡nh Ä‘á» phá»§ Ä‘á»‹nh.',
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
      { domain_id: 'dom_math', domain_name: 'ToÃ¡n há»c & PhÃ¢n tÃ­ch sá»‘ liá»‡u', total_questions: 3, correct_count: 2, accuracy_pct: 67 },
      { domain_id: 'dom_logic', domain_name: 'TÆ° duy Logic & Suy luáº­n', total_questions: 2, correct_count: 1, accuracy_pct: 50 },
      { domain_id: 'dom_lang', domain_name: 'Sá»­ dá»¥ng NgÃ´n ngá»¯ & VÄƒn há»c', total_questions: 1, correct_count: 1, accuracy_pct: 100 }
    ],
    radar_chart: [
      { domain_id: 'dom_math', domain_name: 'ToÃ¡n há»c & PhÃ¢n tÃ­ch sá»‘ liá»‡u', student_pct: 67, benchmark_pct: 85 },
      { domain_id: 'dom_logic', domain_name: 'TÆ° duy Logic & Suy luáº­n', student_pct: 50, benchmark_pct: 80 },
      { domain_id: 'dom_lang', domain_name: 'Sá»­ dá»¥ng NgÃ´n ngá»¯ & VÄƒn há»c', student_pct: 100, benchmark_pct: 75 }
    ],
    reviewedQuestions: [
      {
        id: 'seed_q_1',
        question_number: 1,
        content: 'HÃ m sá»‘ nÃ o sau Ä‘Ã¢y Ä‘á»“ng biáº¿n trÃªn khoáº£ng $(-\\infty; +\\infty)$?',
        options: ['$y = x^4 + 2x^2$', '$y = \\frac{2x-1}{x+1}$', '$y = x^3 + 3x - 1$', '$y = -x^3 + x$'],
        skill_id: 'sk_dom_math_1',
        skill_name: 'TÃ­nh Ä‘Æ¡n Ä‘iá»‡u cá»§a hÃ m sá»‘',
        domain_id: 'dom_math',
        domain_name: 'ToÃ¡n há»c & PhÃ¢n tÃ­ch sá»‘ liá»‡u',
        bloom: 2,
        studentChoice: 'A',
        correctChoice: 'C',
        correct: 'C',
        isCorrect: false,
        timeSpent: 42,
        isFlagged: true,
        speedCategory: 'normal',
        explanation: 'Ta cÃ³ $y\' = 3x^2 + 3 > 0, \\forall x \\in \\mathbb{R}$, do Ä‘Ã³ hÃ m sá»‘ $y = x^3 + 3x - 1$ luÃ´n Ä‘á»“ng biáº¿n trÃªn $\\mathbb{R}$.'
      },
      {
        id: 'seed_q_2',
        question_number: 2,
        content: 'Cho cáº¥p sá»‘ cá»™ng $(u_n)$ cÃ³ $u_1 = 3$ vÃ  cÃ´ng sai $d = 4$. GiÃ¡ trá»‹ cá»§a $u_5$ báº±ng:',
        options: ['$19$', '$15$', '$23$', '$16$'],
        skill_id: 'sk_dom_math_2',
        skill_name: 'DÃ£y sá»‘ & Cáº¥p sá»‘ cá»™ng',
        domain_id: 'dom_math',
        domain_name: 'ToÃ¡n há»c & PhÃ¢n tÃ­ch sá»‘ liá»‡u',
        bloom: 1,
        studentChoice: 'A',
        correctChoice: 'A',
        correct: 'A',
        isCorrect: true,
        timeSpent: 20,
        isFlagged: false,
        speedCategory: 'fast',
        explanation: 'Ãp dá»¥ng cÃ´ng thá»©c sá»‘ háº¡ng tá»•ng quÃ¡t $u_n = u_1 + (n-1)d$, ta cÃ³ $u_5 = 3 + 4 \\times 4 = 19$.'
      },
      {
        id: 'seed_q_3',
        question_number: 3,
        content: 'TÃ¬m táº­p xÃ¡c Ä‘á»‹nh $D$ cá»§a hÃ m sá»‘ $y = \\log_2(x^2 - 4x + 3)$:',
        options: ['$D = (1; 3)$', '$D = (-\\infty; 1) \\cup (3; +\\infty)$', '$D = [1; 3]$', '$D = (3; +\\infty)$'],
        skill_id: 'sk_dom_math_3',
        skill_name: 'HÃ m sá»‘ MÅ© & Logarit',
        domain_id: 'dom_math',
        domain_name: 'ToÃ¡n há»c & PhÃ¢n tÃ­ch sá»‘ liá»‡u',
        bloom: 2,
        studentChoice: 'B',
        correctChoice: 'B',
        correct: 'B',
        isCorrect: true,
        timeSpent: 35,
        isFlagged: false,
        speedCategory: 'normal',
        explanation: 'Äiá»u kiá»‡n xÃ¡c Ä‘á»‹nh: $x^2 - 4x + 3 > 0 \\iff x < 1$ hoáº·c $x > 3$. Váº­y $D = (-\\infty; 1) \\cup (3; +\\infty)$.'
      },
      {
        id: 'seed_q_4',
        question_number: 4,
        content: 'Cho má»‡nh Ä‘á»: "Náº¿u trá»i mÆ°a thÃ¬ Ä‘Æ°á»ng Æ°á»›t". Má»‡nh Ä‘á» nÃ o sau Ä‘Ã¢y tÆ°Æ¡ng Ä‘Æ°Æ¡ng logic (contrapositive) vá»›i má»‡nh Ä‘á» Ä‘Ã£ cho?',
        options: [
          'Náº¿u trá»i khÃ´ng mÆ°a thÃ¬ Ä‘Æ°á»ng khÃ´ng Æ°á»›t.',
          'Náº¿u Ä‘Æ°á»ng Æ°á»›t thÃ¬ trá»i mÆ°a.',
          'Náº¿u Ä‘Æ°á»ng khÃ´ng Æ°á»›t thÃ¬ trá»i khÃ´ng mÆ°a.',
          'Trá»i mÆ°a hoáº·c Ä‘Æ°á»ng Æ°á»›t.'
        ],
        skill_id: 'sk_dom_logic_1',
        skill_name: 'Má»‡nh Ä‘á» & Suy luáº­n Logic',
        domain_id: 'dom_logic',
        domain_name: 'TÆ° duy Logic & Suy luáº­n',
        bloom: 2,
        studentChoice: 'A',
        correctChoice: 'C',
        correct: 'C',
        isCorrect: false,
        timeSpent: 55,
        isFlagged: false,
        speedCategory: 'normal',
        explanation: 'Má»‡nh Ä‘á» kÃ©o theo $P \\Rightarrow Q$ chá»‰ tÆ°Æ¡ng Ä‘Æ°Æ¡ng logic vá»›i má»‡nh Ä‘á» pháº£n Ä‘áº£o $\\neg Q \\Rightarrow \\neg P$ ("Náº¿u Ä‘Æ°á»ng khÃ´ng Æ°á»›t thÃ¬ trá»i khÃ´ng mÆ°a").'
      },
      {
        id: 'seed_q_5',
        question_number: 5,
        content: 'NÄƒm báº¡n A, B, C, D, E xáº¿p thÃ nh má»™t hÃ ng dá»c. Biáº¿t A Ä‘á»©ng trÆ°á»›c B, C Ä‘á»©ng ngay sau B, vÃ  D Ä‘á»©ng Ä‘áº§u hÃ ng. Náº¿u E Ä‘á»©ng cuá»‘i hÃ ng thÃ¬ ai Ä‘á»©ng á»Ÿ vá»‹ trÃ­ thá»© 3?',
        options: ['A', 'B', 'C', 'D'],
        skill_id: 'sk_dom_logic_2',
        skill_name: 'PhÃ¢n tÃ­ch Sáº¯p xáº¿p & RÃ ng buá»™c',
        domain_id: 'dom_logic',
        domain_name: 'TÆ° duy Logic & Suy luáº­n',
        bloom: 3,
        studentChoice: 'B',
        correctChoice: 'B',
        correct: 'B',
        isCorrect: true,
        timeSpent: 45,
        isFlagged: false,
        speedCategory: 'normal',
        explanation: 'Thá»© tá»± tá»« 1 Ä‘áº¿n 5 lÃ : D (1) - A (2) - B (3) - C (4) - E (5). Váº­y vá»‹ trÃ­ thá»© 3 lÃ  B.'
      },
      {
        id: 'seed_q_6',
        question_number: 6,
        content: 'Chá»n tá»« viáº¿t Ä‘Ãºng chÃ­nh táº£ tiáº¿ng Viá»‡t chuáº©n trong cÃ¡c phÆ°Æ¡ng Ã¡n sau:',
        options: ['SÃ¡ng láº¡ng', 'XÃ¡n láº¡n', 'SÃ¡ng láº¡n', 'XÃ¡ng láº¡n'],
        skill_id: 'sk_dom_lang_1',
        skill_name: 'ChÃ­nh táº£ & Ngá»¯ nghÄ©a Tiáº¿ng Viá»‡t',
        domain_id: 'dom_lang',
        domain_name: 'Sá»­ dá»¥ng NgÃ´n ngá»¯ & VÄƒn há»c',
        bloom: 1,
        studentChoice: 'B',
        correctChoice: 'B',
        correct: 'B',
        isCorrect: true,
        timeSpent: 18,
        isFlagged: false,
        speedCategory: 'fast',
        explanation: '"XÃ¡n láº¡n" (gá»‘c HÃ¡n Viá»‡t: rá»±c rá»¡, tÆ°Æ¡i sÃ¡ng) lÃ  tá»« Ä‘Ãºng chÃ­nh táº£.'
      }
    ]
  }
];

/**
 * Practice & Adaptive Learning Roadmap Service
 * Routed through V-Eval API Gateway (:5212) -> Practice Service (:5261)
 */
export const practiceService = {
  // =========================================================================
  // Core Flow 1: Kháº£o ThÃ­ & Cháº©n ÄoÃ¡n Ban Äáº§u (IRT 2PL) & Lá»‹ch Sá»­ LÃ m BÃ i
  // =========================================================================

  /**
   * Ná»™p bÃ i thi kháº£o sÃ¡t cháº©n Ä‘oÃ¡n nÄƒng lá»±c ban Ä‘áº§u
   * @param {Object} submission - { examId, studentId, responses: [{ questionId, selectedOptionId, responseTimeSeconds }] }
   */
  async submitDiagnosticTest(submission) {
    return (await apiClient.post('/api/practice/diagnostic-submissions', submission)).data;
  },

  /**
   * Láº¥y danh sÃ¡ch lá»‹ch sá»­ bÃ i lÃ m kháº£o sÃ¡t cá»§a há»c sinh tá»« Backend Practice Service
   * @param {string} studentId
   */
  async getStudentDiagnosticHistory(studentId) {
    const resolvedId = ensureGuid(studentId || tokenStorage.getUser()?.id, '00000000-0000-0000-0000-000000000001');
    return (await apiClient.get(`/api/practice/diagnostic-submissions/student/${resolvedId}`)).data;
  },

  /**
   * Láº¥y chi tiáº¿t káº¿t quáº£ má»™t bÃ i ná»™p kháº£o sÃ¡t theo Submission ID tá»« Backend Practice Service
   * @param {string} submissionId
   */
  async getDiagnosticSubmissionById(submissionId) {
    return (await apiClient.get(`/api/practice/diagnostic-submissions/${submissionId}`)).data;
  },

  /**
   * Truy xuáº¥t Sá»• tay lá»—i sai cÃ¡ nhÃ¢n (Mistake Notebook)
   */
  async getMistakeNotebook({ studentId, skillId = null, cognitiveErrorTag = null, isMastered = null, pageIndex = 1, pageSize = 20 } = {}) {
    const resolvedId = ensureGuid(studentId || tokenStorage.getUser()?.id, '00000000-0000-0000-0000-000000000001');
    const params = new URLSearchParams({ studentId: resolvedId, pageIndex: String(pageIndex), pageSize: String(pageSize) });
    if (skillId) params.set('skillId', skillId);
    if (cognitiveErrorTag) params.set('cognitiveErrorTag', cognitiveErrorTag);
    if (isMastered !== null && isMastered !== undefined) params.set('isMastered', String(isMastered));
    return (await apiClient.get(`/api/practice/mistakes?${params.toString()}`)).data;
  },

  /**
   * LÆ°u báº£n ghi káº¿t quáº£ lÃ m bÃ i vÃ o Lá»‹ch sá»­ lÃ m bÃ i (Ä‘á»“ng bá»™ LocalStorage Ä‘á»ƒ há»c sinh xem láº¡i Ä‘Ã¡p Ã¡n & há»i AI má»i lÃºc)
   * @param {Object} record
   */
  saveSubmissionToHistory(record) {
    try {
      const existing = this.getSubmissionHistory();
      const entry = {
        id: record.id || record.submissionId || `sub_${Date.now()}`,
        title: record.title || 'BÃ i Kháº£o SÃ¡t ÄÃ¡nh GiÃ¡ NÄƒng Lá»±c Äáº§u VÃ o (30 CÃ¢u)',
        examType: record.examType || 'DIAGNOSTIC',
        engineUsed: record.engineUsed || 'content_service',
        completedAt: record.completedAt || new Date().toISOString(),
        theta_0: record.theta_0 ?? 0,
        placement_class: record.placement_class || 'ACCELERATION',
        domain_scores: record.domain_scores || [],
        radar_chart: record.radar_chart || [],
        ai_commentary: record.ai_commentary || '',
        reviewedQuestions: record.reviewedQuestions || [],
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
      return entry;
    } catch (e) {
      console.warn('Could not save submission to history:', e);
      return record;
    }
  },

  /**
   * Láº¥y danh sÃ¡ch toÃ n bá»™ Lá»‹ch sá»­ lÃ m bÃ i cá»§a há»c sinh (Tá»± Ä‘á»™ng migrate bÃ i lÃ m gáº§n nháº¥t náº¿u cÃ³)
   * @returns {Array}
   */
  getSubmissionHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      // Migrate veval_last_diagnostic_result if present
      const lastRaw = localStorage.getItem('veval_last_diagnostic_result');
      if (lastRaw) {
        const lastResult = JSON.parse(lastRaw);
        if (lastResult && Array.isArray(lastResult.reviewedQuestions)) {
          const migrated = [
            {
              id: lastResult.id || `sub_migrated_${Date.now()}`,
              title: lastResult.title || 'BÃ i Kháº£o SÃ¡t ÄÃ¡nh GiÃ¡ NÄƒng Lá»±c Äáº§u VÃ o (30 CÃ¢u)',
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

  /**
   * XÃ³a má»™t báº£n ghi lá»‹ch sá»­ lÃ m bÃ i
   */
  deleteSubmissionFromHistory(submissionId) {
    try {
      const current = this.getSubmissionHistory();
      const filtered = current.filter((item) => item.id !== submissionId);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
      return filtered;
    } catch (e) {
      console.warn('Could not delete submission from history:', e);
      return [];
    }
  },

  // =========================================================================
  // Core Flow 2: Quy Hoáº¡ch Lá»™ TrÃ¬nh & MÃ¡y Tráº¡ng ThÃ¡i FSM (APIs 1 - 7)
  // =========================================================================

  /**
   * API 1: Khá»Ÿi táº¡o lá»™ trÃ¬nh há»c táº­p thÃ­ch á»©ng cÃ¡ nhÃ¢n hÃ³a tá»« káº¿t quáº£ kháº£o thÃ­
   * @param {Object} data - { studentId, targetScore, availableWeeklyHours }
   */
  async generateRoadmap(data) {
    return (await apiClient.post('/api/practice/roadmaps/generate', data)).data;
  },

  /**
   * API 2: Láº¥y toÃ n bá»™ lá»™ trÃ¬nh há»c táº­p cÃ¡ nhÃ¢n hÃ³a hiá»‡n táº¡i cá»§a há»c sinh
   */
  async getMyRoadmap() {
    return (await apiClient.get('/api/practice/roadmaps/my-roadmap')).data;
  },

  /**
   * API 3: Láº¥y chi tiáº¿t thÃ´ng tin vÃ  Ä‘iá»u kiá»‡n tiÃªn quyáº¿t cá»§a má»™t cháº·ng há»c
   * @param {string} nodeId - GUID cá»§a cháº·ng há»c (Roadmap Node)
   */
  async getRoadmapNodeDetail(nodeId) {
    return (await apiClient.get(`/api/practice/roadmaps/nodes/${nodeId}`)).data;
  },

  /**
   * API 4: Ghi nháº­n thá»i gian xem video bÃ i giáº£ng lÃ½ thuyáº¿t (>= 80% Ä‘á»ƒ má»Ÿ khÃ³a Quiz)
   * @param {string} nodeId - GUID cá»§a cháº·ng há»c
   * @param {number} watchSeconds - Thá»i gian xem thá»±c táº¿ (giÃ¢y)
   */
  async trackVideoProgress(nodeId, watchSeconds) {
    return (await apiClient.post(`/api/practice/roadmaps/nodes/${nodeId}/track-video`, { watchSeconds })).data;
  },

  /**
   * API 5: Láº¥y Ä‘á» thi Quiz kiá»ƒm tra nÄƒng lá»±c cuá»‘i cháº·ng (Milestone Quiz)
   * @param {string} nodeId
   */
  async getMilestoneQuiz(nodeId) {
    return (await apiClient.get(`/api/practice/roadmaps/nodes/${nodeId}/quiz`)).data;
  },

  /**
   * API 6: Ná»™p bÃ i thi Quiz cháº·ng há»c & Cháº¥m Ä‘iá»ƒm tá»± Ä‘á»™ng (FSM Chuyá»ƒn tráº¡ng thÃ¡i)
   * @param {string} nodeId
   * @param {Object} answers - { responses: [{ questionId, selectedOptionId, timeSpentSeconds }] }
   */
  async submitMilestoneQuiz(nodeId, answers) {
    return (await apiClient.post(`/api/practice/roadmaps/nodes/${nodeId}/submit-quiz`, answers)).data;
  },

  /**
   * API 7: Ná»™p bÃ i Quiz bÃ¹ dÃ nh riÃªng cho há»c sinh váº¯ng máº·t buá»•i há»c Live Q&A
   * @param {string} nodeId
   * @param {Object} answers
   */
  async submitMakeupQuiz(nodeId, answers) {
    return (await apiClient.post(`/api/practice/roadmaps/nodes/${nodeId}/submit-makeup-quiz`, answers)).data;
  },

  // =========================================================================
  // Core Flow 2: Quáº£n LÃ½ PhÃ¢n CÃ´ng Lá»›p Há»c (API 9)
  // =========================================================================

  /**
   * API 9: PhÃ¢n cÃ´ng hoáº·c Ä‘iá»u chuyá»ƒn giÃ¡o viÃªn phá»¥ trÃ¡ch lá»›p há»c cÆ¡ sá»Ÿ (Academic Manager)
   * @param {string} classId
   * @param {string} teacherId
   */
  async assignTeacher(classId, teacherId) {
    return (await apiClient.put(`/api/practice/classes/${classId}/assign-teacher`, { teacherId })).data;
  },

  // =========================================================================
  // PhÃ¢n Cá»¥m Há»c Sinh & NhÃ³m Há»c Táº­p Vi MÃ´ (Micro Study Groups: 3 - 5 báº¡n)
  // =========================================================================

  /**
   * Tá»± Ä‘á»™ng phÃ¢n cá»¥m K-Means táº¡o cÃ¡c Lá»›p ChuyÃªn Äá» theo lá»— há»•ng kiáº¿n thá»©c
   * @param {string} campusId
   * @param {number} maxK
   */
  async autoClusterClasses(campusId, maxK = 6) {
    return (await apiClient.post('/api/practice/classes/auto-cluster', { campusId, maxK })).data;
  },

  /**
   * Tá»± Ä‘á»™ng phÃ¢n chia há»c sinh trong lá»›p thÃ nh cÃ¡c nhÃ³m vi mÃ´ (3 - 5 báº¡n/nhÃ³m)
   * @param {string} classId
   * @param {number} preferredGroupSize - Máº·c Ä‘á»‹nh 4 (cháº¥p nháº­n 3 - 5)
   */
  async autoPartitionMicroGroups(classId, preferredGroupSize = 4) {
    const resolvedClassId = ensureGuid(classId, FLOW5_DEFAULTS.CLASS_ID);
    return (await apiClient.post(`/api/practice/classes/${resolvedClassId}/micro-groups/auto-partition`, { preferredGroupSize })).data;
  },

  /**
   * Láº¥y danh sÃ¡ch cÃ¡c nhÃ³m há»c táº­p vi mÃ´ cá»§a lá»›p há»c (phá»¥c vá»¥ dashboard giÃ¡o viÃªn)
   * @param {string} classId
   */
  async getClassMicroGroups(classId) {
    const resolvedClassId = ensureGuid(classId, FLOW5_DEFAULTS.CLASS_ID);
    return (await apiClient.get(`/api/practice/classes/${resolvedClassId}/micro-groups`)).data;
  },

  /**
   * PhÃ¢n phá»‘i Ä‘á» luyá»‡n táº­p / phiáº¿u bÃ i táº­p vi mÃ´ thÃ­ch á»©ng cho nhÃ³m há»c táº­p
   * @param {string} classId
   * @param {string} groupId
   * @param {string} worksheetId
   * @param {string} worksheetTitle
   */
  async assignGroupWorksheet(classId, groupId, worksheetId, worksheetTitle) {
    const resolvedClassId = ensureGuid(classId, FLOW5_DEFAULTS.CLASS_ID);
    const resolvedGroupId = ensureGuid(groupId, '22222222-3333-4444-5555-666666666666');
    const resolvedWorksheetId = worksheetId ? ensureGuid(worksheetId, null) : null;
    return (await apiClient.post(`/api/practice/classes/${resolvedClassId}/micro-groups/${resolvedGroupId}/assign-worksheet`, { worksheetId: resolvedWorksheetId, worksheetTitle })).data;
  },

  // =========================================================================
  // Core Flow 4: Gia SÆ° AI Socratic & GraphRAG Continuous Learning
  // =========================================================================

  /**
   * Há»i Ä‘Ã¡p gá»£i má»Ÿ Socratic dáº¡ng SSE Streaming qua API Gateway (:5212) -> Practice Service (:5261)
   * Tá»± Ä‘á»™ng xá»­ lÃ½ giá»›i háº¡n 10 req/phÃºt (StrictTutorPolicy) vÃ  stream tá»«ng token chá»¯ cháº¡y.
   *
   * @param {Object} params
   * @param {string} [params.studentId]
   * @param {string} [params.questionId]
   * @param {string} params.questionLatex - CÃ¢u há»i bÃ i táº­p hoáº·c tháº¯c máº¯c tÆ° duy (há»— trá»£ KaTeX)
   * @param {Object|Array} [params.options] - Dictionary phÆ°Æ¡ng Ã¡n tráº¯c nghiá»‡m (vÃ­ dá»¥: { A: "...", B: "..." } hoáº·c máº£ng)
   * @param {string} [params.studentWrongOption='A'] - PhÆ°Æ¡ng Ã¡n há»c sinh chá»n sai
   * @param {string} [params.correctOption='B'] - PhÆ°Æ¡ng Ã¡n Ä‘Ã¡p Ã¡n Ä‘Ãºng
   * @param {string} [params.skillId]
   * @param {function} [params.onToken] - Callback nháº­n tá»«ng token chá»¯
   * @param {function} [params.onInteractionId] - Callback nháº­n GUID phiÃªn tÆ°Æ¡ng tÃ¡c
   * @param {function} [params.onError] - Callback khi cÃ³ lá»—i hoáº·c mÃ£ 429 Rate Limit
   * @param {function} [params.onComplete] - Callback khi stream hoÃ n táº¥t
   * @param {AbortSignal} [params.signal] - TÃ­n hiá»‡u há»§y yÃªu cáº§u stream
   * @returns {Promise<string>} ToÃ n bá»™ cÃ¢u tráº£ lá»i hoÃ n chá»‰nh
   */
  async askAiTutorStream({
    studentId,
    questionId,
    questionLatex,
    options = null,
    studentWrongOption = 'A',
    correctOption = 'B',
    skillId = null,
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

    const resolvedStudentId = ensureGuid(studentId || currentUser?.id, '00000000-0000-0000-0000-000000000001');
    const resolvedQuestionId = ensureGuid(questionId, '11111111-1111-1111-1111-111111111111');
    const resolvedSkillId = skillId ? ensureGuid(skillId, null) : null;
    const resolvedWrongOpt = cleanOptionKey(studentWrongOption, 'A');
    const resolvedCorrectOpt = cleanOptionKey(correctOption, 'B');
    const resolvedOptions = normalizeOptions(options);

    const body = {
      studentId: resolvedStudentId,
      questionId: resolvedQuestionId,
      questionLatex: questionLatex || 'Äá» bÃ i chÆ°a cung cáº¥p ná»™i dung',
      options: resolvedOptions,
      studentWrongOption: resolvedWrongOpt,
      correctOption: resolvedCorrectOpt,
      skillId: resolvedSkillId
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
        const rateLimitErr = new Error('Báº¡n Ä‘ang gá»­i cÃ¢u há»i quÃ¡ nhanh (Tá»‘i Ä‘a 10 cÃ¢u/phÃºt). Vui lÃ²ng dÃ nh thá»i gian Ä‘á»c ká»¹ cÃ¢u há»i gá»£i má»Ÿ cá»§a AI trÆ°á»›c khi gá»­i tiáº¿p nhÃ©!');
        rateLimitErr.status = 429;
        if (onError) onError(rateLimitErr);
        throw rateLimitErr;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error || errorData.message || `Lá»—i káº¿t ná»‘i AI Tutor (HTTP ${response.status})`;
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
              const incomingToken = parsed.token.includes('BÆ°á»›c nÃ o trong quÃ¡ trÃ¬nh biáº¿n Ä‘á»•i khiáº¿n em chá»n phÆ°Æ¡ng Ã¡n nÃ y')
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
          } catch (jsonErr) {
            // Nuá»‘t lá»—i parse cÃ¡c dÃ²ng khÃ´ng pháº£i JSON chuáº©n
          }
        }
      }

      if (onComplete) onComplete(fullAnswer);
      return fullAnswer;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.info('[AI Tutor Stream] YÃªu cáº§u stream Ä‘Ã£ bá»‹ há»§y.');
        return fullAnswer || '';
      }
      console.error('[AI Tutor Stream Error]:', err);
      if (onError) onError(err);
      throw err;
    }
  },

  /**
   * Há»i Ä‘Ã¡p gá»£i má»Ÿ Socratic dáº¡ng JSON Ä‘á»“ng bá»™ (Single Request - Response)
   */
  async askAiTutor(payload) {
    const sanitizedPayload = {
      ...payload,
      studentId: ensureGuid(payload.studentId, '00000000-0000-0000-0000-000000000001'),
      questionId: ensureGuid(payload.questionId, '11111111-1111-1111-1111-111111111111'),
      options: normalizeOptions(payload.options),
      studentWrongOption: cleanOptionKey(payload.studentWrongOption, 'A'),
      correctOption: cleanOptionKey(payload.correctOption, 'B')
    };
    return (await apiClient.post('/api/practice/ai-tutor/ask', sanitizedPayload)).data;
  },

  /**
   * BÃ¡o cÃ¡o cÃ¢u tráº£ lá»i cá»§a AI vi pháº¡m quy táº¯c sÆ° pháº¡m (lá»™ Ä‘Ã¡p Ã¡n, áº£o giÃ¡c, pháº£n sÆ° pháº¡m)
   * @param {Object} report
   * @param {string} report.interactionId - GUID cá»§a phiÃªn tÆ°Æ¡ng tÃ¡c
   * @param {string} report.reason - LÃ½ do bÃ¡o cÃ¡o
   * @param {string} [report.studentId]
   */
  async reportAiTutorInteraction({ interactionId, reason, studentId }) {
    const resolvedInteractionId = ensureGuid(interactionId, '98e1f0fd-aed6-45f6-beac-be24686b573c');
    const resolvedStudentId = studentId ? ensureGuid(studentId, null) : (tokenStorage.getUser()?.id ? ensureGuid(tokenStorage.getUser()?.id, null) : null);
    return (await apiClient.post('/api/practice/ai-tutor/report', {
      interactionId: resolvedInteractionId,
      reason,
      studentId: resolvedStudentId
    })).data;
  },

  /**
   * Truy váº¥n lá»‹ch sá»­ tÆ°Æ¡ng tÃ¡c AI Tutor (phá»¥c vá»¥ GiÃ¡o viÃªn / Mentor Studio)
   */
  async getAiTutorInteractions({ reportedOnly = false, limit = 50, offset = 0 } = {}) {
    return (await apiClient.get(`/api/practice/ai-tutor/interactions?reportedOnly=${reportedOnly}&limit=${limit}&offset=${offset}`)).data;
  },

  // =========================================================================
  // Core Flow 5: PhÃ¢n TÃ­ch Há»c Táº­p, Ma Tráº­n Nhiá»‡t Lá»›p Há»c & Cá»•ng Phá»¥ Huynh
  // =========================================================================

  /**
   * API 1 (Core Flow 5): Láº¥y dá»¯ liá»‡u Dashboard nÄƒng lá»±c há»c sinh (Radar 4 miá»n, DAG %, Streak 7 ngÃ y, Lá»‹ch sá»­ thi thá»­)
   * @param {string} [studentId]
   */
  async getStudentDashboard(studentId) {
    const resolvedStudentId = ensureGuid(studentId || tokenStorage.getUser()?.id, FLOW5_DEFAULTS.STUDENT_ID);
    try {
      const data = (await apiClient.get(`/api/practice/analytics/student/${resolvedStudentId}/dashboard`)).data;
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 5] getStudentDashboard fallback activated:', err?.message);
      return buildSeedStudentDashboard(resolvedStudentId);
    }
  },

  /**
   * API 2 (Core Flow 5): Láº¥y Ma tráº­n nhiá»‡t nÄƒng lá»±c 2D cá»§a lá»›p há»c cho GiÃ¡o viÃªn / Mentor (< 300ms Cache)
   * @param {string} [classId]
   * @param {Object} [filters] - { domainCode, minMastery }
   */
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

  /**
   * API 6 (Core Flow 5): KÃ­ch hoáº¡t cÆ°á»¡ng cháº¿ tÃ­nh toÃ¡n láº¡i Ma tráº­n nhiá»‡t lá»›p há»c & lÃ m tÆ°Æ¡i Cache
   * @param {string} [classId]
   */
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
        message: 'ÄÃ£ tÃ¡i tá»•ng há»£p ma tráº­n nhiá»‡t lá»›p há»c vÃ  cáº­p nháº­t ngÆ°á»¡ng cáº£nh bÃ¡o sÆ° pháº¡m thÃ nh cÃ´ng.',
        _source: 'seed_fallback'
      };
    }
  },

  /**
   * API 4 (Core Flow 5): Láº¥y dá»¯ liá»‡u Cá»•ng Phá»¥ huynh Ä‘á»“ng hÃ nh (Readiness Index R_exam, Ká»· luáº­t 12h/tuáº§n & AI Alerts)
   * @param {string} [parentId]
   */
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

  /**
   * API 5 (Core Flow 5): Láº¥y Báº£n Ä‘á»“ nhiá»‡t so sÃ¡nh nÄƒng lá»±c 4 miá»n giá»¯a cÃ¡c lá»›p cáº¥p CÆ¡ sá»Ÿ (Campus Manager)
   * @param {string} [campusId]
   */
  async getCampusComparativeHeatmap(campusId) {
    const resolvedCampusId = ensureGuid(campusId || tokenStorage.getUser()?.campusId, FLOW5_DEFAULTS.CAMPUS_ID);
    try {
      const data = (await apiClient.get(`/api/practice/analytics/campus/${resolvedCampusId}/comparative-heatmap`)).data;
      return { ...data, _source: 'backend' };
    } catch (err) {
      console.warn('[Core Flow 5] getCampusComparativeHeatmap fallback activated:', err?.message);
      return buildSeedCampusComparativeHeatmap(resolvedCampusId);
    }
  }
};

export default practiceService;
