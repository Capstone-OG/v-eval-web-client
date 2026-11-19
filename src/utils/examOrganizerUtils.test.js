import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  renumberExamSequentially,
  reorderExamBlocks,
  sortExamByBloom,
  sortExamByCurriculumNode,
  shuffleExamBlocks,
  shuffleOptionsForQuestion,
  moveSingleQuestionIntoPassage,
  detachQuestionFromPassage,
  duplicateQuestionInExam,
  normalizeGeneratedExerciseToDraft,
  convertDraftToExamQuestion
} from './examOrganizerUtils.js';
import { normalizeExamData } from './examParserUtils.js';

function makeSampleExam() {
  return normalizeExamData(
    {
      title: 'Đề mẫu sắp xếp',
      passages: [
        {
          localId: 'p_1',
          start_question: 10,
          end_question: 11,
          content: 'Ngữ cảnh bài đọc 1',
          questions: [
            {
              localId: 'q_p1',
              question_number: 10,
              content: 'Câu đọc 1',
              options: { A: '1', B: '2', C: '3', D: '4' },
              correct_option: 'B',
              difficulty_level: 4,
              skill_id: '11111111-1111-1111-1111-111111111111',
              domain_name: 'Ngôn ngữ',
              chapter_name: 'Chương 2: Đọc hiểu'
            },
            {
              localId: 'q_p2',
              question_number: 11,
              content: 'Câu đọc 2',
              options: { A: 'a', B: 'b', C: 'c', D: 'd' },
              correct_option: 'C',
              difficulty_level: 4
            }
          ]
        }
      ],
      single_questions: [
        {
          localId: 'q_s1',
          question_number: 5,
          content: 'Câu đơn dễ',
          options: { A: 'Đúng', B: 'Sai 1', C: 'Sai 2', D: 'Sai 3' },
          correct_option: 'A',
          difficulty_level: 1,
          skill_id: '22222222-2222-2222-2222-222222222222',
          domain_name: 'Toán học',
          chapter_name: 'Chương 1: Đạo hàm'
        },
        {
          localId: 'q_s2',
          question_number: 20,
          content: 'Câu đơn sáng tạo',
          options: { A: 'X', B: 'Y', C: 'Z', D: 'W' },
          correct_option: 'D',
          difficulty_level: 6
        }
      ]
    },
    { source: 'manual' }
  );
}

test('renumberExamSequentially renumbers continuously 1..N and syncs passage bounds', () => {
  const res = renumberExamSequentially(makeSampleExam());
  assert.equal(res.singleQuestions[0].questionNumber, 1);
  assert.equal(res.passages[0].startQuestion, 2);
  assert.equal(res.passages[0].endQuestion, 3);
  assert.equal(res.passages[0].questions[0].questionNumber, 2);
  assert.equal(res.passages[0].questions[1].questionNumber, 3);
  assert.equal(res.singleQuestions[1].questionNumber, 4);
});

test('reorderExamBlocks swaps top-level blocks and renumbers cleanly', () => {
  // Initial order: [q_s1 (5), passage p_1 (10-11), q_s2 (20)]
  // Move index 2 (q_s2) to index 0
  const res = reorderExamBlocks(makeSampleExam(), 2, 0);
  const qS2 = res.singleQuestions.find((q) => q.localId === 'q_s2');
  const qS1 = res.singleQuestions.find((q) => q.localId === 'q_s1');
  assert.equal(qS2.questionNumber, 1);
  assert.equal(qS1.questionNumber, 2);
  assert.equal(res.passages[0].startQuestion, 3);
  assert.equal(res.passages[0].endQuestion, 4);
});

test('sortExamByBloom sorts ascending L1 -> L6 and descending L6 -> L1', () => {
  const asc = sortExamByBloom(makeSampleExam(), true);
  assert.equal(asc.singleQuestions.find((q) => q.localId === 'q_s1').questionNumber, 1); // L1
  assert.equal(asc.passages[0].startQuestion, 2); // L4
  assert.equal(asc.singleQuestions.find((q) => q.localId === 'q_s2').questionNumber, 4); // L6

  const desc = sortExamByBloom(makeSampleExam(), false);
  assert.equal(desc.singleQuestions.find((q) => q.localId === 'q_s2').questionNumber, 1); // L6
  assert.equal(desc.passages[0].startQuestion, 2); // L4
  assert.equal(desc.singleQuestions.find((q) => q.localId === 'q_s1').questionNumber, 4); // L1
});

test('sortExamByCurriculumNode groups by Domain -> Chapter and shuffleExamBlocks preserves passage integrity', () => {
  const grouped = sortExamByCurriculumNode(makeSampleExam());
  // Ngôn ngữ comes before Toán học alphabetically in vi locale
  assert.equal(grouped.passages[0].startQuestion, 1);
  assert.equal(grouped.passages[0].endQuestion, 2);

  const shuffled = shuffleExamBlocks(makeSampleExam(), () => 0.1);
  assert.equal(shuffled.passages[0].endQuestion - shuffled.passages[0].startQuestion, 1);
});

test('shuffleOptionsForQuestion preserves correct answer content under its new letter', () => {
  const q = makeSampleExam().singleQuestions[0]; // correctOption = 'A', text = 'Đúng'
  const shuffled = shuffleOptionsForQuestion(q, () => 0.4);
  assert.equal(shuffled.options[shuffled.correctOption], 'Đúng');
});

test('moveSingleQuestionIntoPassage, detachQuestionFromPassage & duplicateQuestionInExam maintain consistency', () => {
  const moved = moveSingleQuestionIntoPassage(makeSampleExam(), 'q_s1', 'p_1');
  assert.equal(moved.passages[0].questions.length, 3);
  assert.equal(moved.singleQuestions.length, 1);

  const detached = detachQuestionFromPassage(moved, 'p_1', 'q_s1');
  assert.equal(detached.passages[0].questions.length, 2);
  assert.equal(detached.singleQuestions.length, 2);

  const { exam: duped, newQuestion } = duplicateQuestionInExam(makeSampleExam(), 'q_s1', null);
  assert.ok(newQuestion);
  assert.equal(duped.singleQuestions.length, 3);
});

test('normalizeGeneratedExerciseToDraft and convertDraftToExamQuestion keep Bloom L1-L6 and Curriculum Node intact', () => {
  const node = {
    skillId: '11111111-1111-1111-1111-111111111111',
    domainName: 'Toán học',
    chapterName: 'Chương 1: Đạo hàm',
    lessonName: 'Bài 2: Cực trị',
    patternName: 'Dạng 1: Cực trị hàm đa thức'
  };
  const draft = normalizeGeneratedExerciseToDraft(
    {
      stem: 'Tìm cực đại hàm $y = -x^3 + 3x$',
      options: ['A. $2$', 'B. $-2$', 'C. $0$', 'D. $1$'],
      correctIndex: 0,
      bloomLevel: 5,
      solution: 'Đạo hàm $y\' = -3x^2 + 3 = 0$'
    },
    { bloomLevel: 5, curriculumNode: node }
  );

  assert.equal(draft.status, 'pending');
  assert.equal(draft.difficultyLevel, 5);
  assert.equal(draft.correctOption, 'A');
  assert.equal(draft.options.A, '$2$');
  assert.equal(draft.curriculumNode?.skillId, node.skillId);

  const examQ = convertDraftToExamQuestion(draft, 15);
  assert.equal(examQ.questionNumber, 15);
  assert.equal(examQ.difficultyLevel, 5);
  assert.equal(examQ.curriculumNode?.matchSource, 'manual');
});

