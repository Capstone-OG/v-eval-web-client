/**
 * Exam Curriculum Node Auto-Mapper & Blueprint Analytics Engine
 * Maps extracted exam questions onto the real 4-level Competency & Curriculum Tree:
 *   CompetencyDomain -> Chapter -> Lesson -> Pattern (SkillId GUID)
 */

import { BLOOM_LEVELS } from './examParserUtils.js';

const STOP_WORDS = new Set([
  'cua', 'va', 'la', 'cac', 'cho', 'trong', 'khi', 'sau', 'day', 'nao', 'duoi',
  'theo', 'voi', 'mot', 'nhung', 'duoc', 'khong', 'co', 'bang', 'tu', 'den',
  'chuong', 'bai', 'dang', 'lop', 'cau', 'hoi', 'tong', 'hop', 'trac', 'nghiem',
  'hay', 'tim', 'tinh', 'biet', 'gia', 'tri', 'sau', 'day', 'nhu', 'the', 've',
  'cung', 'chi', 'mot', 'hai', 'ba', 'bon', 'nam', 'sau', 'bay', 'tam', 'chin',
  'muoi', 'phan', 'muc', 'phuong', 'an', 'dung', 'sai', 'chinh', 'xac', 'nhat'
]);

const SUBJECT_SIGNALS = {
  MATH: [
    'ham so', 'dao ham', 'tich phan', 'nguyen ham', 'cuc tri', 'cuc dai', 'cuc tieu',
    'tiem can', 'logarit', 'log', 'ln', 'so mu', 'ham so mu', 'phuong trinh', 'bat phuong trinh',
    'vo nghiem', 'co nghiem', 'tham so', 'tap hop', 'menh de', 'lien tuc', 'dien tich',
    'hinh phang', 'truc hoanh', 'goc toa do', 'luong giac', 'cap so cong', 'cap so nhan',
    'xac suat', 'to hop', 'chinh hop', 'hoan vi', 'vecto', 'oxyz', 'mat phang', 'mat cau',
    'hinh chop', 'hinh lang tru', 'hinh non', 'hinh tru', 'gioi han', 'lim', 'sin', 'cos',
    'tan', 'so phuc', 'parabol', 'elip', 'so nguyen', 'thi tran', 'tuyen duong'
  ],
  PHYS: [
    'dao dong', 'con lac', 'lo xo', 'song co', 'giao thoa', 'song dung', 'song am',
    'dien truong', 'tu dien', 'dien tro', 'dong dien', 'cam ung dien tu', 'tu truong',
    'lorentz', 'xoay chieu', 'rlc', 'may bien ap', 'truyen tai dien', 'quang pho',
    'anh sang', 'thau kinh', 'luong tu', 'hat nhan', 'phong xa', 'khi li tuong',
    'nhiet dung', 'dong luong', 'dong nang', 'the nang', 'gia toc', 'van toc', 'chu ki', 'tan so'
  ],
  CHEM: [
    'ester', 'este', 'lipid', 'chat beo', 'xa phong hoa', 'carbohydrate', 'glucozo',
    'glucose', 'fructose', 'saccharose', 'tinh bot', 'cellulose', 'amine', 'amin',
    'amino acid', 'peptide', 'peptit', 'protein', 'polymer', 'polime', 'kim loai',
    'dien phan', 'pin dien', 'an mon', 'alkane', 'ankan', 'alkene', 'anken', 'alkyne',
    'alcohol', 'ancol', 'phenol', 'aldehyde', 'ketone', 'carboxylic', 'acid', 'axit',
    'bazo', 'muoi', 'so mol', 'nong do', 'can bang hoa hoc', 'toc do phan ung', 'orbital',
    'electron', 'oxi hoa', 'chat khu', 'enthalpy', 'do ph', 'naoh', 'hcl', 'h2so4', 'nh3'
  ],
  BIOL: [
    'te bao', 'quang hop', 'ho hap', 'adn', 'dna', 'arn', 'rna', 'dot bien',
    'nhiem sac the', 'nst', 'nguyen phan', 'giam phan', 'menden', 'di truyen',
    'hoan vi gen', 'lien ket gen', 'quan the', 'hardy', 'tien hoa', 'sinh thai',
    'he sinh thai', 'chuoi thuc an', 'mien dich', 'tuan hoan', 'than kinh', 'pha he',
    'nhom mau', 'operon', 'codon', 'phien ma', 'dich ma', 'da boi', 'lech boi',
    'nghiem thuc', 'mang te bao', 'khuech tan', 'sac to'
  ],
  VIET: [
    'doc hieu', 'van ban', 'bai tho', 'tho hien dai', 'truyen ngan', 'tieu thuyet',
    'tac gia', 'tac pham', 'bien phap tu tu', 'an du', 'hoan du', 'nhan hoa', 'so sanh',
    'nghi luan', 'phong cach ngon ngu', 'chinh ta', 'ngu phap tieng viet', 'tu lay',
    'tu ghep', 'tu han viet', 'thanh ngu', 'ca dao', 'than thoai', 'su thi'
  ],
  ENGL: [
    'choose the best', 'closest in meaning', 'opposite in meaning', 'underlined part',
    'passage', 'grammar', 'tense', 'passive voice', 'conditional', 'relative clause',
    'inversion', 'phrasal verb', 'collocation', 'pronunciation', 'stress', 'synonym',
    'antonym', 'vocabulary', 'reading comprehension', 'sentence transformation'
  ],
  HIST: [
    'cach mang', 'khang chien', 'chien tranh', 'trieu dai', 'phong kien', 'thuoc dia',
    'dang cong san', 'ho chi minh', 'dien bien phu', 'hiep dinh', 'giai phong',
    'the chien', 'chien tranh lanh', 'asean', 'lien hop quoc', 'doi moi', '1945', '1954', '1975'
  ],
  GEO: [
    'khi hau', 'dia hinh', 'song ngoi', 'dat dai', 'dan so', 'do thi hoa',
    'nong nghiep', 'cong nghiep', 'dich vu', 'vung kinh te', 'dong bang song hong',
    'dong bang song cuu long', 'tay nguyen', 'trung du', 'duyen hai', 'atlat',
    'xuat khau', 'nhap khau', 'gdp', 'co cau kinh te', 'bien dao', 'gio mua'
  ],
  LOGIC: [
    'suy luan', 'logic', 'menh de', 'bang so lieu', 'phan tich so lieu', 'ty trong',
    'toc do tang truong', 'sap xep cho ngoi', 'dieu kien can', 'neu thi', 'tu duy logic'
  ]
};

function countWholeKeywordHits(foldedText, keywords) {
  let hits = 0;
  for (const kw of keywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'g');
    const matches = foldedText.match(re);
    if (matches) {
      hits += matches.length * (kw.includes(' ') ? 2 : 1);
    }
  }
  return hits;
}

export function foldVietnamese(text) {
  if (!text) return '';
  return String(text)
    .normalize('NFC')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractTokens(folded) {
  const tokens = new Set();
  if (!folded) return tokens;
  const matches = folded.match(/[a-z0-9]{2,}/g) || [];
  for (const tok of matches) {
    if (!STOP_WORDS.has(tok)) tokens.add(tok);
  }
  return tokens;
}

export function extractGradeFromName(name) {
  const m = String(name || '').match(/l[oớ]p\s*(10|11|12)\b/i);
  return m ? Number(m[1]) : null;
}

export function detectNodeSubSubject(domainName, chapterName, lessonName) {
  const chapFold = foldVietnamese(chapterName);
  const domFold = foldVietnamese(domainName);
  const combined = `${chapFold} ${foldVietnamese(lessonName)}`;

  // 1. Explicit parenthetical / bracketed subject tag in chapter title (highest authority)
  const tagMatch = chapFold.match(/[([]([^)\]]+)[)\]]/);
  const tag = tagMatch ? tagMatch[1] : '';
  if (tag.includes('toan')) return 'MATH';
  if (tag.includes('vat li') || tag.includes('vat ly')) return 'PHYS';
  if (tag.includes('hoa hoc')) return 'CHEM';
  if (tag.includes('sinh hoc')) return 'BIOL';
  if (tag.includes('ngu van') || tag.includes('tieng viet')) return 'VIET';
  if (tag.includes('tieng anh')) return 'ENGL';
  if (tag.includes('lich su')) return 'HIST';
  if (tag.includes('dia li') || tag.includes('dia ly')) return 'GEO';
  if (tag.includes('gdkt') || tag.includes('gdcd') || tag.includes('kinh te')) return 'CIV';

  // 2. Domain-level signals
  if (domFold.includes('toan')) return 'MATH';
  if (domFold.includes('tieng anh')) return 'ENGL';
  if (domFold.includes('tieng viet') || domFold.includes('ngu van')) return 'VIET';
  if (domFold.includes('logic')) return 'LOGIC';

  // 3. Fallback title inspection
  if (combined.includes('hoa hoc') || combined.includes('ester') || combined.includes('ancol')) return 'CHEM';
  if (combined.includes('vat li') || combined.includes('dao dong') || combined.includes('dien truong')) return 'PHYS';
  if (combined.includes('sinh hoc') || combined.includes('te bao') || combined.includes('di truyen')) return 'BIOL';
  if (combined.includes('lich su') || combined.includes('khang chien')) return 'HIST';
  if (combined.includes('dia li') || combined.includes('khi hau')) return 'GEO';

  return 'GENERAL';
}

export function inferQuestionSubject(question, passageContent = '', examSubjectCode = 'GENERAL') {
  const upperExam = String(examSubjectCode || 'GENERAL').trim().toUpperCase();
  const rawStem = `${question?.content || ''} ${Object.values(question?.options || {}).join(' ')}`;
  const rawCombined = `${question?.suggestedSkillName || ''} ${rawStem} ${passageContent || ''}`;
  const textFold = foldVietnamese(rawCombined);
  const stemFold = foldVietnamese(rawStem);

  // 1. Nhận diện câu hỏi Tiếng Anh (ENGL) chính xác cao:
  // - Có cấu trúc gạch chân tìm lỗi sai <u>...</u> (A) ... (B) với từ tiếng Anh
  // - Hoặc chứa >= 2 từ chức năng/ngữ pháp tiếng Anh và mật độ dấu tiếng Việt trong stem rất thấp
  const viAccentCount = (String(question?.content || '').match(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi) || []).length;
  const englishWords = (
    stemFold.match(
      /\b(the|is|are|was|were|have|has|had|will|would|could|should|which|that|who|whom|whose|many|much|some|any|from|into|with|without|about|because|although|however|between|among|before|after|during|while|since|until|their|there|these|those|this|her|his|its|our|your|they|them|students|believe|difficult|actually|require|logical|thinking|rather|than|visited|museum|famous|collection|ancient|paintings|worried|ability|pass|coming|graduation|exams|elephants|niece|favorite|animal|smartest|animals|passage|following|according|choose|word|sentence|closest|opposite|meaning|underlined)\b/g
    ) || []
  ).length;

  if (
    (englishWords >= 2 && viAccentCount <= 2) ||
    englishWords >= 4 ||
    (/<u>[\s\S]+?<\/\s*\$?u/i.test(rawStem) && viAccentCount <= 2) ||
    textFold.includes('tieng anh') ||
    textFold.includes('english')
  ) {
    return 'ENGL';
  }

  // 2. Chấm điểm tín hiệu từ khóa nguyên từ (Word-boundary matching, không khớp chuỗi con 2 ký tự như 'ph', 'mu', 'tho')
  let bestSubject = null;
  let bestHits = 0;
  for (const [subj, keywords] of Object.entries(SUBJECT_SIGNALS)) {
    const hits = countWholeKeywordHits(textFold, keywords);
    if (hits > bestHits) {
      bestHits = hits;
      bestSubject = subj;
    }
  }

  if (bestHits >= 2) return bestSubject;
  if (upperExam && upperExam !== 'GENERAL') return upperExam;
  return bestSubject || 'GENERAL';
}

/**
 * Flatten GET /api/content/curriculum tree (Domain -> Chapter -> Lesson -> Pattern) into searchable node list.
 */
export function flattenCurriculumTree(curriculumDomains = []) {
  const nodes = [];
  const list = Array.isArray(curriculumDomains) ? curriculumDomains : [];

  for (const domain of list) {
    const domainId = domain.domainId || domain.id || '';
    const domainName = domain.title || domain.name || 'Tổng hợp';
    const domainCode = domain.domainCode || '';
    const chapters = Array.isArray(domain.chapters) ? domain.chapters : [];

    for (const chapter of chapters) {
      const chapterId = chapter.chapterId || chapter.id || '';
      const chapterName = chapter.name || chapter.title || '';
      const grade = extractGradeFromName(chapterName);
      const lessons = Array.isArray(chapter.lessons) ? chapter.lessons : [];

      if (lessons.length === 0 && chapterId) {
        const subSubject = detectNodeSubSubject(domainName, chapterName, '');
        const chapterFold = foldVietnamese(chapterName);
        const domainFold = foldVietnamese(domainName);
        nodes.push({
          skillId: chapterId,
          domainId,
          domainCode,
          domainName,
          chapterId,
          chapterName,
          lessonId: null,
          lessonName: '',
          patternId: chapterId,
          patternName: chapterName,
          grade,
          subSubject,
          domainFold,
          chapterFold,
          lessonFold: '',
          patternFold: chapterFold,
          searchText: `${domainFold} ${chapterFold}`,
          tokens: extractTokens(chapterFold)
        });
        continue;
      }

      for (const lesson of lessons) {
        const lessonId = lesson.lessonId || lesson.id || '';
        const lessonName = lesson.name || lesson.title || '';
        const patterns = Array.isArray(lesson.patterns) ? lesson.patterns : [];

        if (patterns.length === 0 && lessonId) {
          const subSubject = detectNodeSubSubject(domainName, chapterName, lessonName);
          const domainFold = foldVietnamese(domainName);
          const chapterFold = foldVietnamese(chapterName);
          const lessonFold = foldVietnamese(lessonName);
          nodes.push({
            skillId: lessonId,
            domainId,
            domainCode,
            domainName,
            chapterId,
            chapterName,
            lessonId,
            lessonName,
            patternId: lessonId,
            patternName: lessonName,
            grade,
            subSubject,
            domainFold,
            chapterFold,
            lessonFold,
            patternFold: lessonFold,
            searchText: `${domainFold} ${chapterFold} ${lessonFold}`,
            tokens: extractTokens(`${chapterFold} ${lessonFold}`)
          });
          continue;
        }

        for (const pattern of patterns) {
          const patternId = pattern.patternId || pattern.skillId || pattern.id || lessonId || chapterId;
          const patternName = pattern.name || pattern.patternName || lessonName;
          const subSubject = detectNodeSubSubject(domainName, chapterName, lessonName);
          const domainFold = foldVietnamese(domainName);
          const chapterFold = foldVietnamese(chapterName);
          const lessonFold = foldVietnamese(lessonName);
          const patternFold = foldVietnamese(patternName);

          nodes.push({
            skillId: patternId,
            domainId,
            domainCode,
            domainName,
            chapterId,
            chapterName,
            lessonId,
            lessonName,
            patternId,
            patternName,
            grade,
            subSubject,
            domainFold,
            chapterFold,
            lessonFold,
            patternFold,
            searchText: `${domainFold} ${chapterFold} ${lessonFold} ${patternFold}`,
            tokens: extractTokens(`${patternFold} ${lessonFold} ${chapterFold}`)
          });
        }
      }
    }
  }

  return nodes;
}

/**
 * Score & rank best matching Curriculum Nodes for a single exam question.
 */
export function matchQuestionToCurriculumNode(
  question,
  passageContent = '',
  examSubjectCode = 'GENERAL',
  flatNodes = []
) {
  if (!question || !Array.isArray(flatNodes) || flatNodes.length === 0) {
    return { bestNode: null, confidence: 0, topCandidates: [] };
  }

  const inferredSubj = inferQuestionSubject(question, passageContent, examSubjectCode);
  const skillFold = foldVietnamese(question.suggestedSkillName || '');
  const contentFold = foldVietnamese(question.content || '');
  const passageFold = foldVietnamese(passageContent || '');

  const skillTokens = extractTokens(skillFold);
  const contentTokens = extractTokens(contentFold);
  const passageTokens = extractTokens(passageFold);

  // Khóa chặt phân môn: Câu Tiếng Anh CHỈ khớp vào node Tiếng Anh, câu Toán CHỈ khớp vào node Toán/Logic...
  let candidateNodes = flatNodes;
  if (inferredSubj && inferredSubj !== 'GENERAL') {
    const strictMatches = flatNodes.filter((n) => {
      if (n.subSubject === inferredSubj) return true;
      if (inferredSubj === 'LOGIC' && n.subSubject === 'MATH') return true;
      return false;
    });
    if (strictMatches.length > 0) {
      candidateNodes = strictMatches;
    }
  }

  const scored = [];

  for (const node of candidateNodes) {
    let score = 0;

    // 1. Direct phrase containment boost
    if (skillFold.length >= 4) {
      if (node.patternFold && (node.patternFold.includes(skillFold) || (skillFold.includes(node.patternFold) && node.patternFold.length >= 5))) {
        score += 6.0;
      } else if (node.lessonFold && (node.lessonFold.includes(skillFold) || (skillFold.includes(node.lessonFold) && node.lessonFold.length >= 5))) {
        score += 4.8;
      } else if (node.chapterFold && node.chapterFold.includes(skillFold)) {
        score += 3.0;
      }
    }

    // 2. Weighted token overlap
    let skillOverlap = 0;
    for (const t of skillTokens) {
      if (node.tokens.has(t)) skillOverlap++;
    }
    let contentOverlap = 0;
    for (const t of contentTokens) {
      if (node.tokens.has(t)) contentOverlap++;
    }
    let passageOverlap = 0;
    for (const t of passageTokens) {
      if (node.tokens.has(t)) passageOverlap++;
    }

    score += skillOverlap * 2.5 + contentOverlap * 1.25 + passageOverlap * 0.65;

    // 2.5. Ngữ cảnh chuyên biệt cho Tiếng Anh (vì tên chương Tiếng Anh trong SGK là tiếng Việt/Anh hỗn hợp)
    if (inferredSubj === 'ENGL') {
      score += 1.0; // Base score cho mọi node Tiếng Anh hợp lệ
      const nodeText = node.searchText;
      if (/\b(which|that|who|whom|whose)\b/.test(contentFold) && (nodeText.includes('menh de quan he') || nodeText.includes('relative'))) {
        score += 4.5;
      }
      if (/\b(had|were|should|if|would|could)\b/.test(contentFold) && (nodeText.includes('modal') || nodeText.includes('conditional') || nodeText.includes('dieu kien'))) {
        score += 4.5;
      }
      if (/<u>/i.test(question.content || '') && (nodeText.includes('ngu phap') || nodeText.includes('cau truc') || nodeText.includes('hoa hop') || nodeText.includes('tu loai') || nodeText.includes('menh de'))) {
        score += 2.5;
      }
      if ((passageFold.length > 80 || /\b(passage|paragraph|title|author)\b/.test(contentFold)) && (nodeText.includes('doc hieu') || nodeText.includes('reading'))) {
        score += 4.5;
      }
    }

    // 3. Subject alignment bonus / cross-subject penalty
    if (inferredSubj && inferredSubj !== 'GENERAL' && node.subSubject && node.subSubject !== 'GENERAL') {
      if (inferredSubj === node.subSubject) {
        score += 2.2;
      } else {
        score -= 8.0;
      }
    }

    if (score <= 0.2) continue;

    const normalizedScore = score / Math.sqrt(Math.max(node.tokens.size, 3));
    if (normalizedScore > 0.25) {
      scored.push({ node, score: normalizedScore });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const topCandidates = scored.slice(0, 5).map(({ node, score }) => ({
    node,
    confidence: Math.min(0.95, Math.max(0.45, Number((0.42 + Math.min(score * 0.14, 0.53)).toFixed(2))))
  }));

  if (topCandidates.length === 0) {
    return { bestNode: null, confidence: 0, topCandidates: [] };
  }

  return {
    bestNode: topCandidates[0].node,
    confidence: topCandidates[0].confidence,
    topCandidates
  };
}

function buildCurriculumNodeRef(node, { confidence = 0.85, matchSource = 'auto', reason = '' } = {}) {
  if (!node) return null;
  return {
    skillId: node.skillId,
    domainId: node.domainId || null,
    domainName: node.domainName || '',
    chapterId: node.chapterId || null,
    chapterName: node.chapterName || '',
    lessonId: node.lessonId || null,
    lessonName: node.lessonName || '',
    patternId: node.patternId || node.skillId,
    patternName: node.patternName || '',
    confidence,
    matchSource,
    reason
  };
}

/**
 * Automatically map all unmapped questions (or all when force=true) in an Exam to real Curriculum Nodes.
 */
export function autoMapExamQuestions(exam, flatNodes = [], { force = false } = {}) {
  if (!exam || !Array.isArray(flatNodes) || flatNodes.length === 0) return exam;

  const nodeBySkillId = new Map();
  for (const n of flatNodes) {
    if (n.skillId) nodeBySkillId.set(String(n.skillId).toLowerCase(), n);
  }

  const mapSingle = (q, passageContent = '') => {
    const inferredSubj = inferQuestionSubject(q, passageContent, exam.subjectCode);
    // Hydrate existing DB / manual node if present and not forced, UNLESS it has a cross-subject mismatch (e.g. English mapped to Physics/Chemistry)
    if (!force && q.curriculumNode?.skillId) {
      const existing = nodeBySkillId.get(String(q.curriculumNode.skillId).toLowerCase());
      const existingSubj = existing?.subSubject || detectNodeSubSubject(
        q.curriculumNode.domainName,
        q.curriculumNode.chapterName,
        q.curriculumNode.lessonName
      );
      const isCrossSubjectError =
        q.curriculumNode.matchSource !== 'manual' &&
        inferredSubj &&
        inferredSubj !== 'GENERAL' &&
        existingSubj &&
        existingSubj !== 'GENERAL' &&
        existingSubj !== inferredSubj &&
        !(inferredSubj === 'LOGIC' && existingSubj === 'MATH');

      if (!isCrossSubjectError) {
        if (existing) {
          return {
            ...q,
            curriculumNode: {
              ...buildCurriculumNodeRef(existing, {
                confidence: q.curriculumNode.confidence ?? 1.0,
                matchSource: q.curriculumNode.matchSource || 'database',
                reason: q.curriculumNode.reason || 'Liên kết trực tiếp từ cây Khung chương trình'
              })
            }
          };
        }
        if (q.curriculumNode.chapterName || q.curriculumNode.lessonName) {
          return q;
        }
      }
    }

    const { bestNode, confidence } = matchQuestionToCurriculumNode(
      q,
      passageContent,
      exam.subjectCode,
      flatNodes
    );
    if (!bestNode) return q;

    return {
      ...q,
      curriculumNode: buildCurriculumNodeRef(bestNode, {
        confidence,
        matchSource: 'auto',
        reason: 'Nhận diện tự động từ nội dung câu hỏi & kỹ năng gợi ý'
      })
    };
  };

  return {
    ...exam,
    passages: (exam.passages || []).map((p) => ({
      ...p,
      questions: (p.questions || []).map((q) => mapSingle(q, p.content))
    })),
    singleQuestions: (exam.singleQuestions || []).map((q) => mapSingle(q, ''))
  };
}

/**
 * Apply AI Engine classification response (`POST /api/ai-engine/exams/classify-nodes`) onto exam state.
 */
export function applyAiNodeMappingsToExam(exam, mappings = [], flatNodes = []) {
  if (!exam || !Array.isArray(mappings) || mappings.length === 0) return exam;

  const nodeBySkillId = new Map();
  for (const n of flatNodes) {
    if (n.skillId) nodeBySkillId.set(String(n.skillId).toLowerCase(), n);
  }

  const mappingByQNum = new Map();
  for (const m of mappings) {
    const qNum = Number(m.question_number ?? m.questionNumber);
    if (qNum > 0) mappingByQNum.set(qNum, m);
  }

  const applyToQuestion = (q) => {
    const m = mappingByQNum.get(Number(q.questionNumber));
    if (!m) return q;

    const skillId = m.skill_id ?? m.skillId ?? '';
    const treeNode = skillId ? nodeBySkillId.get(String(skillId).toLowerCase()) : null;
    const confidence = Number(m.confidence ?? 0.88);
    const bloom = Number(m.bloom_level ?? m.bloomLevel);

    const curriculumNode = treeNode
      ? buildCurriculumNodeRef(treeNode, {
          confidence,
          matchSource: 'ai',
          reason: m.reason || 'AI phân loại theo cây Khung chương trình'
        })
      : {
          skillId,
          domainId: m.domain_id ?? m.domainId ?? null,
          domainName: m.domain_name ?? m.domainName ?? '',
          chapterId: m.chapter_id ?? m.chapterId ?? null,
          chapterName: m.chapter_name ?? m.chapterName ?? '',
          lessonId: m.lesson_id ?? m.lessonId ?? null,
          lessonName: m.lesson_name ?? m.lessonName ?? '',
          patternId: m.pattern_id ?? m.patternId ?? skillId,
          patternName: m.pattern_name ?? m.patternName ?? q.suggestedSkillName,
          confidence,
          matchSource: 'ai',
          reason: m.reason || 'AI phân loại theo cây Khung chương trình'
        };

    return {
      ...q,
      suggestedSkillName: curriculumNode.patternName || q.suggestedSkillName,
      difficultyLevel: bloom >= 1 && bloom <= 6 ? bloom : q.difficultyLevel,
      curriculumNode
    };
  };

  return {
    ...exam,
    passages: (exam.passages || []).map((p) => ({
      ...p,
      questions: (p.questions || []).map(applyToQuestion)
    })),
    singleQuestions: (exam.singleQuestions || []).map(applyToQuestion)
  };
}

/**
 * Compute live Exam Blueprint Specification Matrix (by Domain, Chapter, Lesson & Bloom level).
 */
export function buildExamBlueprintStats(exam) {
  const allQuestions = [];
  if (exam) {
    (exam.passages || []).forEach((p) => (p.questions || []).forEach((q) => allQuestions.push(q)));
    (exam.singleQuestions || []).forEach((q) => allQuestions.push(q));
  }
  allQuestions.sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));

  const totalQuestions = allQuestions.length;
  let mappedCount = 0;
  let highConfidenceCount = 0;

  const domainMap = new Map();
  const chapterMap = new Map();
  const bloomMap = new Map();
  BLOOM_LEVELS.forEach((b) => bloomMap.set(b.level, { level: b.level, label: b.label, short: b.short, count: 0 }));

  for (const q of allQuestions) {
    const bLvl = Math.min(6, Math.max(1, Number(q.difficultyLevel) || 2));
    const bEntry = bloomMap.get(bLvl);
    if (bEntry) bEntry.count += 1;

    const node = q.curriculumNode;
    if (node && (node.chapterName || node.lessonName || node.domainName)) {
      mappedCount += 1;
      if ((node.confidence ?? 1) >= 0.75 || node.matchSource === 'manual' || node.matchSource === 'database') {
        highConfidenceCount += 1;
      }

      const dName = node.domainName || 'Khác';
      if (!domainMap.has(dName)) {
        domainMap.set(dName, { domainName: dName, count: 0, questionNumbers: [] });
      }
      const dObj = domainMap.get(dName);
      dObj.count += 1;
      dObj.questionNumbers.push(q.questionNumber);

      const cKey = node.chapterId || node.chapterName || `${dName}::Chưa phân chương`;
      const cName = node.chapterName || 'Chưa phân chương';
      if (!chapterMap.has(cKey)) {
        chapterMap.set(cKey, {
          chapterKey: cKey,
          chapterName: cName,
          domainName: dName,
          count: 0,
          questionNumbers: [],
          lessonMap: new Map()
        });
      }
      const cObj = chapterMap.get(cKey);
      cObj.count += 1;
      cObj.questionNumbers.push(q.questionNumber);

      const lName = node.lessonName || node.patternName || 'Tổng hợp chương';
      if (!cObj.lessonMap.has(lName)) {
        cObj.lessonMap.set(lName, { lessonName: lName, count: 0, questionNumbers: [] });
      }
      const lObj = cObj.lessonMap.get(lName);
      lObj.count += 1;
      lObj.questionNumbers.push(q.questionNumber);
    }
  }

  const byDomain = [...domainMap.values()]
    .map((d) => ({
      ...d,
      percent: totalQuestions > 0 ? Math.round((d.count / totalQuestions) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  const byChapter = [...chapterMap.values()]
    .map((c) => ({
      chapterKey: c.chapterKey,
      chapterName: c.chapterName,
      domainName: c.domainName,
      count: c.count,
      percent: totalQuestions > 0 ? Math.round((c.count / totalQuestions) * 100) : 0,
      questionNumbers: c.questionNumbers,
      lessons: [...c.lessonMap.values()].sort((a, b) => b.count - a.count)
    }))
    .sort((a, b) => b.count - a.count);

  const byBloom = [...bloomMap.values()].map((b) => ({
    ...b,
    percent: totalQuestions > 0 ? Math.round((b.count / totalQuestions) * 100) : 0
  }));

  return {
    totalQuestions,
    mappedCount,
    unmappedCount: totalQuestions - mappedCount,
    highConfidenceCount,
    coveragePercent: totalQuestions > 0 ? Math.round((mappedCount / totalQuestions) * 100) : 0,
    byDomain,
    byChapter,
    byBloom
  };
}

