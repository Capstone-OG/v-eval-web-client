/**
 * Exam Organizer, Reordering, Shuffling & Bloom 6-Level Draft Utilities
 * Pure, immutable state transformations for:
 *  - Sequential renumbering (1..N) across Passages & Single Questions
 *  - Drag-and-drop block reordering & in-passage question reordering
 *  - Smart sorting by Bloom level (L1 -> L6) or Curriculum Domain/Chapter/Lesson
 *  - Exam version shuffling (preserving passage clusters) & option A/B/C/D shuffling with correct-key remapping
 *  - Moving questions into/out of Reading Passages
 *  - Converting AI Bloom 6-level generated exercises into Review Queue drafts
 */

import { buildOrderedExamView, nextLocalId, normalizeOptionLetter } from './examParserUtils.js';

export const BLOOM_LEVEL_DETAILS = [
  {
    level: 1,
    code: 'L1',
    name: 'Nhận biết',
    shortDesc: 'Nhớ khái niệm, định nghĩa, công thức cơ bản',
    color: 'slate',
    chipClass: 'bg-slate-100 text-slate-700 border-slate-300',
    activeClass: 'bg-slate-800 text-white border-slate-800'
  },
  {
    level: 2,
    code: 'L2',
    name: 'Thông hiểu',
    shortDesc: 'Giải thích bản chất, phân biệt, áp dụng 1 bước',
    color: 'emerald',
    chipClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    activeClass: 'bg-emerald-700 text-white border-emerald-700'
  },
  {
    level: 3,
    code: 'L3',
    name: 'Vận dụng',
    shortDesc: 'Tính toán nhiều bước, giải bài toán quen thuộc',
    color: 'cyan',
    chipClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    activeClass: 'bg-cyan-700 text-white border-cyan-700'
  },
  {
    level: 4,
    code: 'L4',
    name: 'Phân tích',
    shortDesc: 'Phân tích đồ thị, bảng số liệu, nhiều giả thiết',
    color: 'indigo',
    chipClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    activeClass: 'bg-indigo-700 text-white border-indigo-700'
  },
  {
    level: 5,
    code: 'L5',
    name: 'Đánh giá',
    shortDesc: 'Nhận định đúng/sai phức hợp, so sánh phương án tối ưu',
    color: 'amber',
    chipClass: 'bg-amber-50 text-amber-800 border-amber-200',
    activeClass: 'bg-amber-600 text-white border-amber-600'
  },
  {
    level: 6,
    code: 'L6',
    name: 'Sáng tạo',
    shortDesc: 'Tổng hợp liên môn, mô hình hóa bài toán thực tế mới',
    color: 'purple',
    chipClass: 'bg-purple-50 text-purple-800 border-purple-200',
    activeClass: 'bg-purple-700 text-white border-purple-700'
  }
];

function rebuildExamFromOrderedBlocks(exam, orderedBlocks) {
  let cursor = 1;
  const nextPassages = [];
  const nextSingles = [];

  for (const blk of orderedBlocks) {
    if (blk.type === 'passage') {
      const p = blk.data;
      const startQuestion = cursor;
      const renumberedQs = (p.questions || []).map((q) => ({
        ...q,
        questionNumber: cursor++
      }));
      const endQuestion = renumberedQs.length > 0 ? cursor - 1 : startQuestion;
      nextPassages.push({
        ...p,
        startQuestion,
        endQuestion,
        questions: renumberedQs
      });
    } else {
      nextSingles.push({
        ...blk.data,
        questionNumber: cursor++
      });
    }
  }

  return {
    ...exam,
    passages: nextPassages,
    singleQuestions: nextSingles
  };
}

/**
 * Renumber all exam questions continuously from 1 to N while keeping current visual block order.
 */
export function renumberExamSequentially(exam) {
  if (!exam) return exam;
  const { items } = buildOrderedExamView(exam);
  return rebuildExamFromOrderedBlocks(exam, items);
}

/**
 * Reorder top-level exam blocks (single question or passage cluster) from `fromIndex` to `toIndex`.
 */
export function reorderExamBlocks(exam, fromIndex, toIndex) {
  if (!exam) return exam;
  const { items } = buildOrderedExamView(exam);
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return exam;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return rebuildExamFromOrderedBlocks(exam, next);
}

/**
 * Reorder child questions inside a specific Reading Passage and renumber continuously.
 */
export function reorderQuestionsInPassage(exam, passageLocalId, fromIdx, toIdx) {
  if (!exam) return exam;
  const { items } = buildOrderedExamView(exam);
  const next = items.map((blk) => {
    if (blk.type !== 'passage' || blk.data.localId !== passageLocalId) return blk;
    const qs = [...(blk.data.questions || [])];
    if (fromIdx < 0 || toIdx < 0 || fromIdx >= qs.length || toIdx >= qs.length || fromIdx === toIdx) {
      return blk;
    }
    const [moved] = qs.splice(fromIdx, 1);
    qs.splice(toIdx, 0, moved);
    return { ...blk, data: { ...blk.data, questions: qs } };
  });
  return rebuildExamFromOrderedBlocks(exam, next);
}

function getBlockBloomScore(blk) {
  if (blk.type === 'question') {
    return Number(blk.data.difficultyLevel) || 2;
  }
  const qs = blk.data.questions || [];
  if (qs.length === 0) return 2;
  return qs.reduce((sum, q) => sum + (Number(q.difficultyLevel) || 2), 0) / qs.length;
}

/**
 * Sort exam blocks by Bloom difficulty level (L1 -> L6 ascending or L6 -> L1 descending) and renumber 1..N.
 */
export function sortExamByBloom(exam, ascending = true) {
  if (!exam) return exam;
  const { items } = buildOrderedExamView(exam);
  const sorted = [...items].sort((a, b) => {
    const diff = getBlockBloomScore(a) - getBlockBloomScore(b);
    if (Math.abs(diff) > 0.001) return ascending ? diff : -diff;
    return (a.order || 0) - (b.order || 0);
  });
  return rebuildExamFromOrderedBlocks(exam, sorted);
}

function getBlockCurriculumSortKey(blk) {
  const sampleQ = blk.type === 'question' ? blk.data : blk.data.questions?.[0];
  const node = sampleQ?.curriculumNode;
  if (!node) return 'zzz||zzz||zzz';
  return `${node.domainName || 'zzz'}||${node.chapterName || 'zzz'}||${node.lessonName || 'zzz'}`;
}

/**
 * Group & sort exam blocks by Curriculum Domain -> Chapter -> Lesson and renumber 1..N.
 */
export function sortExamByCurriculumNode(exam) {
  if (!exam) return exam;
  const { items } = buildOrderedExamView(exam);
  const sorted = [...items].sort((a, b) => {
    const ka = getBlockCurriculumSortKey(a);
    const kb = getBlockCurriculumSortKey(b);
    const cmp = ka.localeCompare(kb, 'vi');
    if (cmp !== 0) return cmp;
    return getBlockBloomScore(a) - getBlockBloomScore(b);
  });
  return rebuildExamFromOrderedBlocks(exam, sorted);
}

/**
 * Fisher-Yates shuffle top-level exam blocks (keeps Passage clusters intact) and renumber 1..N.
 */
export function shuffleExamBlocks(exam, rng = Math.random) {
  if (!exam) return exam;
  const { items } = buildOrderedExamView(exam);
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return rebuildExamFromOrderedBlocks(exam, arr);
}

/**
 * Shuffle options A/B/C/D for a single question and accurately remap `correctOption`.
 */
export function shuffleOptionsForQuestion(question, rng = Math.random) {
  if (!question) return question;
  const keys = ['A', 'B', 'C', 'D'];
  const currentCorrect = normalizeOptionLetter(question.correctOption);
  const entries = keys.map((k) => ({
    text: question.options?.[k] ?? '',
    isCorrect: k === currentCorrect
  }));

  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }

  const nextOptions = {};
  let nextCorrect = 'A';
  keys.forEach((k, idx) => {
    nextOptions[k] = entries[idx].text;
    if (entries[idx].isCorrect) nextCorrect = k;
  });

  return {
    ...question,
    options: nextOptions,
    correctOption: nextCorrect
  };
}

/**
 * Shuffle options A/B/C/D across EVERY question in the exam (passages + singles).
 */
export function shuffleAllExamOptions(exam, rng = Math.random) {
  if (!exam) return exam;
  return {
    ...exam,
    passages: (exam.passages || []).map((p) => ({
      ...p,
      questions: (p.questions || []).map((q) => shuffleOptionsForQuestion(q, rng))
    })),
    singleQuestions: (exam.singleQuestions || []).map((q) => shuffleOptionsForQuestion(q, rng))
  };
}

/**
 * Move a single question into a target Reading Passage cluster and renumber 1..N.
 */
export function moveSingleQuestionIntoPassage(exam, questionLocalId, targetPassageLocalId) {
  if (!exam) return exam;
  const targetQ = (exam.singleQuestions || []).find((q) => q.localId === questionLocalId);
  if (!targetQ) return exam;

  const updated = {
    ...exam,
    singleQuestions: (exam.singleQuestions || []).filter((q) => q.localId !== questionLocalId),
    passages: (exam.passages || []).map((p) =>
      p.localId === targetPassageLocalId
        ? { ...p, questions: [...(p.questions || []), { ...targetQ }] }
        : p
    )
  };
  return renumberExamSequentially(updated);
}

/**
 * Detach a child question out of its Passage cluster into a standalone Single Question and renumber 1..N.
 */
export function detachQuestionFromPassage(exam, passageLocalId, questionLocalId) {
  if (!exam) return exam;
  let detachedQ = null;
  const nextPassages = (exam.passages || []).map((p) => {
    if (p.localId !== passageLocalId) return p;
    const found = (p.questions || []).find((q) => q.localId === questionLocalId);
    if (found) detachedQ = found;
    return { ...p, questions: (p.questions || []).filter((q) => q.localId !== questionLocalId) };
  });
  if (!detachedQ) return exam;

  const nextSingles = [
    ...(exam.singleQuestions || []),
    { ...detachedQ, questionNumber: (detachedQ.questionNumber || 1) + 0.5 }
  ];
  return renumberExamSequentially({
    ...exam,
    passages: nextPassages,
    singleQuestions: nextSingles
  });
}

/**
 * Duplicate a question (either standalone or inside its passage) and insert right after it.
 */
export function duplicateQuestionInExam(exam, questionLocalId, parentPassageLocalId = null) {
  if (!exam) return { exam, newQuestion: null };
  let created = null;

  if (parentPassageLocalId) {
    const nextPassages = (exam.passages || []).map((p) => {
      if (p.localId !== parentPassageLocalId) return p;
      const idx = (p.questions || []).findIndex((q) => q.localId === questionLocalId);
      if (idx < 0) return p;
      const src = p.questions[idx];
      created = {
        ...src,
        localId: nextLocalId('q'),
        questionId: null,
        options: { ...(src.options || {}) },
        curriculumNode: src.curriculumNode ? { ...src.curriculumNode } : null
      };
      const qs = [...p.questions];
      qs.splice(idx + 1, 0, created);
      return { ...p, questions: qs };
    });
    return {
      exam: renumberExamSequentially({ ...exam, passages: nextPassages }),
      newQuestion: created
    };
  }

  const { items } = buildOrderedExamView(exam);
  const idx = items.findIndex((blk) => blk.type === 'question' && blk.data.localId === questionLocalId);
  if (idx < 0) return { exam, newQuestion: null };
  const src = items[idx].data;
  created = {
    ...src,
    localId: nextLocalId('q'),
    questionId: null,
    options: { ...(src.options || {}) },
    curriculumNode: src.curriculumNode ? { ...src.curriculumNode } : null
  };
  const nextItems = [...items];
  nextItems.splice(idx + 1, 0, { type: 'question', order: src.questionNumber, data: created });
  return {
    exam: rebuildExamFromOrderedBlocks(exam, nextItems),
    newQuestion: created
  };
}

/**
 * Convert raw response item from `POST /api/ai-engine/textbooks/generate-exercises`
 * into a structured Review Queue Draft ready for instructor inspection & approval.
 */
export function normalizeGeneratedExerciseToDraft(raw, { bloomLevel = 2, curriculumNode = null } = {}) {
  const stripOptPrefix = (str) => String(str || '').replace(/^[A-D]\s*[.):-]\s*/i, '').trim();

  let optionsObj = { A: '', B: '', C: '', D: '' };
  if (Array.isArray(raw?.options)) {
    optionsObj = {
      A: stripOptPrefix(raw.options[0]),
      B: stripOptPrefix(raw.options[1]),
      C: stripOptPrefix(raw.options[2]),
      D: stripOptPrefix(raw.options[3])
    };
  } else if (raw?.options && typeof raw.options === 'object') {
    optionsObj = {
      A: stripOptPrefix(raw.options.A ?? raw.options.a),
      B: stripOptPrefix(raw.options.B ?? raw.options.b),
      C: stripOptPrefix(raw.options.C ?? raw.options.c),
      D: stripOptPrefix(raw.options.D ?? raw.options.d)
    };
  }

  const resolvedBloom = Math.min(
    6,
    Math.max(1, Number(raw?.bloomLevel ?? raw?.bloom_level ?? bloomLevel) || 2)
  );

  return {
    draftId: nextLocalId('ai_draft'),
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    insertedQuestionNumber: null,
    content: (raw?.stem ?? raw?.content ?? '').toString().trim(),
    options: optionsObj,
    correctOption: normalizeOptionLetter(raw?.correctIndex ?? raw?.correctOption ?? raw?.correct_option ?? 0),
    explanation: (raw?.solution ?? raw?.explanation ?? '').toString().trim(),
    difficultyLevel: resolvedBloom,
    suggestedSkillName: curriculumNode?.patternName || curriculumNode?.lessonName || 'Trắc nghiệm tổng hợp',
    curriculumNode: curriculumNode
      ? {
          ...curriculumNode,
          confidence: 1.0,
          matchSource: 'ai',
          reason: `AI sinh câu hỏi theo mức Bloom L${resolvedBloom}`
        }
      : null,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Convert an approved AI draft into an Exam Question ready to append into `singleQuestions`.
 */
export function convertDraftToExamQuestion(draft, questionNumber) {
  return {
    localId: nextLocalId('q'),
    questionId: null,
    questionNumber,
    pageNumber: 1,
    content: draft.content || '',
    options: {
      A: draft.options?.A || '',
      B: draft.options?.B || '',
      C: draft.options?.C || '',
      D: draft.options?.D || ''
    },
    correctOption: normalizeOptionLetter(draft.correctOption),
    explanation: draft.explanation || '',
    difficultyLevel: Number(draft.difficultyLevel) || 2,
    suggestedSkillName: draft.suggestedSkillName || draft.curriculumNode?.patternName || 'Trắc nghiệm tổng hợp',
    imageUrl: null,
    imageUserAttached: false,
    images: [],
    curriculumNode: draft.curriculumNode ? { ...draft.curriculumNode, matchSource: 'manual' } : null
  };
}
